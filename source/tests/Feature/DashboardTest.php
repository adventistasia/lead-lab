<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->where('is_admin', false),
            );
    }

    public function test_admin_dashboard_exposes_admin_navigation_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->where('is_admin', true),
            );
    }

    public function test_dashboard_shows_the_five_most_recent_published_sessions(): void
    {
        $user = User::factory()->create();
        $sessions = collect(range(1, 6))->map(
            fn (int $daysAgo): LearningSession => LearningSession::factory()->create([
                'session_date' => now()->subDays($daysAgo)->toDateString(),
            ]),
        );

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->has('sessions', 5)
                ->where('sessions.0.id', $sessions[0]->id)
                ->where('sessions.1.id', $sessions[1]->id)
                ->where('sessions.2.id', $sessions[2]->id)
                ->where('sessions.3.id', $sessions[3]->id)
                ->where('sessions.4.id', $sessions[4]->id),
            );
    }

    public function test_dashboard_exposes_session_metadata_and_video_thumbnail(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create([
            'session_date' => '2026-08-25',
            'video_url' => 'https://www.youtube.com/watch?v=abc123XYZ01',
        ]);
        $sessionWithoutVideo = LearningSession::factory()->create([
            'session_date' => '2026-08-24',
            'video_url' => null,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->where('sessions.0.id', $session->id)
                ->where('sessions.0.session_date', '2026-08-25')
                ->where('sessions.0.description', $session->description)
                ->where(
                    'sessions.0.video_thumbnail_url',
                    'https://i.ytimg.com/vi/abc123XYZ01/hqdefault.jpg',
                )
                ->where('sessions.1.id', $sessionWithoutVideo->id)
                ->where('sessions.1.video_thumbnail_url', null),
            );
    }

    public function test_dashboard_exposes_live_metrics_and_the_earliest_upcoming_event(): void
    {
        $user = User::factory()->create();
        User::factory()->count(2)->create();
        User::factory()->create([
            'is_active' => false,
            'access_status' => User::ACCESS_REVOKED,
        ]);

        $session = LearningSession::factory()->create();
        LearningSession::factory()->create();
        LearningSession::factory()->create(['is_published' => false]);
        LearningSession::factory()->create([
            'is_published' => true,
            'archived_at' => now(),
        ]);

        $question = $session->questions()->create([
            'user_id' => $user->id,
            'title' => 'How do I prepare?',
        ]);
        $question->answers()->create([
            'user_id' => $user->id,
            'body' => 'Review the session materials.',
        ]);

        $earliestEvent = CalendarEvent::factory()->create([
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
        ]);
        CalendarEvent::factory()->create([
            'starts_at' => now()->addHours(3),
            'ends_at' => now()->addHours(4),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->where('metrics.sessions_ready', 2)
                ->where('metrics.active_members', 3)
                ->where('metrics.community_activity', 2)
                ->where('upcoming_events.0.id', $earliestEvent->id),
            );
    }

    public function test_dashboard_shows_only_the_three_most_recent_q_and_a_activities(): void
    {
        $user = User::factory()->create();
        $session = LearningSession::factory()->create();
        $base = now();

        $questions = collect(range(1, 4))->map(function (int $number) use (
            $session,
            $user,
            $base,
        ) {
            $question = $session->questions()->create([
                'user_id' => $user->id,
                'title' => "Question {$number}",
            ]);
            $createdAt = $base->copy()->subMinutes(20 - $number);
            $question->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->saveQuietly();

            return $question;
        });

        $oldestQuestion = $questions->firstOrFail();
        $answer = $oldestQuestion->answers()->create([
            'user_id' => $user->id,
            'body' => 'A recent answer.',
        ]);
        $answerCreatedAt = Carbon::instance($base)->subMinute();
        $answer->forceFill([
            'created_at' => $answerCreatedAt,
            'updated_at' => $answerCreatedAt,
        ])->saveQuietly();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('dashboard')
                ->has('community_updates', 3)
                ->where('community_updates.0.type', 'answer')
                ->where('community_updates.0.text', 'Answered: A recent answer.')
                ->where(
                    'community_updates.0.url',
                    route('sessions.show', [
                        'learningSession' => $session,
                        'tab' => 'q-and-a',
                    ])."#question-{$oldestQuestion->id}",
                )
                ->where('community_updates.1.text', 'Asked: Question 4')
                ->where('community_updates.2.text', 'Asked: Question 3'),
            );
    }
}
