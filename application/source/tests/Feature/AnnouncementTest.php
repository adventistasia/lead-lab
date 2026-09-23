<?php

namespace Tests\Feature;

use App\Jobs\SendAnnouncementEmail;
use App\Models\Announcement;
use App\Models\AnnouncementEmailDelivery;
use App\Models\User;
use App\Notifications\AnnouncementPublishedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Markdown;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_an_announcement_as_a_draft(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.announcements.store'), [
            'title' => 'September learning rhythm',
            'summary' => 'A short update about the next learning cycle.',
            'body' => "## What is changing?\n\n**The next cycle starts soon.**",
        ]);

        $announcement = Announcement::query()
            ->where('title', 'September learning rhythm')
            ->firstOrFail();

        $response->assertRedirect(route('admin.announcements.edit', $announcement));
        $this->assertSame(Announcement::STATUS_DRAFT, $announcement->status);
        $this->assertFalse($announcement->is_pinned);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'announcement_created',
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);
    }

    public function test_admin_cannot_save_unsupported_announcement_markup(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.announcements.store'), [
            'title' => 'Unsafe update',
            'summary' => 'This should not be saved.',
            'body' => '<script>alert("xss")</script>',
        ]);

        $response->assertSessionHasErrors('body');
        $this->assertDatabaseCount('announcements', 0);
    }

    public function test_admin_cannot_save_announcement_images_or_unsafe_links(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach ([
            '![diagram](https://example.com/image.png)',
            '[unsafe](javascript:alert(1))',
        ] as $body) {
            $this->actingAs($admin)
                ->post(route('admin.announcements.store'), [
                    'title' => 'Unsafe update',
                    'summary' => 'This should not be saved.',
                    'body' => $body,
                ])
                ->assertSessionHasErrors('body');
        }

        $this->assertDatabaseCount('announcements', 0);
    }

    public function test_publishing_queues_one_email_for_each_eligible_recipient(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create();
        $moderator = User::factory()->create(['role' => 'moderator']);
        User::factory()->unverified()->create();
        User::factory()->create([
            'is_active' => false,
            'access_status' => User::ACCESS_REVOKED,
        ]);
        $announcement = Announcement::factory()->draft()->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.announcements.publish', $announcement))
            ->assertRedirect(route('admin.announcements.index'));

        $this->assertTrue($announcement->refresh()->isPublished());
        $this->assertDatabaseCount('announcement_email_deliveries', 3);
        $this->assertDatabaseHas('announcement_email_deliveries', [
            'announcement_id' => $announcement->id,
            'user_id' => $participant->id,
            'status' => AnnouncementEmailDelivery::STATUS_QUEUED,
        ]);
        $this->assertDatabaseHas('announcement_email_deliveries', [
            'announcement_id' => $announcement->id,
            'user_id' => $moderator->id,
            'status' => AnnouncementEmailDelivery::STATUS_QUEUED,
        ]);
        Queue::assertPushed(SendAnnouncementEmail::class, 3);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'announcement_published',
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);
    }

    public function test_publishing_an_announcement_twice_does_not_queue_duplicate_email(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $announcement = Announcement::factory()->draft()->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.announcements.publish', $announcement))
            ->assertRedirect();
        $this->actingAs($admin)
            ->patch(route('admin.announcements.publish', $announcement))
            ->assertRedirect();

        $this->assertDatabaseCount('announcement_email_deliveries', 1);
        Queue::assertPushed(SendAnnouncementEmail::class, 1);
    }

    public function test_editing_a_published_announcement_does_not_queue_more_email(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $announcement = Announcement::factory()->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.announcements.update', $announcement), [
                'title' => 'Edited published title',
                'summary' => 'Edited summary.',
                'body' => 'Edited body.',
            ])
            ->assertRedirect(route('admin.announcements.edit', $announcement));

        $this->assertDatabaseCount('announcement_email_deliveries', 0);
        Queue::assertNothingPushed();
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'announcement_updated',
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);
    }

    public function test_announcement_job_sends_mail_and_marks_delivery_sent(): void
    {
        Notification::fake();
        $recipient = User::factory()->create([
            'name' => 'Lead Hub Participant',
            'timezone' => 'Asia/Manila',
        ]);
        $announcement = Announcement::factory()->create([
            'title' => 'September briefing',
            'summary' => 'Bring your questions to the next briefing.',
            'published_at' => now(),
        ]);
        $delivery = AnnouncementEmailDelivery::query()->create([
            'announcement_id' => $announcement->id,
            'user_id' => $recipient->id,
            'status' => AnnouncementEmailDelivery::STATUS_QUEUED,
            'queued_at' => now(),
        ]);

        (new SendAnnouncementEmail($delivery->id))->handle();

        Notification::assertSentTo(
            $recipient,
            AnnouncementPublishedNotification::class,
            fn (AnnouncementPublishedNotification $notification): bool => $notification->announcement->is($announcement),
        );
        $this->assertDatabaseHas('announcement_email_deliveries', [
            'id' => $delivery->id,
            'status' => AnnouncementEmailDelivery::STATUS_SENT,
            'attempts' => 1,
        ]);
    }

    public function test_announcement_notification_contains_summary_and_protected_link(): void
    {
        $publishedAt = Carbon::create(2026, 9, 22, 12, 0, 0, 'UTC');
        $recipient = User::factory()->create([
            'name' => 'Lead Hub Participant',
            'timezone' => 'Asia/Manila',
        ]);
        $announcement = Announcement::factory()->create([
            'title' => 'September briefing',
            'summary' => 'Bring your questions to the next briefing.',
            'published_at' => $publishedAt,
        ]);

        $message = (new AnnouncementPublishedNotification($announcement))->toMail($recipient);

        $this->assertSame(
            'New LEADHub announcement: September briefing',
            $message->subject,
        );
        $this->assertContains(
            'Bring your questions to the next briefing.',
            $message->introLines,
        );
        $this->assertContains(
            'Published: '.$publishedAt->copy()->setTimezone('Asia/Manila')->format('l, F j, Y \\a\\t g:i A'),
            $message->introLines,
        );
        $this->assertSame('Read announcement', $message->actionText);
        $this->assertSame(route('announcements.show', $announcement), $message->actionUrl);
        $renderedText = (string) app(Markdown::class)->renderText(
            $message->markdown,
            $message->data(),
        );
        $this->assertStringContainsString('Read announcement:', $renderedText);
        $this->assertStringContainsString(route('announcements.show', $announcement), $renderedText);
    }

    public function test_portal_announcement_time_uses_saved_timezone_and_gmt8_fallback(): void
    {
        $publishedAt = Carbon::create(2026, 9, 22, 12, 0, 0, 'UTC');
        $announcement = Announcement::factory()->create([
            'published_at' => $publishedAt,
        ]);
        $user = User::factory()->create(['timezone' => 'Invalid/Timezone']);

        $this->actingAs($user)
            ->get(route('announcements.show', $announcement))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('announcements/show')
                ->where(
                    'announcement.published_at_label',
                    $publishedAt->copy()->setTimezone(User::DEFAULT_TIMEZONE)->format('M j, Y g:i A'),
                )
                ->where('timezone_label', 'GMT+8 (Asia/Manila)'),
            );

        $user->update(['timezone' => 'America/New_York']);

        $this->actingAs($user)
            ->get(route('announcements.show', $announcement))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where(
                    'announcement.published_at_label',
                    $publishedAt->copy()->setTimezone('America/New_York')->format('M j, Y g:i A'),
                )
                ->where('timezone_label', 'GMT-4 (America/New_York)'),
            );
    }

    public function test_active_users_can_read_published_announcements_but_not_drafts_or_archived_items(): void
    {
        $participant = User::factory()->create();
        $published = Announcement::factory()->create();
        $draft = Announcement::factory()->draft()->create();
        $archived = Announcement::factory()->archived()->create();

        $this->actingAs($participant)
            ->get(route('announcements.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('announcements/index')
                ->has('announcements.data', 1)
                ->where('announcements.data.0.id', $published->id),
            );
        $this->actingAs($participant)
            ->get(route('announcements.show', $published))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('announcements/show')
                ->where('announcement.id', $published->id)
                ->where('announcement.body_html', fn (string $body): bool => str_contains($body, '<h2>Update</h2>')),
            );
        $this->actingAs($participant)
            ->get(route('announcements.show', $draft))
            ->assertNotFound();
        $this->actingAs($participant)
            ->get(route('announcements.show', $archived))
            ->assertNotFound();
    }

    public function test_dashboard_exposes_two_published_announcements_with_pinned_items_first(): void
    {
        $participant = User::factory()->create();
        $pinnedOlder = Announcement::factory()->create([
            'is_pinned' => true,
            'published_at' => now()->subMinutes(4),
        ]);
        $pinnedNewer = Announcement::factory()->create([
            'is_pinned' => true,
            'published_at' => now()->subMinutes(3),
        ]);
        Announcement::factory()->create([
            'published_at' => now()->subMinute(),
        ]);
        Announcement::factory()->create([
            'published_at' => now()->subMinutes(2),
        ]);

        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('announcements', 2)
                ->where('announcements.0.id', $pinnedNewer->id)
                ->where('announcements.1.id', $pinnedOlder->id),
            );
    }

    public function test_archived_announcement_can_be_republished_without_resending_email(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $originalPublishedAt = Carbon::create(2026, 9, 22, 12, 0, 0, 'UTC');
        $announcement = Announcement::factory()->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
            'is_pinned' => true,
            'published_at' => $originalPublishedAt,
        ]);
        $delivery = AnnouncementEmailDelivery::query()->create([
            'announcement_id' => $announcement->id,
            'user_id' => User::factory()->create()->id,
            'status' => AnnouncementEmailDelivery::STATUS_QUEUED,
            'queued_at' => now(),
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.announcements.archive', $announcement))
            ->assertRedirect(route('admin.announcements.index'));

        $this->assertDatabaseHas('announcement_email_deliveries', [
            'id' => $delivery->id,
            'status' => AnnouncementEmailDelivery::STATUS_CANCELLED,
        ]);
        $this->actingAs($admin)
            ->get(route('announcements.show', $announcement))
            ->assertNotFound();
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'announcement_archived',
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);

        $republishedAt = Carbon::create(2026, 9, 23, 12, 0, 0, 'UTC');
        Carbon::setTestNow($republishedAt);

        try {
            $this->actingAs($admin)
                ->patch(route('admin.announcements.publish', $announcement))
                ->assertRedirect(route('admin.announcements.index'));
        } finally {
            Carbon::setTestNow();
        }

        $announcement->refresh();
        $this->assertTrue($announcement->isPublished());
        $this->assertFalse($announcement->is_pinned);
        $this->assertEquals($republishedAt, $announcement->published_at);
        $this->assertNull($announcement->archived_at);
        $this->assertDatabaseHas('announcement_email_deliveries', [
            'id' => $delivery->id,
            'status' => AnnouncementEmailDelivery::STATUS_CANCELLED,
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'announcement_republished',
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);
        Queue::assertNothingPushed();
        $this->actingAs($admin)
            ->get(route('announcements.show', $announcement))
            ->assertOk();
    }

    public function test_non_admins_cannot_manage_announcements(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->get(route('admin.announcements.index'))
            ->assertForbidden();
        $this->actingAs($participant)
            ->post(route('admin.announcements.store'), [
                'title' => 'Unauthorized',
                'summary' => 'Unauthorized',
                'body' => 'Unauthorized',
            ])
            ->assertForbidden();
    }
}
