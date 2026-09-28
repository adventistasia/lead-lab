<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\CalendarEvent;
use App\Models\LearningResource;
use App\Models\LearningSession;
use App\Models\SessionAnswer;
use App\Models\SessionQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_login_and_logout_are_attributed_to_the_user(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);

        $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])->assertRedirect();
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'signed_in']);

        $this->post(route('logout'))->assertRedirect();
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'signed_out']);
    }

    public function test_profile_logs_only_changed_field_names(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'New Name', 'email' => $user->email,
        ])->assertRedirect();

        $log = ActivityLog::query()->where('action', 'profile_updated')->firstOrFail();
        $this->assertSame(['fields' => ['name']], $log->metadata);
        $this->assertSame($user->id, $log->actor_id);

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'New Name', 'email' => $user->email,
        ])->assertRedirect();
        $this->assertSame(1, ActivityLog::query()->where('action', 'profile_updated')->count());
    }

    public function test_learning_and_announcement_views_ignore_prefetch_and_denied_requests(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create(['is_published' => true]);
        $draft = LearningSession::factory()->create(['is_published' => false]);
        $announcement = Announcement::factory()->create(['status' => Announcement::STATUS_PUBLISHED, 'published_at' => now()]);

        $this->actingAs($user)->withHeader('X-Inertia-Prefetch', 'true')
            ->get(route('sessions.show', $session))->assertOk();
        $this->assertDatabaseMissing('activity_logs', ['action' => 'session_viewed']);
        $this->withoutHeader('X-Inertia-Prefetch');
        $this->actingAs($user)->get(route('sessions.show', $draft))->assertNotFound();
        $this->actingAs($user)->get(route('sessions.show', $session))->assertOk();
        $this->actingAs($user)->get(route('announcements.show', $announcement))->assertOk();

        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'session_viewed', 'subject_id' => $session->id]);
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'announcement_viewed', 'subject_id' => $announcement->id]);
    }

    public function test_material_request_is_logged_only_after_access_and_file_checks(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $session = LearningSession::factory()->create(['is_published' => true]);
        $resource = LearningResource::create([
            'learning_session_id' => $session->id,
            'title' => 'notes.txt',
            'stored_path' => 'resources/notes.txt',
            'mime_type' => 'text/plain',
            'size' => 5,
        ]);

        $this->actingAs($user)->get(route('resources.download', $resource))->assertNotFound();
        $this->assertDatabaseMissing('activity_logs', ['action' => 'resource_download_requested']);
        Storage::disk('local')->put('resources/notes.txt', 'notes');
        $this->actingAs($user)->get(route('resources.download', $resource))->assertOk();
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'resource_download_requested', 'subject_id' => $resource->id]);
    }

    public function test_question_answer_and_vote_actions_have_one_event_each(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create(['is_published' => true]);
        $this->actingAs($user)->post(route('sessions.questions.store', $session), ['title' => 'What next?'])->assertRedirect();
        $question = SessionQuestion::query()->firstOrFail();
        $this->actingAs($user)->post(route('questions.answers.store', $question), ['body' => 'Try this.'])->assertRedirect();
        $answer = SessionAnswer::query()->firstOrFail();
        $this->actingAs($user)->post(route('questions.vote', $question))->assertRedirect();
        $this->actingAs($user)->post(route('questions.vote', $question))->assertRedirect();
        $this->actingAs($user)->post(route('answers.vote', $answer))->assertRedirect();
        $this->actingAs($user)->post(route('answers.vote', $answer))->assertRedirect();

        foreach (['qna_question_created', 'qna_answer_created', 'qna_question_vote_added', 'qna_question_vote_removed', 'qna_answer_vote_added', 'qna_answer_vote_removed'] as $action) {
            $this->assertSame(1, ActivityLog::query()->where('action', $action)->where('actor_id', $user->id)->count());
        }
    }

    public function test_participant_edits_and_deletions_are_attributed_once_and_denied_edits_are_not_logged(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = LearningSession::factory()->create(['is_published' => true]);
        $question = $session->questions()->create(['user_id' => $user->id, 'title' => 'Question']);
        $answer = $question->answers()->create(['user_id' => $user->id, 'body' => 'Answer']);

        $this->actingAs($other)->patch(route('sessions.questions.update', [$session, $question]), ['title' => 'No'])->assertForbidden();
        $this->actingAs($user)->patch(route('sessions.questions.update', [$session, $question]), ['title' => 'Updated'])->assertRedirect();
        $this->actingAs($user)->patch(route('questions.answers.update', [$question, $answer]), ['body' => 'Updated'])->assertRedirect();
        $this->actingAs($user)->delete(route('questions.answers.destroy', [$question, $answer]))->assertRedirect();
        $this->actingAs($user)->delete(route('sessions.questions.destroy', [$session, $question]))->assertRedirect();

        foreach (['qna_question_updated', 'qna_answer_updated', 'qna_answer_deleted', 'qna_question_deleted'] as $action) {
            $this->assertSame(1, ActivityLog::query()->where('action', $action)->where('actor_id', $user->id)->count());
        }
        $this->assertSame(0, ActivityLog::query()->where('actor_id', $other->id)->count());
    }

    public function test_calendar_records_real_views_event_open_and_broadcast_click_only(): void
    {
        $user = User::factory()->create();
        $event = CalendarEvent::factory()->create(['live_broadcast_url' => 'https://example.com/live']);
        $this->actingAs($user)->withHeader('X-Inertia-Prefetch', 'true')->get(route('calendar'))->assertOk();
        $this->assertDatabaseMissing('activity_logs', ['action' => 'calendar_viewed']);
        $this->withoutHeader('X-Inertia-Prefetch');
        $this->actingAs($user)->get(route('calendar', ['month' => '2026-09']))->assertOk();
        $this->actingAs($user)->post(route('calendar.events.view', $event))->assertNoContent();
        $this->actingAs($user)->get(route('calendar.events.broadcast', $event))->assertRedirect('https://example.com/live');
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'calendar_viewed']);
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'calendar_event_viewed', 'subject_id' => $event->id]);
        $this->assertDatabaseHas('activity_logs', ['actor_id' => $user->id, 'action' => 'calendar_broadcast_clicked', 'subject_id' => $event->id]);
        $this->get(route('calendar.events.broadcast', 999999))->assertNotFound();
        $noLink = CalendarEvent::factory()->create(['live_broadcast_url' => null]);
        $this->get(route('calendar.events.broadcast', $noLink))->assertNotFound();
        $this->assertDatabaseMissing('activity_logs', ['action' => 'calendar_broadcast_clicked', 'subject_id' => $noLink->id]);
    }
}
