<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\NewParticipantRegistrationNotification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_register_as_pending_participants(): void
    {
        Notification::fake();

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('registration.pending', absolute: false));

        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->assertSame('participant', $user->role);
        $this->assertSame('pending', $user->access_status);
        $this->assertFalse($user->is_active);
        $this->assertNull($user->email_verified_at);

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_new_registration_notifies_all_active_administrators(): void
    {
        Notification::fake();

        $activeAdministrator = User::factory()->create(['role' => 'admin']);
        $secondActiveAdministrator = User::factory()->create(['role' => 'admin']);
        $revokedAdministrator = User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
            'access_status' => User::ACCESS_REVOKED,
        ]);
        $pendingAdministrator = User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
            'access_status' => User::ACCESS_PENDING,
        ]);

        $this->post(route('register.store'), [
            'name' => 'New Participant',
            'email' => 'new-participant@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $participant = User::query()
            ->where('email', 'new-participant@example.com')
            ->firstOrFail();

        Notification::assertSentTo(
            $activeAdministrator,
            NewParticipantRegistrationNotification::class,
            fn (NewParticipantRegistrationNotification $notification): bool => $notification->participant->is($participant),
        );
        Notification::assertSentTo(
            $secondActiveAdministrator,
            NewParticipantRegistrationNotification::class,
        );
        Notification::assertNotSentTo(
            $revokedAdministrator,
            NewParticipantRegistrationNotification::class,
        );
        Notification::assertNotSentTo(
            $pendingAdministrator,
            NewParticipantRegistrationNotification::class,
        );
    }

    public function test_registration_notification_contains_review_details(): void
    {
        $administrator = User::factory()->create([
            'name' => 'Lead Hub Administrator',
            'role' => 'admin',
            'timezone' => 'Asia/Manila',
        ]);
        $participant = User::factory()->create([
            'name' => 'New Participant',
            'email' => 'new-participant@example.com',
            'timezone' => 'Asia/Tokyo',
            'created_at' => '2026-08-26 12:00:00',
        ]);

        $message = (new NewParticipantRegistrationNotification($participant))
            ->toMail($administrator);

        $this->assertSame('New LEADHub participant registration', $message->subject);
        $this->assertSame('Hello Lead Hub Administrator,', $message->greeting);
        $this->assertContains(
            'A new participant has registered for LEADHub and needs access review.',
            $message->introLines,
        );
        $this->assertContains('Name: New Participant', $message->introLines);
        $this->assertContains('Email: new-participant@example.com', $message->introLines);
        $this->assertContains('Registered: Wednesday, August 26, 2026 at 8:00 PM', $message->introLines);
        $this->assertContains('Times are shown in GMT+8 (Asia/Manila).', $message->outroLines);
        $this->assertSame('2026-08-26T12:00:00+00:00', $participant->created_at->toIso8601String());
        $this->assertSame('Review registration', $message->actionText);
        $this->assertStringContainsString('/admin/members', $message->actionUrl);
        $rendered = (string) $message->render();

        $this->assertStringContainsString('LEADHub', $rendered);
        $this->assertStringNotContainsString('Lead Lab', $rendered);
    }

    public function test_registration_notification_uses_the_administrators_date_specific_timezone_offset(): void
    {
        $administrator = User::factory()->create([
            'role' => 'admin',
            'timezone' => 'America/New_York',
        ]);

        foreach ([
            ['2026-03-08 04:30:00', 'Registered: Saturday, March 7, 2026 at 11:30 PM', 'GMT-5'],
            ['2026-07-01 02:30:00', 'Registered: Tuesday, June 30, 2026 at 10:30 PM', 'GMT-4'],
        ] as [$registeredAt, $expectedLine, $expectedOffset]) {
            $participant = User::factory()->create(['created_at' => $registeredAt]);

            $message = (new NewParticipantRegistrationNotification($participant))->toMail($administrator);

            $this->assertContains($expectedLine, $message->introLines);
            $this->assertContains("Times are shown in {$expectedOffset} (America/New_York).", $message->outroLines);
            $this->assertSame($registeredAt, $participant->created_at->format('Y-m-d H:i:s'));
            $this->assertSame('UTC', $participant->created_at->timezoneName);
        }
    }

    public function test_registration_notification_falls_back_to_default_timezone_for_missing_or_invalid_admin_timezone(): void
    {
        $participant = User::factory()->create(['created_at' => '2026-08-26 12:00:00']);

        foreach ([null, 'Invalid/Timezone'] as $timezone) {
            $administrator = User::factory()->create(['role' => 'admin', 'timezone' => $timezone]);

            $message = (new NewParticipantRegistrationNotification($participant))->toMail($administrator);

            $this->assertContains('Registered: Wednesday, August 26, 2026 at 8:00 PM', $message->introLines);
            $this->assertContains('Times are shown in GMT+8 (Asia/Manila).', $message->outroLines);
        }
    }

    public function test_a_pending_participant_can_verify_their_email_before_approval(): void
    {
        Notification::fake();

        $this->post(route('register.store'), [
            'name' => 'Verified User',
            'email' => 'verified@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $user = User::query()->where('email', 'verified@example.com')->firstOrFail();

        $this->actingAs($user)
            ->get(URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(10),
                [
                    'id' => $user->id,
                    'hash' => sha1($user->getEmailForVerification()),
                ],
            ))
            ->assertRedirect(route('dashboard').'?verified=1');

        $this->assertNotNull($user->refresh()->email_verified_at);
        $this->assertSame(User::ACCESS_PENDING, $user->access_status);
        $this->assertFalse($user->is_active);
    }

    public function test_registration_does_not_send_verification_notification_when_bypassed(): void
    {
        config(['fortify.require_email_verification' => false]);
        Notification::fake();

        $this->post(route('register.store'), [
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        Notification::assertNothingSent();
    }

    public function test_different_users_can_register_from_the_same_ip(): void
    {
        Notification::fake();

        foreach (range(1, 6) as $number) {
            $response = $this->post(route('register.store'), [
                'name' => "Test User {$number}",
                'email' => "test-{$number}@example.com",
                'password' => 'Password1!',
                'password_confirmation' => 'Password1!',
            ]);

            $response->assertRedirect(route('registration.pending', absolute: false));
            auth()->logout();
        }

        $this->assertDatabaseCount('users', 6);
    }

    public function test_repeated_registration_attempts_for_one_email_are_throttled(): void
    {
        Notification::fake();

        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'not-the-same-password',
        ];

        foreach (range(1, 5) as $_) {
            $this->post(route('register.store'), $payload)
                ->assertSessionHasErrors('password');
        }

        $this->post(route('register.store'), $payload)
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_registration_rejects_an_array_email_with_validation_errors(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => ['test@example.com'],
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }
}
