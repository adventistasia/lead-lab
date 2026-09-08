<?php

namespace Tests\Feature;

use App\Jobs\SendCalendarEventReminder;
use App\Models\CalendarEvent;
use App\Models\CalendarEventReminderDelivery;
use App\Models\User;
use App\Notifications\CalendarEventReminderNotification;
use App\Services\CalendarEventReminderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CalendarReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_events_enable_all_reminders_by_default(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.calendar-events.store'), [
            'title' => 'Default reminder event',
            'starts_at' => '2026-08-29T10:00',
            'ends_at' => '2026-08-29T11:00',
            'description' => 'An event with default reminders.',
        ])->assertRedirect();

        $event = CalendarEvent::query()
            ->where('title', 'Default reminder event')
            ->firstOrFail();

        $this->assertTrue($event->remind_three_days_before);
        $this->assertTrue($event->remind_one_day_before);
        $this->assertTrue($event->remind_fifteen_minutes_before);
    }

    public function test_admin_can_configure_each_event_reminder(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.calendar-events.store'), [
            'title' => 'Configured reminder event',
            'starts_at' => '2026-08-29T10:00',
            'ends_at' => '2026-08-29T11:00',
            'description' => 'An event with selected reminders.',
            'remind_three_days_before' => false,
            'remind_one_day_before' => true,
            'remind_fifteen_minutes_before' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Configured reminder event',
            'remind_three_days_before' => false,
            'remind_one_day_before' => true,
            'remind_fifteen_minutes_before' => false,
        ]);
    }

    public function test_due_reminders_are_queued_for_active_verified_participants_and_administrators(): void
    {
        Queue::fake();
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        $participant = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->unverified()->create();
        User::factory()->create([
            'is_active' => false,
            'access_status' => User::ACCESS_REVOKED,
        ]);
        $event = CalendarEvent::factory()->create([
            'starts_at' => now()->addDays(3),
            'ends_at' => now()->addDays(3)->addHour(),
        ]);

        $queued = app(CalendarEventReminderService::class)->dispatchDue();

        $this->assertSame(2, $queued);
        $this->assertDatabaseCount('calendar_event_reminder_deliveries', 2);
        $this->assertDatabaseHas('calendar_event_reminder_deliveries', [
            'calendar_event_id' => $event->id,
            'user_id' => $participant->id,
            'offset_minutes' => CalendarEvent::REMINDER_THREE_DAYS,
            'status' => CalendarEventReminderDelivery::STATUS_QUEUED,
        ]);
        $this->assertDatabaseHas('calendar_event_reminder_deliveries', [
            'calendar_event_id' => $event->id,
            'user_id' => $admin->id,
            'offset_minutes' => CalendarEvent::REMINDER_THREE_DAYS,
            'status' => CalendarEventReminderDelivery::STATUS_QUEUED,
        ]);
        Queue::assertPushed(SendCalendarEventReminder::class, 2);

        $this->travelBack();
    }

    public function test_due_reminders_are_not_queued_twice(): void
    {
        Queue::fake();
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        User::factory()->create();
        CalendarEvent::factory()->create([
            'starts_at' => now()->addDays(3),
            'ends_at' => now()->addDays(3)->addHour(),
        ]);

        $service = app(CalendarEventReminderService::class);

        $this->assertSame(1, $service->dispatchDue());
        $this->assertSame(0, $service->dispatchDue());
        Queue::assertPushed(SendCalendarEventReminder::class, 1);

        $this->travelBack();
    }

    public function test_reminders_that_elapsed_before_event_creation_are_skipped(): void
    {
        Queue::fake();
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        User::factory()->create();
        CalendarEvent::factory()->create([
            'created_at' => now(),
            'updated_at' => now(),
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addHour(),
        ]);

        $queued = app(CalendarEventReminderService::class)->dispatchDue();

        $this->assertSame(0, $queued);
        Queue::assertNothingPushed();

        $this->travelBack();
    }

    public function test_reminder_job_sends_mail_and_marks_delivery_sent(): void
    {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        $user = User::factory()->create();
        $event = CalendarEvent::factory()->create([
            'starts_at' => now()->addMinutes(15),
            'ends_at' => now()->addMinutes(75),
        ]);
        $delivery = CalendarEventReminderDelivery::query()->create([
            'calendar_event_id' => $event->id,
            'user_id' => $user->id,
            'offset_minutes' => CalendarEvent::REMINDER_FIFTEEN_MINUTES,
            'scheduled_for' => now(),
            'status' => CalendarEventReminderDelivery::STATUS_QUEUED,
            'queued_at' => now(),
        ]);

        (new SendCalendarEventReminder($delivery->id))->handle();

        Notification::assertSentTo(
            $user,
            CalendarEventReminderNotification::class,
            function (CalendarEventReminderNotification $notification) use ($event): bool {
                return $notification->event->is($event)
                    && $notification->offsetMinutes === CalendarEvent::REMINDER_FIFTEEN_MINUTES;
            },
        );
        $this->assertDatabaseHas('calendar_event_reminder_deliveries', [
            'id' => $delivery->id,
            'status' => CalendarEventReminderDelivery::STATUS_SENT,
        ]);

        $this->travelBack();
    }

    public function test_reminder_notification_contains_event_details_and_calendar_action(): void
    {
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        $user = User::factory()->create([
            'name' => 'Lead Hub Admin',
            'timezone' => 'Asia/Manila',
        ]);
        $event = CalendarEvent::factory()->create([
            'title' => 'September briefing',
            'starts_at' => now()->addDays(1),
            'ends_at' => now()->addDays(1)->addHour(),
            'location' => 'Lead Hub studio',
            'live_broadcast_url' => 'https://example.com/live',
            'description' => 'Bring the launch checklist.',
        ]);

        $message = (new CalendarEventReminderNotification(
            $event,
            CalendarEvent::REMINDER_ONE_DAY,
        ))->toMail($user);

        $this->assertSame('Reminder: September briefing', $message->subject);
        $this->assertSame('Hello Lead Hub Admin,', $message->greeting);
        $this->assertContains('Event: September briefing', $message->introLines);
        $this->assertContains('Location: Lead Hub studio', $message->introLines);
        $this->assertContains('Live broadcast: https://example.com/live', $message->introLines);
        $this->assertContains('Bring the launch checklist.', $message->introLines);
        $this->assertContains('Starts: Thursday, August 27, 2026 at 6:00 PM +08:00', $message->introLines);
        $this->assertContains('Ends: Thursday, August 27, 2026 at 7:00 PM +08:00', $message->introLines);
        $this->assertSame('Open calendar', $message->actionText);
        $this->assertStringContainsString('/calendar?month=', $message->actionUrl);
        $this->assertContains('Times are shown in GMT+8 (Asia/Manila).', $message->outroLines);

        $this->travelBack();
    }

    public function test_reminder_notification_uses_the_event_date_timezone_offset(): void
    {
        $user = User::factory()->create([
            'timezone' => 'America/New_York',
        ]);
        $event = CalendarEvent::factory()->create([
            'starts_at' => Carbon::parse('2026-01-15 15:00:00', 'UTC'),
            'ends_at' => Carbon::parse('2026-01-15 16:00:00', 'UTC'),
        ]);

        $message = (new CalendarEventReminderNotification(
            $event,
            CalendarEvent::REMINDER_ONE_DAY,
        ))->toMail($user);

        $this->assertContains('Starts: Thursday, January 15, 2026 at 10:00 AM -05:00', $message->introLines);
        $this->assertContains('Ends: Thursday, January 15, 2026 at 11:00 AM -05:00', $message->introLines);
        $this->assertContains('Times are shown in GMT-5 (America/New_York).', $message->outroLines);
    }

    public function test_reminder_job_releases_delivery_when_event_time_changes(): void
    {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-08-26 10:00:00'));

        $user = User::factory()->create();
        $event = CalendarEvent::factory()->create([
            'starts_at' => now()->addMinutes(15),
            'ends_at' => now()->addMinutes(75),
        ]);
        $delivery = CalendarEventReminderDelivery::query()->create([
            'calendar_event_id' => $event->id,
            'user_id' => $user->id,
            'offset_minutes' => CalendarEvent::REMINDER_FIFTEEN_MINUTES,
            'scheduled_for' => now(),
            'status' => CalendarEventReminderDelivery::STATUS_QUEUED,
            'queued_at' => now(),
        ]);
        $event->update([
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
        ]);

        (new SendCalendarEventReminder($delivery->id))->handle();

        Notification::assertNothingSent();
        $this->assertDatabaseHas('calendar_event_reminder_deliveries', [
            'id' => $delivery->id,
            'status' => CalendarEventReminderDelivery::STATUS_PENDING,
        ]);

        $this->travelBack();
    }
}
