<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\LearningSession;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_the_activity_log(): void
    {
        $this->get(route('admin.activity-logs.index'))
            ->assertRedirect(route('login'));
    }

    public function test_non_admins_cannot_open_the_activity_log(): void
    {
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->get(route('admin.activity-logs.index'))
            ->assertForbidden();
    }

    public function test_admins_can_filter_activity_by_action_and_local_date(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'timezone' => 'America/New_York',
        ]);
        $member = User::factory()->create(['name' => 'Changed Member']);
        $matching = ActivityLog::create([
            'actor_id' => $admin->id,
            'action' => 'member_role_changed',
            'subject_type' => User::class,
            'subject_id' => $member->id,
            'metadata' => [
                'from_role' => 'participant',
                'to_role' => 'admin',
                'token' => 'must-not-be-shown',
            ],
        ]);
        $matching->forceFill([
            'created_at' => CarbonImmutable::parse('2026-09-01 16:00:00', 'UTC'),
        ])->save();

        $outsideDate = ActivityLog::create([
            'actor_id' => $admin->id,
            'action' => 'session_created',
            'subject_type' => LearningSession::class,
            'subject_id' => LearningSession::factory()->create()->id,
        ]);
        $outsideDate->forceFill([
            'created_at' => CarbonImmutable::parse('2026-09-02 16:00:00', 'UTC'),
        ])->save();

        $response = $this->actingAs($admin)->get(route('admin.activity-logs.index', [
            'action' => 'member_role_changed',
            'date_from' => '2026-09-01',
            'date_to' => '2026-09-01',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $assert) => $assert
            ->component('admin/activity-logs/index')
            ->where('logs.total', 1)
            ->where('logs.data.0.id', $matching->id)
            ->where('logs.data.0.action_label', 'Member role changed')
            ->where('logs.data.0.actor.name', $admin->name)
            ->where('logs.data.0.subject.label', 'Changed Member')
            ->where('logs.data.0.details.Previous role', 'participant')
            ->where('logs.data.0.details.New role', 'admin')
            ->missing('logs.data.0.details.token')
            ->where('filters.action', 'member_role_changed')
            ->where('filters.date_from', '2026-09-01')
            ->where('filters.date_to', '2026-09-01')
            ->where('timezone_label', 'GMT-4 (America/New_York)'),
        );
    }

    public function test_local_date_filter_uses_the_administrator_timezone(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'timezone' => 'Asia/Manila',
        ]);
        $subject = LearningSession::factory()->create();

        $localDateEntry = ActivityLog::create([
            'actor_id' => $admin->id,
            'action' => 'session_created',
            'subject_type' => LearningSession::class,
            'subject_id' => $subject->id,
        ]);
        $localDateEntry->forceFill([
            'created_at' => CarbonImmutable::parse('2026-08-31 16:00:00', 'UTC'),
        ])->save();

        $nextLocalDateEntry = ActivityLog::create([
            'actor_id' => $admin->id,
            'action' => 'session_updated',
            'subject_type' => LearningSession::class,
            'subject_id' => $subject->id,
        ]);
        $nextLocalDateEntry->forceFill([
            'created_at' => CarbonImmutable::parse('2026-09-01 16:00:00', 'UTC'),
        ])->save();

        $this->actingAs($admin)
            ->get(route('admin.activity-logs.index', [
                'date_from' => '2026-09-01',
                'date_to' => '2026-09-01',
            ]))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('logs.total', 1)
                ->where('logs.data.0.id', $localDateEntry->id),
            );
    }

    public function test_missing_actor_and_subject_are_presented_as_unavailable(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $log = ActivityLog::create([
            'actor_id' => null,
            'action' => 'password_reset',
            'subject_type' => User::class,
            'subject_id' => 999999,
            'metadata' => ['source' => 'password_recovery'],
        ]);

        $this->actingAs($admin)
            ->get(route('admin.activity-logs.index'))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('logs.data.0.id', $log->id)
                ->where('logs.data.0.actor', null)
                ->where('logs.data.0.subject.label', 'User #999999 (record unavailable)')
                ->where('logs.data.0.subject.available', false),
            );
    }

    public function test_activity_log_is_paginated_and_preserves_filters(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = LearningSession::factory()->create();

        foreach (range(1, 26) as $number) {
            ActivityLog::create([
                'actor_id' => $admin->id,
                'action' => 'session_created',
                'subject_type' => LearningSession::class,
                'subject_id' => $subject->id,
                'created_at' => CarbonImmutable::parse("2026-08-{$number}", 'UTC'),
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.activity-logs.index', [
                'action' => 'session_created',
                'date_from' => '2026-08-01',
            ]))
            ->assertInertia(fn (Assert $assert) => $assert
                ->where('logs.total', 26)
                ->where('logs.last_page', 2)
                ->where('filters.action', 'session_created')
                ->where('filters.date_from', '2026-08-01')
                ->where('logs.data.0.action_label', 'Session created'),
            );
    }
}
