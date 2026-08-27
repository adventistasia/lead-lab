<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_the_calendar(): void
    {
        $this->get(route('calendar'))
            ->assertRedirect(route('login'));
    }

    public function test_active_participants_and_administrators_can_view_month_events(): void
    {
        $participant = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $event = CalendarEvent::factory()->create([
            'title' => 'September launch briefing',
            'starts_at' => Carbon::parse('2026-08-28 10:00:00'),
            'ends_at' => Carbon::parse('2026-08-30 11:00:00'),
            'location' => 'Lead Lab studio',
            'live_broadcast_url' => 'https://example.com/lead-lab/live',
        ]);
        CalendarEvent::factory()->create([
            'starts_at' => Carbon::parse('2026-09-02 10:00:00'),
            'ends_at' => Carbon::parse('2026-09-02 11:00:00'),
        ]);

        $this->actingAs($participant)
            ->get(route('calendar', ['month' => '2026-08']))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('calendar')
                ->where('month', '2026-08')
                ->where('timezone', 'UTC')
                ->where('is_admin', false)
                ->has('events', 1)
                ->where('events.0.id', $event->id)
                ->where('events.0.location', 'Lead Lab studio')
                ->where('events.0.live_broadcast_url', 'https://example.com/lead-lab/live')
                ->where('events.0.start_date', '2026-08-28')
                ->where('events.0.end_date', '2026-08-30'),
            );

        $this->actingAs($admin)
            ->get(route('calendar', ['month' => '2026-08']))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('calendar')
                ->where('is_admin', true)
                ->has('events', 1),
            );
    }

    public function test_dashboard_exposes_the_next_three_events(): void
    {
        $participant = User::factory()->create();
        $first = CalendarEvent::factory()->create([
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
            'location' => 'Online',
            'live_broadcast_url' => 'https://example.com/live/first',
        ]);
        $second = CalendarEvent::factory()->create([
            'starts_at' => now()->addHours(3),
            'ends_at' => now()->addHours(4),
        ]);
        CalendarEvent::factory()->create([
            'starts_at' => now()->subHours(2),
            'ends_at' => now()->subHour(),
        ]);

        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->has('upcoming_events', 2)
                ->where('upcoming_events.0.id', $first->id)
                ->where('upcoming_events.0.location', 'Online')
                ->where('upcoming_events.0.live_broadcast_url', 'https://example.com/live/first')
                ->where('upcoming_events.1.id', $second->id),
            );
    }

    public function test_admin_can_create_a_published_event_from_the_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(
            route('admin.calendar-events.store', ['return_to' => 'dashboard']),
            [
                'title' => 'Lead Lab planning session',
                'starts_at' => '2026-08-28T10:00',
                'ends_at' => '2026-08-28T11:30',
                'description' => 'Align on the next program milestone.',
                'location' => 'Lead Lab studio',
                'live_broadcast_url' => 'https://example.com/lead-lab/planning',
            ],
        );

        $event = CalendarEvent::query()
            ->where('title', 'Lead Lab planning session')
            ->firstOrFail();

        $response
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas(
                'inertia.flash_data.toast.message',
                'Calendar event added.',
            );
        $this->assertSame('2026-08-28 10:00:00', $event->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-08-28 11:30:00', $event->ends_at->format('Y-m-d H:i:s'));
        $this->assertSame('Lead Lab studio', $event->location);
        $this->assertSame('https://example.com/lead-lab/planning', $event->live_broadcast_url);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'calendar_event_created',
            'subject_type' => CalendarEvent::class,
            'subject_id' => $event->id,
        ]);
        $this->assertSame(
            [
                'three_days_before' => true,
                'one_day_before' => true,
                'fifteen_minutes_before' => true,
            ],
            ActivityLog::query()
                ->where('subject_type', CalendarEvent::class)
                ->where('subject_id', $event->id)
                ->where('action', 'calendar_event_created')
                ->firstOrFail()
                ->metadata['reminders'],
        );
    }

    public function test_admin_can_edit_a_calendar_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $event = CalendarEvent::factory()->create([
            'title' => 'Original event',
            'starts_at' => Carbon::parse('2026-08-28 10:00:00'),
            'ends_at' => Carbon::parse('2026-08-28 11:00:00'),
        ]);

        $response = $this->actingAs($admin)->patch(
            route('admin.calendar-events.update', [
                'calendarEvent' => $event,
                'return_to' => 'calendar',
            ]),
            [
                'title' => 'Updated event',
                'starts_at' => '2026-08-29T13:00',
                'ends_at' => '2026-08-29T14:30',
                'description' => 'Updated event details.',
                'location' => 'Online',
                'live_broadcast_url' => 'https://example.com/lead-lab/updated',
                'remind_three_days_before' => false,
                'remind_one_day_before' => true,
                'remind_fifteen_minutes_before' => false,
            ],
        );

        $response->assertRedirect(route('calendar'));
        $event->refresh();
        $this->assertSame('Updated event', $event->title);
        $this->assertSame('2026-08-29 13:00:00', $event->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame('Updated event details.', $event->description);
        $this->assertSame('Online', $event->location);
        $this->assertSame('https://example.com/lead-lab/updated', $event->live_broadcast_url);
        $this->assertFalse($event->remind_three_days_before);
        $this->assertTrue($event->remind_one_day_before);
        $this->assertFalse($event->remind_fifteen_minutes_before);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'calendar_event_updated',
            'subject_type' => CalendarEvent::class,
            'subject_id' => $event->id,
        ]);
    }

    public function test_admin_can_delete_a_calendar_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $event = CalendarEvent::factory()->create(['title' => 'Event to delete']);

        $this->actingAs($admin)
            ->delete(route('admin.calendar-events.destroy', [
                'calendarEvent' => $event,
                'return_to' => 'calendar',
            ]))
            ->assertRedirect(route('calendar'));

        $this->assertDatabaseMissing('calendar_events', ['id' => $event->id]);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'calendar_event_deleted',
            'subject_type' => CalendarEvent::class,
            'subject_id' => $event->id,
        ]);
    }

    public function test_non_admins_cannot_create_calendar_events(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->post(route('admin.calendar-events.store'), [
                'title' => 'Unauthorized event',
                'starts_at' => '2026-08-28T10:00',
                'ends_at' => '2026-08-28T11:00',
                'description' => 'This should not be saved.',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('calendar_events', [
            'title' => 'Unauthorized event',
        ]);
    }

    public function test_non_admins_cannot_edit_or_delete_calendar_events(): void
    {
        $participant = User::factory()->create();
        $event = CalendarEvent::factory()->create(['title' => 'Protected event']);

        $this->actingAs($participant)
            ->patch(route('admin.calendar-events.update', $event), [
                'title' => 'Unauthorized update',
                'starts_at' => '2026-08-28T10:00',
                'ends_at' => '2026-08-28T11:00',
                'description' => 'This should not be saved.',
            ])
            ->assertForbidden();

        $this->actingAs($participant)
            ->delete(route('admin.calendar-events.destroy', $event))
            ->assertForbidden();

        $this->assertDatabaseHas('calendar_events', [
            'id' => $event->id,
            'title' => 'Protected event',
        ]);
    }

    public function test_event_end_must_be_after_event_start(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.calendar-events.store'), [
                'title' => 'Invalid event window',
                'starts_at' => '2026-08-28T11:00',
                'ends_at' => '2026-08-28T10:00',
                'description' => 'This should not be saved.',
            ])
            ->assertSessionHasErrors('ends_at');

        $this->assertDatabaseMissing('calendar_events', [
            'title' => 'Invalid event window',
        ]);
    }

    public function test_live_broadcast_link_must_use_http_or_https(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.calendar-events.store'), [
                'title' => 'Invalid broadcast link',
                'starts_at' => '2026-08-28T10:00',
                'ends_at' => '2026-08-28T11:00',
                'description' => 'This should not be saved.',
                'live_broadcast_url' => 'ftp://example.com/live',
            ])
            ->assertSessionHasErrors('live_broadcast_url');

        $this->assertDatabaseMissing('calendar_events', [
            'title' => 'Invalid broadcast link',
        ]);
    }

    public function test_calendar_event_creation_is_logged_with_the_admin_actor(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.calendar-events.store'), [
            'title' => 'Audited calendar event',
            'starts_at' => '2026-08-28T10:00',
            'ends_at' => '2026-08-28T11:00',
            'description' => 'An event used to verify activity logging.',
        ])->assertRedirect();

        $event = CalendarEvent::query()
            ->where('title', 'Audited calendar event')
            ->firstOrFail();

        $this->assertTrue(
            ActivityLog::query()
                ->where('actor_id', $admin->id)
                ->where('action', 'calendar_event_created')
                ->where('subject_type', CalendarEvent::class)
                ->where('subject_id', $event->id)
                ->exists(),
        );
    }
}
