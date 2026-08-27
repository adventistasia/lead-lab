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
            'password' => 'password',
            'password_confirmation' => 'password',
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
            'password' => 'password',
            'password_confirmation' => 'password',
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
            'name' => 'Lead Lab Administrator',
            'role' => 'admin',
        ]);
        $participant = User::factory()->create([
            'name' => 'New Participant',
            'email' => 'new-participant@example.com',
            'created_at' => '2026-08-26 12:00:00',
        ]);

        $message = (new NewParticipantRegistrationNotification($participant))
            ->toMail($administrator);

        $this->assertSame('New Lead Lab participant registration', $message->subject);
        $this->assertSame('Hello Lead Lab Administrator,', $message->greeting);
        $this->assertContains('Name: New Participant', $message->introLines);
        $this->assertContains('Email: new-participant@example.com', $message->introLines);
        $this->assertContains('Registered: Wednesday, August 26, 2026 at 12:00 PM UTC', $message->introLines);
        $this->assertSame('Review registration', $message->actionText);
        $this->assertStringContainsString('/admin/members', $message->actionUrl);
    }

    public function test_a_pending_participant_can_verify_their_email_before_approval(): void
    {
        Notification::fake();

        $this->post(route('register.store'), [
            'name' => 'Verified User',
            'email' => 'verified@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
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
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        Notification::assertNothingSent();
    }
}
