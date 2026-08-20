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

    public function test_admin_can_publish_a_session_with_a_protected_resource(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.sessions.store'), [
            'title' => 'Build a repeatable lead rhythm',
            'category' => 'Execution rhythm',
            'session_date' => '2026-08-28',
            'description' => 'A practical session for building a weekly operating rhythm.',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
            'is_published' => true,
            'resource' => UploadedFile::fake()->createWithContent('worksheet.txt', 'Lead Lab worksheet'),
        ]);

        $session = LearningSession::query()->where('title', 'Build a repeatable lead rhythm')->firstOrFail();
        $resource = LearningResource::query()->where('learning_session_id', $session->id)->firstOrFail();

        $response->assertRedirect(route('admin.sessions.index'));
        $this->assertTrue($session->is_published);
        $this->assertSame('worksheet.txt', $resource->title);
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
            'is_published' => true,
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
            'is_published' => true,
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
            'is_published' => true,
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
            'is_published' => true,
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

    public function test_non_admins_cannot_open_admin_pages(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->get(route('admin.sessions.index'))
            ->assertForbidden();

        $this->actingAs($participant)
            ->get(route('admin.classroom.index'))
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
