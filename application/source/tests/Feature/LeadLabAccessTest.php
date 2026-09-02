<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\LearningResource;
use App\Models\LearningSession;
use App\Models\SessionAnswer;
use App\Models\SessionQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeadLabAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_a_session_as_a_draft_with_a_protected_resource(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Build a repeatable lead rhythm',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A practical session for building a weekly operating rhythm.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            'resource' => UploadedFile::fake()->createWithContent('worksheet.txt', 'Lead Lab worksheet'),
        ]);

        $session = LearningSession::query()->where('title', 'Build a repeatable lead rhythm')->firstOrFail();
        $resource = LearningResource::query()->where('learning_session_id', $session->id)->firstOrFail();

        $response->assertRedirect(route('admin.sessions.index'));
        $this->assertFalse($session->is_published);
        $this->assertSame('Execution rhythm', $session->season);
        $this->assertSame('worksheet.txt', $resource->title);
        Storage::disk('local')->assertExists($resource->stored_path);
    }

    public function test_admin_can_save_a_session_from_classroom_and_return_to_classroom(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(
            route('admin.sessions.store', ['return_to' => 'classroom']),
            [
                'title' => 'Classroom-created session',
                'season' => 'Execution rhythm',
                'session_date' => '2026-08-29',
                'description' => 'A session created from the administrator Classroom modal.',
                'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            ],
        );

        $response->assertRedirect(route('admin.classroom.index'));
        $this->assertDatabaseHas('learning_sessions', [
            'title' => 'Classroom-created session',
            'is_published' => false,
        ]);
    }

    public function test_admin_can_save_an_incomplete_session_as_a_draft(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Draft session in progress',
            'session_date' => '2026-09-05',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);

        $response->assertRedirect(route('admin.sessions.index'));
        $this->assertDatabaseHas('learning_sessions', [
            'title' => 'Draft session in progress',
            'season' => null,
            'description' => null,
            'is_published' => false,
        ]);
    }

    public function test_admin_can_update_a_draft_with_incomplete_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => false]);

        $this->actingAs($admin)
            ->post(route('admin.sessions.update', $session), [
                '_method' => 'PATCH',
                'title' => 'Draft details to finish later',
                'season' => '',
                'session_date' => '',
                'description' => '',
                'video_url' => '',
            ])
            ->assertRedirect(route('admin.sessions.index'));

        $this->assertDatabaseHas('learning_sessions', [
            'id' => $session->id,
            'title' => 'Draft details to finish later',
            'season' => null,
            'session_date' => null,
            'description' => null,
            'video_url' => null,
            'is_published' => false,
        ]);
    }

    public function test_admin_cannot_publish_an_incomplete_draft(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create([
            'season' => null,
            'session_date' => null,
            'description' => null,
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.sessions.publish', $session));

        $response
            ->assertRedirect()
            ->assertSessionHasErrors(['season', 'session_date', 'description'])
            ->assertSessionHas(
                'inertia.flash_data.toast.message',
                'Complete the required session details before publishing.',
            );
        $this->assertFalse($session->refresh()->is_published);
    }

    public function test_admin_cannot_clear_required_fields_on_a_published_session(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => true]);
        $originalSeason = $session->season;

        $response = $this->actingAs($admin)
            ->post(route('admin.sessions.update', $session), [
                '_method' => 'PATCH',
                'title' => $session->title,
                'season' => '',
                'session_date' => '',
                'description' => '',
                'video_url' => '',
            ]);

        $response->assertSessionHasErrors(['season', 'session_date', 'description']);
        $this->assertSame($originalSeason, $session->refresh()->season);
        $this->assertTrue($session->is_published);
    }

    public function test_admin_can_view_an_incomplete_draft_in_the_session_library_and_editor(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create([
            'season' => null,
            'session_date' => null,
            'description' => null,
            'is_published' => false,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.sessions.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.season', null)
                ->where('sessions.0.session_date', null),
            );

        $this->actingAs($admin)
            ->get(route('admin.sessions.edit', $session))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('session.id', $session->id)
                ->where('session.season', null)
                ->where('session.session_date', null)
                ->where('session.description', null),
            );
    }

    public function test_admin_can_publish_and_unpublish_a_session(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => false]);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.publish', $session))
            ->assertRedirect(route('admin.sessions.index'))
            ->assertSessionHas(
                'inertia.flash_data.toast.message',
                'Session published to the Lead Lab classroom.',
            );

        $this->assertTrue($session->refresh()->is_published);
        $this->actingAs($admin)
            ->get(route('admin.sessions.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.is_published', true),
            );

        $this->actingAs($admin)
            ->patch(route('admin.sessions.unpublish', $session))
            ->assertRedirect(route('admin.sessions.index'));

        $this->assertFalse($session->refresh()->is_published);
        $this->actingAs($admin)
            ->get(route('admin.sessions.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.is_published', false),
            );
    }

    public function test_admin_classroom_lifecycle_actions_return_to_classroom(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => false]);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.publish', [
                'learningSession' => $session,
                'return_to' => 'classroom',
            ]))
            ->assertRedirect(route('admin.classroom.index'));

        $this->assertTrue($session->refresh()->is_published);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.unpublish', [
                'learningSession' => $session,
                'return_to' => 'classroom',
            ]))
            ->assertRedirect(route('admin.classroom.index'));

        $this->assertFalse($session->refresh()->is_published);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.archive', [
                'learningSession' => $session,
                'return_to' => 'classroom',
            ]))
            ->assertRedirect(route('admin.classroom.index'));

        $this->assertNotNull($session->refresh()->archived_at);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.restore', [
                'learningSession' => $session,
                'return_to' => 'classroom',
            ]))
            ->assertRedirect(route('admin.classroom.index'));

        $this->assertNull($session->refresh()->archived_at);
        $this->assertFalse($session->is_published);
    }

    public function test_admin_classroom_reflects_lifecycle_changes_after_navigation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => false]);

        $this->actingAs($admin)
            ->patch(route('admin.sessions.publish', $session))
            ->assertRedirect(route('admin.sessions.index'));

        $this->actingAs($admin)
            ->get(route('admin.classroom.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('sessions', 1)
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.is_published', true)
                ->where('sessions.0.is_archived', false),
            );

        $this->actingAs($admin)
            ->patch(route('admin.sessions.archive', $session))
            ->assertRedirect(route('admin.sessions.index'));

        $this->actingAs($admin)
            ->get(route('admin.classroom.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('sessions', 1)
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.is_published', true)
                ->where('sessions.0.is_archived', true),
            );
    }

    public function test_admin_can_edit_session_fields_and_replace_a_protected_resource(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create([
            'title' => 'Original session title',
            'video_url' => 'https://www.youtube.com/watch?v=oldVideo123',
        ]);
        $oldPath = 'lead-lab/resources/original.txt';
        Storage::disk('local')->put($oldPath, 'Original material');
        $session->resources()->create([
            'title' => 'original.txt',
            'stored_path' => $oldPath,
            'mime_type' => 'text/plain',
            'size' => 17,
        ]);

        $response = $this->actingAs($admin)->post(
            route('admin.sessions.update', $session),
            [
                '_method' => 'PATCH',
                'title' => 'Updated session title',
                'season' => 'Conversation skills',
                'session_date' => '2026-09-01',
                'description' => 'The updated session description.',
                'video_url' => 'https://youtu.be/newVideo456',
                'resource' => UploadedFile::fake()->createWithContent(
                    'updated.txt',
                    'Updated material',
                ),
            ],
        );

        $session->refresh();
        $resource = $session->resources()->firstOrFail();

        $response
            ->assertRedirect(route('admin.sessions.index'))
            ->assertSessionHas(
                'inertia.flash_data.toast.message',
                'Session changes saved.',
            );
        $this->assertSame('Updated session title', $session->title);
        $this->assertSame('Conversation skills', $session->season);
        $this->assertSame('2026-09-01', $session->session_date->toDateString());
        $this->assertSame('The updated session description.', $session->description);
        $this->assertSame(
            'https://www.youtube.com/watch?v=newVideo456',
            $session->video_url,
        );
        $this->assertSame('updated.txt', $resource->title);
        $this->assertNotSame($oldPath, $resource->stored_path);
        Storage::disk('local')->assertMissing($oldPath);
        Storage::disk('local')->assertExists($resource->stored_path);
    }

    public function test_admin_can_open_the_session_editor_from_classroom_actions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create([
            'title' => 'Editable classroom session',
            'description' => 'Edit this session from Classroom actions.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.sessions.edit', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('admin/sessions/index')
                ->where('session.id', $session->id)
                ->where('session.title', 'Editable classroom session')
                ->where('session.description', 'Edit this session from Classroom actions.')
                ->where('session.video_url', 'https://www.youtube.com/watch?v=abc123XYZ01'),
            );
    }

    public function test_admin_can_save_a_full_youtube_embed_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Embed code session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A session created from a pasted YouTube embed code.',
            'video_url' => '<iframe src="https://www.youtube.com/embed/abc123XYZ01?si=demo" title="Session recording"></iframe>',
        ]);

        $session = LearningSession::query()->where('title', 'Embed code session')->firstOrFail();

        $response->assertRedirect(route('admin.sessions.index'));
        $this->assertSame(
            'https://www.youtube.com/watch?v=abc123XYZ01',
            $session->video_url,
        );
    }

    public function test_admin_session_actions_are_logged(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Audited session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A session used to verify administrative activity logging.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ])->assertRedirect();

        $session = LearningSession::query()->where('title', 'Audited session')->firstOrFail();

        $this->actingAs($admin)->patch(route('admin.sessions.update', $session), [
            'title' => 'Updated audited session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-29',
            'description' => 'Updated session details.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ])->assertRedirect();

        $this->actingAs($admin)->patch(route('admin.sessions.publish', $session))->assertRedirect();
        $this->actingAs($admin)->patch(route('admin.sessions.unpublish', $session))->assertRedirect();
        $this->actingAs($admin)->patch(route('admin.sessions.archive', $session))->assertRedirect();
        $this->actingAs($admin)->patch(route('admin.sessions.restore', $session))->assertRedirect();

        foreach ([
            'session_created',
            'session_updated',
            'session_published',
            'session_unpublished',
            'session_archived',
            'session_restored',
        ] as $action) {
            $this->assertDatabaseHas('activity_logs', [
                'actor_id' => $admin->id,
                'action' => $action,
                'subject_type' => LearningSession::class,
                'subject_id' => $session->id,
            ]);
        }
    }

    public function test_admin_can_save_a_short_youtube_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Short URL session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A session created from a short YouTube URL.',
            'video_url' => 'https://youtu.be/abc123XYZ01',
        ])->assertRedirect(route('admin.sessions.index'));

        $this->assertDatabaseHas('learning_sessions', [
            'title' => 'Short URL session',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);
    }

    public function test_admin_can_save_a_youtube_embed_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Embed URL session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A session created from a YouTube embed URL.',
            'video_url' => 'https://www.youtube.com/embed/abc123XYZ01',
        ])->assertRedirect(route('admin.sessions.index'));

        $this->assertDatabaseHas('learning_sessions', [
            'title' => 'Embed URL session',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);
    }

    public function test_admin_cannot_save_a_non_youtube_video_reference(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Invalid video session',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'This should not be saved.',
            'video_url' => 'https://vimeo.com/123456789',
        ]);

        $response->assertSessionHasErrors('video_url');
        $this->assertDatabaseMissing('learning_sessions', [
            'title' => 'Invalid video session',
        ]);
    }

    public function test_participants_can_view_published_sessions_and_download_resources(): void
    {
        Storage::fake('local');
        $participant = User::factory()->create();
        $session = LearningSession::factory()->create([
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);
        $resource = $session->resources()->create([
            'title' => 'Session notes.txt',
            'stored_path' => 'lead-lab/resources/session-notes.txt',
            'mime_type' => 'text/plain',
            'size' => 12,
        ]);
        Storage::disk('local')->put($resource->stored_path, 'Session notes');

        $page = $this->actingAs($participant)->get(route('sessions.show', $session));

        $page->assertOk();
        $page->assertInertia(fn (Assert $assert) => $assert
            ->component('sessions/show')
            ->where(
                'session.video_embed_url',
                'https://www.youtube-nocookie.com/embed/abc123XYZ01?controls=0&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A8000',
            )
            ->has('session.resources', 1),
        );

        $download = $this->actingAs($participant)->get(route('resources.download', $resource));

        $download->assertDownload('Session notes.txt');
    }

    public function test_active_users_can_view_session_questions_and_answers(): void
    {
        $participant = User::factory()->create(['name' => 'Participant One']);
        $author = User::factory()->create(['name' => 'Question Author']);
        $session = LearningSession::factory()->create([
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);
        $question = $session->questions()->create([
            'user_id' => $author->id,
            'title' => 'How should I apply this session?',
            'details' => 'I would like to use this in my next weekly review.',
        ]);
        $answer = $question->answers()->create([
            'user_id' => $author->id,
            'body' => 'Start with one small change and review it next week.',
        ]);
        $question->votes()->create(['user_id' => $participant->id]);
        $answer->votes()->create(['user_id' => $participant->id]);

        $this->actingAs($participant)
            ->get(route('sessions.show', [$session, 'tab' => 'q-and-a']))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('sessions/show')
                ->where('session.initial_tab', 'q-and-a')
                ->where('session.questions.0.title', 'How should I apply this session?')
                ->where('session.questions.0.details', 'I would like to use this in my next weekly review.')
                ->where('session.questions.0.votes_count', 1)
                ->where('session.questions.0.has_voted', true)
                ->where('session.questions.0.answers.0.body', 'Start with one small change and review it next week.')
                ->where('session.questions.0.answers.0.votes_count', 1)
                ->where('session.questions.0.answers.0.has_voted', true),
            );
    }

    public function test_active_users_can_create_edit_delete_and_vote_on_q_and_a_content(): void
    {
        $author = User::factory()->create();
        $answerer = User::factory()->create();
        $session = LearningSession::factory()->create();

        $this->actingAs($author)
            ->post(route('sessions.questions.store', $session), [
                'title' => 'What is the first step?',
                'details' => 'Please share a practical starting point.',
            ])
            ->assertRedirect();

        $question = $session->questions()->firstOrFail();

        $this->actingAs($answerer)
            ->post(route('questions.answers.store', $question), [
                'body' => 'Start by writing down the smallest next action.',
            ])
            ->assertRedirect();

        $answer = $question->answers()->firstOrFail();

        $this->actingAs($answerer)
            ->post(route('questions.vote', $question))
            ->assertRedirect();
        $this->assertDatabaseHas('session_question_votes', [
            'session_question_id' => $question->id,
            'user_id' => $answerer->id,
        ]);

        $this->actingAs($answerer)
            ->post(route('questions.vote', $question))
            ->assertRedirect();
        $this->assertDatabaseMissing('session_question_votes', [
            'session_question_id' => $question->id,
            'user_id' => $answerer->id,
        ]);

        $this->actingAs($answerer)
            ->post(route('answers.vote', $answer))
            ->assertRedirect();
        $this->assertDatabaseHas('session_answer_votes', [
            'session_answer_id' => $answer->id,
            'user_id' => $answerer->id,
        ]);

        $this->actingAs($author)
            ->patch(route('sessions.questions.update', [$session, $question]), [
                'title' => 'Updated first step',
                'details' => 'Updated practical context.',
            ])
            ->assertRedirect();

        $this->actingAs($answerer)
            ->patch(route('questions.answers.update', [$question, $answer]), [
                'body' => 'Start with one documented next action.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('session_questions', [
            'id' => $question->id,
            'title' => 'Updated first step',
        ]);
        $this->assertDatabaseHas('session_answers', [
            'id' => $answer->id,
            'body' => 'Start with one documented next action.',
        ]);

        $this->actingAs($answerer)
            ->delete(route('questions.answers.destroy', [$question, $answer]))
            ->assertRedirect();
        $this->assertDatabaseMissing('session_answers', ['id' => $answer->id]);

        $this->actingAs($author)
            ->delete(route('sessions.questions.destroy', [$session, $question]))
            ->assertRedirect();
        $this->assertDatabaseMissing('session_questions', ['id' => $question->id]);
    }

    public function test_users_cannot_manage_other_users_q_and_a_content_but_admins_can(): void
    {
        $author = User::factory()->create();
        $otherParticipant = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create();
        $question = $session->questions()->create([
            'user_id' => $author->id,
            'title' => 'Owner question',
            'details' => null,
        ]);
        $answer = $question->answers()->create([
            'user_id' => $author->id,
            'body' => 'Owner answer',
        ]);

        $this->actingAs($otherParticipant)
            ->patch(route('sessions.questions.update', [$session, $question]), [
                'title' => 'Unauthorized edit',
                'details' => null,
            ])
            ->assertForbidden();
        $this->actingAs($otherParticipant)
            ->delete(route('questions.answers.destroy', [$question, $answer]))
            ->assertForbidden();

        $this->actingAs($admin)
            ->patch(route('sessions.questions.update', [$session, $question]), [
                'title' => 'Admin edit',
                'details' => null,
            ])
            ->assertRedirect();
        $this->actingAs($admin)
            ->delete(route('questions.answers.destroy', [$question, $answer]))
            ->assertRedirect();

        $this->assertDatabaseHas('session_questions', [
            'id' => $question->id,
            'title' => 'Admin edit',
        ]);
        $this->assertDatabaseMissing('session_answers', ['id' => $answer->id]);
    }

    public function test_admin_q_and_a_moderation_actions_are_logged(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $author = User::factory()->create();
        $session = LearningSession::factory()->create();
        $question = $session->questions()->create([
            'user_id' => $author->id,
            'title' => 'Question to moderate',
            'details' => 'Question details.',
        ]);
        $answer = $question->answers()->create([
            'user_id' => $author->id,
            'body' => 'Answer to moderate.',
        ]);
        $questionToDelete = $session->questions()->create([
            'user_id' => $author->id,
            'title' => 'Question to delete',
            'details' => null,
        ]);

        $this->actingAs($author)
            ->patch(route('sessions.questions.update', [$session, $question]), [
                'title' => 'Author update',
                'details' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('activity_logs', [
            'action' => 'qna_question_updated',
            'subject_type' => SessionQuestion::class,
            'subject_id' => $question->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('sessions.questions.update', [$session, $question]), [
                'title' => 'Admin update',
                'details' => 'Admin moderation update.',
            ])
            ->assertRedirect();
        $this->actingAs($admin)
            ->patch(route('questions.answers.update', [$question, $answer]), [
                'body' => 'Admin answer update.',
            ])
            ->assertRedirect();
        $this->actingAs($admin)
            ->delete(route('questions.answers.destroy', [$question, $answer]))
            ->assertRedirect();
        $this->actingAs($admin)
            ->delete(route('sessions.questions.destroy', [$session, $questionToDelete]))
            ->assertRedirect();

        foreach ([
            ['action' => 'qna_question_updated', 'subject' => $question, 'type' => SessionQuestion::class],
            ['action' => 'qna_answer_updated', 'subject' => $answer, 'type' => SessionAnswer::class],
            ['action' => 'qna_answer_deleted', 'subject' => $answer, 'type' => SessionAnswer::class],
            ['action' => 'qna_question_deleted', 'subject' => $questionToDelete, 'type' => SessionQuestion::class],
        ] as $expected) {
            $this->assertDatabaseHas('activity_logs', [
                'actor_id' => $admin->id,
                'action' => $expected['action'],
                'subject_type' => $expected['type'],
                'subject_id' => $expected['subject']->id,
            ]);
        }

        $answerLog = ActivityLog::query()
            ->where('action', 'qna_answer_deleted')
            ->where('subject_id', $answer->id)
            ->firstOrFail();

        $this->assertSame($session->id, $answerLog->metadata['learning_session_id']);
        $this->assertSame($question->id, $answerLog->metadata['session_question_id']);
        $this->assertSame($author->id, $answerLog->metadata['content_owner_id']);
    }

    public function test_q_and_a_content_cannot_cross_session_boundaries(): void
    {
        $participant = User::factory()->create();
        $firstSession = LearningSession::factory()->create();
        $secondSession = LearningSession::factory()->create();
        $question = $secondSession->questions()->create([
            'user_id' => $participant->id,
            'title' => 'Second session question',
            'details' => null,
        ]);

        $this->actingAs($participant)
            ->patch(route('sessions.questions.update', [$firstSession, $question]), [
                'title' => 'Cross-session edit',
                'details' => null,
            ])
            ->assertNotFound();

        $this->actingAs($participant)
            ->post(route('sessions.questions.store', $firstSession), [
                'title' => 'First session question',
                'details' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('session_questions', [
            'learning_session_id' => $firstSession->id,
            'title' => 'First session question',
        ]);
        $this->assertDatabaseHas('session_questions', [
            'learning_session_id' => $secondSession->id,
            'title' => 'Second session question',
        ]);
    }

    public function test_application_managed_participants_can_log_in(): void
    {
        $participant = User::factory()->create([
            'email' => 'participant@example.test',
            'password' => 'password',
        ]);

        $response = $this->post(route('login.store'), [
            'email' => $participant->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($participant);
    }

    public function test_guests_cannot_view_sessions_or_download_resources(): void
    {
        $session = LearningSession::factory()->create();
        $resource = $session->resources()->create([
            'title' => 'Session notes.txt',
            'stored_path' => 'lead-lab/resources/session-notes.txt',
            'mime_type' => 'text/plain',
            'size' => 12,
        ]);

        $this->get(route('sessions.show', $session))
            ->assertRedirect(route('login'));

        $this->get(route('classroom.index'))
            ->assertRedirect(route('login'));

        $this->get(route('resources.download', $resource))
            ->assertRedirect(route('login'));
    }

    public function test_private_resources_are_not_served_from_storage_urls(): void
    {
        Storage::fake('local');
        $session = LearningSession::factory()->create();
        $resource = $session->resources()->create([
            'title' => 'Private notes.txt',
            'stored_path' => 'lead-lab/resources/private-notes.txt',
            'mime_type' => 'text/plain',
            'size' => 12,
        ]);

        Storage::disk('local')->put($resource->stored_path, 'Private notes');

        $this->get('/storage/'.$resource->stored_path)
            ->assertNotFound();
    }

    public function test_unpublished_sessions_are_hidden_from_participants_but_visible_to_admins(): void
    {
        $session = LearningSession::factory()->create(['is_published' => false]);
        $participant = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($participant)
            ->get(route('sessions.show', $session))
            ->assertNotFound();

        $this->actingAs($admin)
            ->get(route('sessions.show', $session))
            ->assertOk();
    }

    public function test_archived_sessions_can_be_restored_and_are_hidden_from_participants(): void
    {
        Storage::fake('local');
        $participant = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $session = LearningSession::factory()->create(['is_published' => true]);
        $resource = $session->resources()->create([
            'title' => 'Archived notes.txt',
            'stored_path' => 'lead-lab/resources/archived-notes.txt',
            'mime_type' => 'text/plain',
            'size' => 14,
        ]);
        Storage::disk('local')->put($resource->stored_path, 'Archived notes');

        $this->actingAs($admin)
            ->patch(route('admin.sessions.archive', $session))
            ->assertRedirect();

        $this->assertNotNull($session->refresh()->archived_at);
        $this->actingAs($participant)
            ->get(route('classroom.index'))
            ->assertInertia(fn (Assert $assert) => $assert->has('sessions', 0));
        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert->has('sessions', 0));
        $this->actingAs($participant)
            ->get(route('sessions.show', $session))
            ->assertNotFound();
        $this->actingAs($participant)
            ->get(route('resources.download', $resource))
            ->assertNotFound();

        $this->actingAs($admin)
            ->patch(route('admin.sessions.restore', $session))
            ->assertRedirect();

        $this->assertNull($session->refresh()->archived_at);
        $this->actingAs($participant)
            ->get(route('classroom.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('sessions', 1)
                ->where('sessions.0.id', $session->id),
            );
    }

    public function test_non_admins_cannot_open_admin_pages(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->get(route('admin.sessions.index'))
            ->assertForbidden();

        $this->actingAs($participant)
            ->get(route('admin.classroom.index'))
            ->assertForbidden();

        $this->actingAs($participant)
            ->post(route('admin.sessions.store', ['return_to' => 'classroom']), [
                'title' => 'Unauthorized session',
                'season' => 'Execution rhythm',
                'session_date' => '2026-08-29',
                'description' => 'This should not be saved.',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_open_the_classroom_recordings_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $published = LearningSession::factory()->create([
            'title' => 'Published classroom recording',
            'session_date' => '2026-08-28',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            'is_published' => true,
        ]);
        $draft = LearningSession::factory()->create([
            'title' => 'Draft classroom recording',
            'session_date' => '2026-09-02',
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.classroom.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('admin/classroom/index')
            ->has('sessions', 2)
            ->where('sessions.0.id', $draft->id)
            ->where('sessions.1.id', $published->id)
            ->where(
                'sessions.1.video_thumbnail_url',
                'https://i.ytimg.com/vi/abc123XYZ01/hqdefault.jpg',
            ),
        );
    }

    public function test_admin_can_filter_published_and_draft_classroom_recordings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $matchingDraft = LearningSession::factory()->create([
            'title' => 'Private launch workshop',
            'season' => 'Preview sessions',
            'session_date' => '2026-08-28',
            'is_published' => false,
        ]);
        LearningSession::factory()->create([
            'title' => 'Published launch workshop',
            'season' => 'Preview sessions',
            'session_date' => '2026-08-10',
            'is_published' => true,
        ]);
        LearningSession::factory()->create([
            'title' => 'Outside filter window',
            'season' => 'Preview sessions',
            'session_date' => '2026-09-10',
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.classroom.index', [
            'search' => 'Private launch',
            'season' => 'Preview sessions',
            'date_from' => '2026-08-20',
            'date_to' => '2026-08-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('admin/classroom/index')
            ->has('sessions', 1)
            ->where('sessions.0.id', $matchingDraft->id)
            ->where('sessions.0.is_published', false)
            ->where('filters.search', 'Private launch')
            ->where('filters.season', 'Preview sessions')
            ->where('filters.date_from', '2026-08-20')
            ->where('filters.date_to', '2026-08-31')
        );
    }

    public function test_participants_can_open_published_classroom_recordings_page(): void
    {
        $participant = User::factory()->create();
        $published = LearningSession::factory()->create([
            'title' => 'Published participant recording',
            'session_date' => '2026-08-28',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            'is_published' => true,
        ]);
        LearningSession::factory()->create([
            'title' => 'Draft participant recording',
            'session_date' => '2026-09-02',
            'is_published' => false,
        ]);

        $response = $this->actingAs($participant)
            ->get(route('classroom.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('classroom/index')
            ->has('sessions', 1)
            ->where('sessions.0.id', $published->id)
            ->where('sessions.0.title', 'Published participant recording')
            ->where(
                'sessions.0.video_thumbnail_url',
                'https://i.ytimg.com/vi/abc123XYZ01/hqdefault.jpg',
            ),
        );
    }

    public function test_participants_can_search_sessions_and_resource_metadata(): void
    {
        $participant = User::factory()->create();
        $matching = LearningSession::factory()->create([
            'title' => 'Build a consistent follow-up rhythm',
            'season' => 'Conversation skills',
            'description' => 'A practical session for better outreach follow-up.',
            'session_date' => '2026-08-28',
        ]);
        $matching->resources()->create([
            'title' => 'Follow-up worksheet.txt',
            'stored_path' => 'lead-lab/resources/follow-up.txt',
            'mime_type' => 'text/plain',
            'size' => 10,
        ]);
        LearningSession::factory()->create([
            'title' => 'Unrelated session',
            'season' => 'Execution rhythm',
        ]);
        LearningSession::factory()->create([
            'title' => 'Matching draft',
            'is_published' => false,
        ]);

        $response = $this->actingAs($participant)->get(route('classroom.index', [
            'search' => 'worksheet',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('classroom/index')
            ->has('sessions', 1)
            ->where('sessions.0.id', $matching->id)
            ->where('filters.search', 'worksheet')
        );
    }

    public function test_participants_can_filter_sessions_by_season_and_date_range(): void
    {
        $participant = User::factory()->create();
        $matching = LearningSession::factory()->create([
            'title' => 'In-range conversation session',
            'season' => 'Conversation skills',
            'session_date' => '2026-08-28',
        ]);
        LearningSession::factory()->create([
            'title' => 'Wrong season',
            'season' => 'Execution rhythm',
            'session_date' => '2026-08-28',
        ]);
        LearningSession::factory()->create([
            'title' => 'Outside date range',
            'season' => 'Conversation skills',
            'session_date' => '2026-09-12',
        ]);

        $response = $this->actingAs($participant)->get(route('classroom.index', [
            'season' => 'Conversation skills',
            'date_from' => '2026-08-20',
            'date_to' => '2026-08-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('classroom/index')
            ->has('sessions', 1)
            ->where('sessions.0.id', $matching->id)
            ->where('filters.season', 'Conversation skills')
            ->where('filters.date_from', '2026-08-20')
            ->where('filters.date_to', '2026-08-31')
        );
    }

    public function test_invalid_classroom_date_range_is_rejected(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->get(route('classroom.index', [
                'date_from' => '2026-09-01',
                'date_to' => '2026-08-01',
            ]))
            ->assertSessionHasErrors('date_to');
    }

    public function test_revoked_users_are_logged_out_of_lead_lab_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('admin.members.status', $participant), [
                'status' => User::ACCESS_REVOKED,
            ])
            ->assertRedirect();

        $this->assertFalse($participant->refresh()->is_active);

        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'));

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'member_access_revoked',
            'subject_type' => User::class,
            'subject_id' => $participant->id,
        ]);
    }

    public function test_admin_can_approve_a_verified_pending_participant(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin)->patch(
            route('admin.members.status', $participant),
            ['status' => User::ACCESS_ACTIVE],
        );

        $response->assertRedirect();
        $this->assertSame(User::ACCESS_ACTIVE, $participant->refresh()->access_status);
        $this->assertTrue($participant->is_active);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'member_access_approved',
            'subject_type' => User::class,
            'subject_id' => $participant->id,
        ]);
    }

    public function test_pending_participants_are_redirected_to_the_registration_status_page(): void
    {
        $participant = User::factory()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertRedirect(route('registration.pending'));

        $this->actingAs($participant)
            ->get(route('registration.pending'))
            ->assertOk()
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('auth/registration-pending')
                ->where('emailVerified', true)
                ->where('emailVerificationRequired', true),
            );
    }

    public function test_admin_can_approve_an_unverified_pending_participant_when_verification_is_bypassed(): void
    {
        config(['fortify.require_email_verification' => false]);

        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->unverified()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.members.status', $participant), [
                'status' => User::ACCESS_ACTIVE,
            ])
            ->assertRedirect();

        $this->assertSame(User::ACCESS_ACTIVE, $participant->refresh()->access_status);
        $this->assertTrue($participant->is_active);
    }

    public function test_admin_cannot_approve_an_unverified_pending_participant_when_verification_is_required(): void
    {
        config(['fortify.require_email_verification' => true]);

        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->unverified()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.members.status', $participant), [
                'status' => User::ACCESS_ACTIVE,
            ])
            ->assertSessionHasErrors('status');

        $this->assertSame(User::ACCESS_PENDING, $participant->refresh()->access_status);
        $this->assertFalse($participant->is_active);
    }

    public function test_admin_member_page_shows_pending_access_and_email_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->unverified()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.members.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('admin/members/index')
                ->where('members.data.0.id', $participant->id)
                ->where('members.data.0.access_status', User::ACCESS_PENDING)
                ->where('members.data.0.email_verified_at', null)
                ->where('emailVerificationRequired', true),
            );
    }

    public function test_admin_member_page_paginates_ten_members_per_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach (range(1, 15) as $number) {
            User::factory()->create([
                'name' => sprintf('Member %02d', $number),
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.members.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 10)
                ->where('members.current_page', 1)
                ->where('members.per_page', 10)
                ->where('members.total', 15)
                ->where('members.data.0.name', 'Member 01')
                ->where('members.data.9.name', 'Member 10'),
            );

        $this->actingAs($admin)
            ->get(route('admin.members.index', ['page' => 2]))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 5)
                ->where('members.current_page', 2)
                ->where('members.data.0.name', 'Member 11')
                ->where('members.data.4.name', 'Member 15'),
            );
    }

    public function test_admin_can_filter_members_by_each_access_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pending = User::factory()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);
        $active = User::factory()->create([
            'access_status' => User::ACCESS_ACTIVE,
            'is_active' => true,
        ]);
        $revoked = User::factory()->create([
            'access_status' => User::ACCESS_REVOKED,
            'is_active' => false,
        ]);

        foreach ([
            User::ACCESS_PENDING => $pending,
            User::ACCESS_ACTIVE => $active,
            User::ACCESS_REVOKED => $revoked,
        ] as $status => $member) {
            $this->actingAs($admin)
                ->get(route('admin.members.index', ['status' => $status]))
                ->assertInertia(fn (Assert $assert) => $assert
                    ->has('members.data', 1)
                    ->where('members.data.0.id', $member->id)
                    ->where('members.data.0.access_status', $status)
                    ->where('filters.status', $status),
                );
        }
    }

    public function test_admin_can_search_members_by_name_or_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $nameMatch = User::factory()->create([
            'name' => 'Alicia Jones',
            'email' => 'alicia@example.test',
        ]);
        $emailMatch = User::factory()->create([
            'name' => 'Brandon Smith',
            'email' => 'brandon@leadlab.test',
        ]);
        User::factory()->create([
            'name' => 'Unrelated member',
            'email' => 'unrelated@example.test',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.members.index', ['search' => 'Alicia']))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 1)
                ->where('members.data.0.id', $nameMatch->id)
                ->where('filters.search', 'Alicia')
                ->where('filters.status', null),
            );

        $this->actingAs($admin)
            ->get(route('admin.members.index', ['search' => 'brandon@leadlab']))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 1)
                ->where('members.data.0.id', $emailMatch->id)
                ->where('filters.search', 'brandon@leadlab')
                ->where('filters.status', null),
            );
    }

    public function test_member_search_and_status_filter_are_preserved_during_pagination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach (range(1, 11) as $number) {
            User::factory()->create([
                'name' => sprintf('Searchable member %02d', $number),
                'access_status' => User::ACCESS_ACTIVE,
                'is_active' => true,
            ]);
        }

        User::factory()->create([
            'name' => 'Searchable revoked member',
            'access_status' => User::ACCESS_REVOKED,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.members.index', [
                'search' => 'Searchable',
                'status' => User::ACCESS_ACTIVE,
            ]))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 10)
                ->where('members.total', 11)
                ->where('filters.search', 'Searchable')
                ->where('filters.status', User::ACCESS_ACTIVE)
                ->where(
                    'members.next_page_url',
                    fn (?string $url): bool => $url !== null
                        && str_contains($url, 'search=Searchable')
                        && str_contains($url, 'status=active'),
                ),
            );
    }

    public function test_member_pagination_preserves_the_status_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(11)->create([
            'access_status' => User::ACCESS_ACTIVE,
            'is_active' => true,
        ]);
        User::factory()->create([
            'access_status' => User::ACCESS_REVOKED,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.members.index', [
                'status' => User::ACCESS_ACTIVE,
            ]))
            ->assertInertia(fn (Assert $assert) => $assert
                ->has('members.data', 10)
                ->where('members.total', 11)
                ->where('filters.status', User::ACCESS_ACTIVE)
                ->where(
                    'members.next_page_url',
                    fn (?string $url): bool => $url !== null
                        && str_contains($url, 'status=active'),
                ),
            );
    }

    public function test_invalid_member_status_filter_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.members.index', ['status' => 'unknown']))
            ->assertSessionHasErrors('status');
    }

    public function test_invalid_member_search_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.members.index', [
                'search' => str_repeat('a', 121),
            ]))
            ->assertSessionHasErrors('search');
    }

    public function test_admin_can_restore_a_revoked_participant(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create([
            'access_status' => User::ACCESS_REVOKED,
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.members.status', $participant), [
                'status' => User::ACCESS_ACTIVE,
            ])
            ->assertRedirect();

        $this->assertSame(User::ACCESS_ACTIVE, $participant->refresh()->access_status);
        $this->assertTrue($participant->is_active);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'member_access_restored',
            'subject_type' => User::class,
            'subject_id' => $participant->id,
        ]);
    }

    public function test_admin_can_promote_a_participant_without_changing_access_state_and_logs_role_change(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create([
            'role' => 'participant',
            'access_status' => User::ACCESS_ACTIVE,
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $participant), [
                'role' => 'admin',
            ])
            ->assertRedirect();

        $participant->refresh();

        $this->assertSame('admin', $participant->role);
        $this->assertSame(User::ACCESS_ACTIVE, $participant->access_status);
        $this->assertTrue($participant->is_active);

        $activity = ActivityLog::query()
            ->where('action', 'member_role_changed')
            ->where('subject_id', $participant->id)
            ->firstOrFail();

        $this->assertSame($admin->id, $activity->actor_id);
        $this->assertSame([
            'from_role' => 'participant',
            'to_role' => 'admin',
        ], $activity->metadata);
    }

    public function test_admin_can_demote_an_administrator_without_changing_access_state_and_logs_role_change(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherAdministrator = User::factory()->create([
            'role' => 'admin',
            'access_status' => User::ACCESS_ACTIVE,
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $otherAdministrator), [
                'role' => 'participant',
            ])
            ->assertRedirect();

        $otherAdministrator->refresh();

        $this->assertSame('participant', $otherAdministrator->role);
        $this->assertSame(User::ACCESS_ACTIVE, $otherAdministrator->access_status);
        $this->assertTrue($otherAdministrator->is_active);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'member_role_changed',
            'subject_type' => User::class,
            'subject_id' => $otherAdministrator->id,
        ]);
    }

    public function test_member_role_changes_leave_pending_and_revoked_access_unchanged(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach ([
            User::ACCESS_PENDING => false,
            User::ACCESS_REVOKED => false,
        ] as $accessStatus => $isActive) {
            $participant = User::factory()->create([
                'role' => 'participant',
                'access_status' => $accessStatus,
                'is_active' => $isActive,
            ]);

            $this->actingAs($admin)
                ->patch(route('admin.members.role', $participant), [
                    'role' => 'admin',
                ])
                ->assertRedirect();

            $participant->refresh();

            $this->assertSame('admin', $participant->role);
            $this->assertSame($accessStatus, $participant->access_status);
            $this->assertSame($isActive, $participant->is_active);
        }
    }

    public function test_administrator_cannot_change_their_own_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $admin), [
                'role' => 'participant',
            ])
            ->assertStatus(422);

        $this->assertSame('admin', $admin->refresh()->role);
    }

    public function test_non_admin_cannot_change_member_roles(): void
    {
        $participant = User::factory()->create();
        $otherParticipant = User::factory()->create();

        $this->actingAs($participant)
            ->patch(route('admin.members.role', $otherParticipant), [
                'role' => 'admin',
            ])
            ->assertForbidden();

        $this->assertSame('participant', $otherParticipant->refresh()->role);
    }

    public function test_invalid_member_role_is_rejected_without_a_role_change(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $participant), [
                'role' => 'moderator',
            ])
            ->assertSessionHasErrors('role');

        $this->assertSame('participant', $participant->refresh()->role);
        $this->assertDatabaseMissing('activity_logs', [
            'action' => 'member_role_changed',
            'subject_type' => User::class,
            'subject_id' => $participant->id,
        ]);
    }

    public function test_unchanged_member_role_is_not_logged(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create(['role' => 'participant']);

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $participant), [
                'role' => 'participant',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('activity_logs', [
            'action' => 'member_role_changed',
            'subject_type' => User::class,
            'subject_id' => $participant->id,
        ]);
    }

    public function test_moderator_role_cannot_be_changed_in_this_increment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $moderator = User::factory()->create(['role' => 'moderator']);

        $this->actingAs($admin)
            ->patch(route('admin.members.role', $moderator), [
                'role' => 'admin',
            ])
            ->assertSessionHasErrors('role');

        $this->assertSame('moderator', $moderator->refresh()->role);
    }
}
