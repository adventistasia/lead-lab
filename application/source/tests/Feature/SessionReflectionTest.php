<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SessionReflectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_view_orders_the_current_users_reflection_first(): void
    {
        $user = User::factory()->create(['name' => 'Current Participant']);
        $other = User::factory()->create(['name' => 'Other Participant']);
        $session = LearningSession::factory()->create();

        $session->reflections()->create([
            'user_id' => $other->id,
            'body' => 'Other reflection',
            'created_at' => now()->subDay(),
        ]);
        $session->reflections()->create([
            'user_id' => $user->id,
            'body' => 'My reflection',
        ]);

        $this->actingAs($user)
            ->get(route('sessions.show', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/show')
                ->where('session.reflections.0.body', 'My reflection')
                ->where('session.reflections.0.author.name', 'Current Participant')
                ->where('session.reflections.0.can_edit', true)
                ->where('session.reflections.1.body', 'Other reflection')
                ->where('session.reflections.1.can_edit', false));
    }

    public function test_participant_can_submit_one_reflection_per_session(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create();
        $url = route('sessions.reflections.store', $session);

        $this->actingAs($user)
            ->post($url, ['body' => "A useful insight.\nI will apply it this week."])
            ->assertRedirect();

        $this->assertDatabaseHas('session_reflections', [
            'learning_session_id' => $session->id,
            'user_id' => $user->id,
            'body' => "A useful insight.\nI will apply it this week.",
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'action' => 'reflection_created',
        ]);
        $this->assertSame([], ActivityLog::query()->where('action', 'reflection_created')->firstOrFail()->metadata);

        $this->actingAs($user)
            ->from(route('sessions.show', $session))
            ->post($url, ['body' => 'A duplicate'])
            ->assertRedirect()
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('session_reflections', 1);
        $this->assertDatabaseHas('session_reflections', ['body' => "A useful insight.\nI will apply it this week."]);
    }

    public function test_reflection_validation_requires_non_blank_text_and_limits_length(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create();
        $url = route('sessions.reflections.store', $session);

        foreach ([
            '' => 'Enter a reflection',
            "  \n\t" => 'Enter a reflection',
            str_repeat('x', 5001) => 'Use 5,000 characters or fewer',
        ] as $body => $message) {
            $this->actingAs($user)
                ->post($url, ['body' => $body])
                ->assertSessionHasErrors(['body' => $message]);
        }

        $this->actingAs($user)
            ->post($url, ['body' => str_repeat('x', 5000)])
            ->assertRedirect();

        $this->assertDatabaseHas('session_reflections', ['body' => str_repeat('x', 5000)]);
    }

    public function test_author_can_edit_and_delete_a_reflection(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create();
        $reflection = $session->reflections()->create([
            'user_id' => $user->id,
            'body' => 'Original reflection',
        ]);
        $createdAt = $reflection->created_at;

        $this->actingAs($user)
            ->patch(route('sessions.reflections.update', [$session, $reflection]), [
                'body' => 'Updated reflection',
            ])
            ->assertRedirect();

        $reflection->refresh();
        $this->assertSame('Updated reflection', $reflection->body);
        $this->assertTrue($reflection->edited_at !== null);
        $this->assertTrue($reflection->created_at->equalTo($createdAt));
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'action' => 'reflection_updated',
            'subject_id' => $reflection->id,
        ]);

        $this->actingAs($user)
            ->delete(route('sessions.reflections.destroy', [$session, $reflection]))
            ->assertRedirect();

        $this->assertDatabaseMissing('session_reflections', ['id' => $reflection->id]);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'action' => 'reflection_deleted',
            'subject_id' => $reflection->id,
        ]);
    }

    public function test_participant_cannot_change_another_participants_reflection(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $session = LearningSession::factory()->create();
        $reflection = $session->reflections()->create([
            'user_id' => $owner->id,
            'body' => 'Keep this reflection',
        ]);

        $this->actingAs($other)
            ->patch(route('sessions.reflections.update', [$session, $reflection]), [
                'body' => 'Changed by someone else',
            ])
            ->assertForbidden();
        $this->actingAs($other)
            ->delete(route('sessions.reflections.destroy', [$session, $reflection]))
            ->assertForbidden();

        $this->assertDatabaseHas('session_reflections', [
            'id' => $reflection->id,
            'body' => 'Keep this reflection',
        ]);
    }

    public function test_administrator_can_delete_but_not_edit_another_participants_reflection(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create();
        $session = LearningSession::factory()->create();
        $reflection = $session->reflections()->create([
            'user_id' => $owner->id,
            'body' => 'Participant words',
        ]);

        $this->actingAs($admin)
            ->patch(route('sessions.reflections.update', [$session, $reflection]), [
                'body' => 'Admin rewrite',
            ])
            ->assertForbidden();

        $this->actingAs($admin)
            ->delete(route('sessions.reflections.destroy', [$session, $reflection]))
            ->assertRedirect();

        $this->assertDatabaseMissing('session_reflections', ['id' => $reflection->id]);
        $deletionLog = ActivityLog::query()
            ->where('actor_id', $admin->id)
            ->where('action', 'reflection_deleted')
            ->where('subject_id', $reflection->id)
            ->firstOrFail();

        $this->assertSame($session->id, $deletionLog->metadata['learning_session_id']);
        $this->assertSame($owner->id, $deletionLog->metadata['content_owner_id']);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'reflection_deleted',
            'subject_id' => $reflection->id,
        ]);
    }

    public function test_reflections_are_isolated_by_session_and_wrong_session_requests_are_denied(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create();
        $otherSession = LearningSession::factory()->create();
        $reflection = $otherSession->reflections()->create([
            'user_id' => $user->id,
            'body' => 'Other session reflection',
        ]);

        $this->actingAs($user)
            ->get(route('sessions.show', $session))
            ->assertInertia(fn (Assert $page) => $page->where('session.reflections', []));
        $this->actingAs($user)
            ->patch(route('sessions.reflections.update', [$session, $reflection]), [
                'body' => 'Wrong session',
            ])
            ->assertNotFound();
        $this->actingAs($user)
            ->delete(route('sessions.reflections.destroy', [$session, $reflection]))
            ->assertNotFound();
    }

    public function test_participant_cannot_use_reflections_on_an_unavailable_session(): void
    {
        $user = User::factory()->create();
        $draft = LearningSession::factory()->create(['is_published' => false]);
        $archived = LearningSession::factory()->create([
            'is_published' => true,
            'archived_at' => now(),
        ]);

        foreach ([$draft, $archived] as $session) {
            $this->actingAs($user)
                ->get(route('sessions.show', $session))
                ->assertNotFound();
            $this->actingAs($user)
                ->post(route('sessions.reflections.store', $session), ['body' => 'Blocked'])
                ->assertNotFound();
        }
    }
}
