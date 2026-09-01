<?php

namespace Tests\Feature\Auth;

use App\Http\Responses\PasswordResetLinkResponse;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Fortify\Features;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::resetPasswords());
    }

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get(route('password.request'));

        $response->assertOk();
    }

    public function test_reset_password_link_request_uses_same_response_for_known_and_unknown_emails(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $knownResponse = $this->from(route('password.request'))->post(route('password.email'), [
            'email' => $user->email,
        ]);
        $unknownResponse = $this->from(route('password.request'))->post(route('password.email'), [
            'email' => 'unknown@example.com',
        ]);

        $knownResponse
            ->assertRedirect(route('password.request'))
            ->assertSessionHas('status', PasswordResetLinkResponse::MESSAGE)
            ->assertSessionMissing('errors');
        $unknownResponse
            ->assertRedirect(route('password.request'))
            ->assertSessionHas('status', PasswordResetLinkResponse::MESSAGE)
            ->assertSessionMissing('errors');

        Notification::assertSentTo($user, ResetPasswordNotification::class);
        Notification::assertSentTimes(ResetPasswordNotification::class, 1);
    }

    public function test_json_password_reset_link_requests_use_the_same_response_for_known_and_unknown_emails(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $expected = ['message' => PasswordResetLinkResponse::MESSAGE];

        $knownResponse = $this->postJson(route('password.email'), [
            'email' => $user->email,
        ]);
        $unknownResponse = $this->postJson(route('password.email'), [
            'email' => 'unknown@example.com',
        ]);

        $knownResponse->assertOk()->assertExactJson($expected);
        $unknownResponse->assertOk()->assertExactJson($expected);
        Notification::assertSentTimes(ResetPasswordNotification::class, 1);
    }

    public function test_all_known_account_states_can_request_and_reset_a_password(): void
    {
        Notification::fake();

        $states = [
            'active-participant' => [
                'role' => 'participant',
                'access_status' => User::ACCESS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            'active-administrator' => [
                'role' => 'admin',
                'access_status' => User::ACCESS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            'pending-participant' => [
                'role' => 'participant',
                'access_status' => User::ACCESS_PENDING,
                'is_active' => false,
                'email_verified_at' => null,
            ],
            'revoked-participant' => [
                'role' => 'participant',
                'access_status' => User::ACCESS_REVOKED,
                'is_active' => false,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($states as $label => $attributes) {
            $user = User::factory()->create($attributes);

            $this->from(route('password.request'))
                ->post(route('password.email'), ['email' => $user->email])
                ->assertSessionHas('status', PasswordResetLinkResponse::MESSAGE);

            Notification::assertSentTo($user, ResetPasswordNotification::class);

            $notification = Notification::sent($user, ResetPasswordNotification::class)->first();

            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => "reset-{$label}-password",
                'password_confirmation' => "reset-{$label}-password",
            ])->assertRedirect(route('login'));

            $user->refresh();

            $this->assertTrue(Hash::check("reset-{$label}-password", $user->password));
            $this->assertSame($attributes['access_status'], $user->access_status);
            $this->assertSame($attributes['role'], $user->role);
            $this->assertSame($attributes['is_active'], $user->is_active);
            $this->assertSame(
                $attributes['email_verified_at'] !== null,
                $user->email_verified_at !== null,
            );
        }
    }

    public function test_reset_password_notification_has_branded_secure_content(): void
    {
        $user = User::factory()->create([
            'name' => 'Lead Lab Participant',
            'email' => 'participant@example.com',
        ]);

        $message = (new ResetPasswordNotification('reset-token'))->toMail($user);

        $this->assertSame('Reset your Lead Lab password', $message->subject);
        $this->assertSame('Hello Lead Lab Participant,', $message->greeting);
        $this->assertContains(
            'We received a request to reset the password for your Lead Lab account.',
            $message->introLines,
        );
        $this->assertSame('Reset password', $message->actionText);
        $this->assertStringContainsString('/reset-password/reset-token', $message->actionUrl);
        $this->assertContains(
            'This secure link expires in 60 minutes and can be used only once.',
            $message->outroLines,
        );
        $this->assertContains(
            'For your security, do not forward this email or share the reset link.',
            $message->outroLines,
        );
        $this->assertSame('Lead Lab Support', $message->salutation);
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordNotification::class, function (ResetPasswordNotification $notification) {
            $response = $this->get(route('password.reset', $notification->token));

            $response->assertOk();

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordNotification::class, function (ResetPasswordNotification $notification) use ($user) {
            $rememberToken = $user->remember_token;

            $response = $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'));

            $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
            $this->assertNotSame($rememberToken, $user->remember_token);
            $this->assertDatabaseHas('activity_logs', [
                'action' => 'password_reset',
                'subject_type' => User::class,
                'subject_id' => $user->id,
            ]);

            return true;
        });
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('password.update'), [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_password_reset_token_expires(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update([
                'created_at' => now()->subMinutes(
                    (int) config('auth.passwords.'.config('fortify.passwords').'.expire') + 1,
                ),
            ]);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }

    public function test_password_reset_token_can_only_be_used_once(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertRedirect(route('login'));

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'another-password',
            'password_confirmation' => 'another-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_password_reset_requires_matching_password_confirmation(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $response = $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }

    public function test_password_reset_invalidates_database_sessions_and_logs_without_sensitive_data(): void
    {
        config(['session.driver' => 'database']);

        $user = User::factory()->create();
        $sessionTable = (string) config('session.table', 'sessions');

        DB::table($sessionTable)->insert([
            'id' => 'password-reset-session-one',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Password reset test',
            'payload' => base64_encode('test-session'),
            'last_activity' => now()->timestamp,
        ]);

        $token = Password::broker()->createToken($user);

        $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertRedirect(route('login'));

        $this->assertDatabaseMissing($sessionTable, ['user_id' => $user->id]);

        $activity = DB::table('activity_logs')
            ->where('action', 'password_reset')
            ->where('subject_id', $user->id)
            ->first();

        $this->assertNotNull($activity);
        $metadata = json_decode((string) $activity->metadata, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame(['source' => 'password_recovery'], $metadata);
        $this->assertStringNotContainsString($token, (string) $activity->metadata);
        $this->assertStringNotContainsString('new-password', (string) $activity->metadata);
    }

    public function test_reset_password_link_requests_are_throttled_without_revealing_status(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => $user->email])
            ->assertSessionHas('status', PasswordResetLinkResponse::MESSAGE);

        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => $user->email])
            ->assertSessionHas('status', PasswordResetLinkResponse::MESSAGE);

        Notification::assertSentToTimes($user, ResetPasswordNotification::class, 1);
    }
}
