<?php

namespace Tests\Feature;

use App\Models\LearningResource;
use App\Models\LearningSession;
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
            'category' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A practical session for building a weekly operating rhythm.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            'resource' => UploadedFile::fake()->createWithContent('worksheet.txt', 'Lead Lab worksheet'),
        ]);

        $session = LearningSession::query()->where('title', 'Build a repeatable lead rhythm')->firstOrFail();
        $resource = LearningResource::query()->where('learning_session_id', $session->id)->firstOrFail();

        $response->assertRedirect(route('admin.sessions.index'));
        $this->assertFalse($session->is_published);
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
                'category' => 'Execution rhythm',
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
                'category' => 'Conversation skills',
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
        $this->assertSame('Conversation skills', $session->category);
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

    public function test_admin_can_save_a_full_youtube_embed_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Embed code session',
            'category' => 'Execution rhythm',
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

    public function test_admin_can_save_a_short_youtube_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Short URL session',
            'category' => 'Execution rhythm',
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
            'category' => 'Execution rhythm',
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
            'category' => 'Execution rhythm',
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
                'category' => 'Execution rhythm',
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
            ->where('sessions.1.id', $published->id),
        );
    }

    public function test_admin_can_filter_published_and_draft_classroom_recordings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $matchingDraft = LearningSession::factory()->create([
            'title' => 'Private launch workshop',
            'category' => 'Preview sessions',
            'session_date' => '2026-08-28',
            'is_published' => false,
        ]);
        LearningSession::factory()->create([
            'title' => 'Published launch workshop',
            'category' => 'Preview sessions',
            'session_date' => '2026-08-10',
            'is_published' => true,
        ]);
        LearningSession::factory()->create([
            'title' => 'Outside filter window',
            'category' => 'Preview sessions',
            'session_date' => '2026-09-10',
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.classroom.index', [
            'search' => 'Private launch',
            'category' => 'Preview sessions',
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
            ->where('filters.category', 'Preview sessions')
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
            ->where('sessions.0.title', 'Published participant recording'),
        );
    }

    public function test_participants_can_search_sessions_and_resource_metadata(): void
    {
        $participant = User::factory()->create();
        $matching = LearningSession::factory()->create([
            'title' => 'Build a consistent follow-up rhythm',
            'category' => 'Conversation skills',
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
            'category' => 'Execution rhythm',
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

    public function test_participants_can_filter_sessions_by_category_and_date_range(): void
    {
        $participant = User::factory()->create();
        $matching = LearningSession::factory()->create([
            'title' => 'In-range conversation session',
            'category' => 'Conversation skills',
            'session_date' => '2026-08-28',
        ]);
        LearningSession::factory()->create([
            'title' => 'Wrong category',
            'category' => 'Execution rhythm',
            'session_date' => '2026-08-28',
        ]);
        LearningSession::factory()->create([
            'title' => 'Outside date range',
            'category' => 'Conversation skills',
            'session_date' => '2026-09-12',
        ]);

        $response = $this->actingAs($participant)->get(route('classroom.index', [
            'category' => 'Conversation skills',
            'date_from' => '2026-08-20',
            'date_to' => '2026-08-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('classroom/index')
            ->has('sessions', 1)
            ->where('sessions.0.id', $matching->id)
            ->where('filters.category', 'Conversation skills')
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
            ->patch(route('admin.members.status', $participant))
            ->assertRedirect();

        $this->assertFalse($participant->refresh()->is_active);

        $this->actingAs($participant)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'));
    }
}
