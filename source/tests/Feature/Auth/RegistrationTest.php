<?php

namespace Tests\Feature\Auth;

use App\Models\User;
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
