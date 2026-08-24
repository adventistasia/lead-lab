<?php

namespace Tests\Feature;

use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
