<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::emailVerification());
    }

    public function test_email_verification_screen_can_be_rendered()
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get(route('verification.notice'));

        $response->assertOk();
    }

    public function test_pending_participant_can_reach_the_resend_page(): void
    {
        $user = User::factory()->unverified()->create([
            'access_status' => User::ACCESS_PENDING,
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get(route('registration.pending'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/registration-pending')
                ->where('emailVerified', false)
                ->where('emailVerificationRequired', true),
            );

        $this->get(route('verification.notice'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/verify-email')
                ->where('status', null),
            );
    }

    public function test_email_verification_notification_uses_email_branding(): void
    {
        $user = User::factory()->unverified()->create();

        $message = (new VerifyEmail)->toMail($user);
        $rendered = (string) $message->render();

        $this->assertStringContainsString('LEADHub', $rendered);
        $this->assertStringNotContainsString('Lead Lab', $rendered);
    }

    public function test_verification_notification_links_expire_after_72_hours(): void
    {
        $user = User::factory()->unverified()->create();

        $this->travelTo(Carbon::parse('2026-09-24 12:00:00', 'UTC'));

        $message = (new VerifyEmail)->toMail($user);
        parse_str((string) parse_url($message->actionUrl, PHP_URL_QUERY), $query);

        $this->assertSame(now()->addHours(72)->timestamp, (int) $query['expires']);
    }

    public function test_email_can_be_verified()
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
    }

    public function test_email_is_not_verified_with_invalid_hash()
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')],
        );

        $this->actingAs($user)
            ->get($verificationUrl)
            ->assertRedirect(route('verification.notice'))
            ->assertSessionHas('status', 'verification-link-invalid');

        Event::assertNotDispatched(Verified::class);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_verification_link_redirects_to_resend_page_with_recovery_message(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinute(),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->actingAs($user)
            ->get($verificationUrl)
            ->assertRedirect(route('verification.notice'))
            ->assertSessionHas('status', 'verification-link-invalid');

        $this->get(route('verification.notice'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/verify-email')
                ->where('status', 'verification-link-invalid'),
            );

        $this->post(route('verification.send'))
            ->assertRedirect(route('verification.notice'))
            ->assertSessionHas('status', 'verification-link-sent');

        Notification::assertSentTo($user, VerifyEmail::class);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_altered_verification_link_redirects_to_resend_page_with_recovery_message(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(72),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        ).'&altered=1';

        $this->actingAs($user)
            ->get($verificationUrl)
            ->assertRedirect(route('verification.notice'))
            ->assertSessionHas('status', 'verification-link-invalid');

        Event::assertNotDispatched(Verified::class);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_is_not_verified_with_invalid_user_id(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => 123, 'hash' => sha1($user->email)],
        );

        $this->actingAs($user)
            ->get($verificationUrl)
            ->assertRedirect(route('verification.notice'))
            ->assertSessionHas('status', 'verification-link-invalid');

        Event::assertNotDispatched(Verified::class);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_verified_user_is_redirected_to_dashboard_from_verification_prompt(): void
    {
        $user = User::factory()->create();

        Event::fake();

        $response = $this->actingAs($user)->get(route('verification.notice'));

        Event::assertNotDispatched(Verified::class);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_already_verified_user_visiting_verification_link_is_redirected_without_firing_event_again(): void
    {
        $user = User::factory()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->actingAs($user)->get($verificationUrl)
            ->assertRedirect(route('dashboard', absolute: false).'?verified=1');

        Event::assertNotDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }
}
