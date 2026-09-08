<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $assert) => $assert
                ->component('settings/profile')
                ->has('timezones')
                ->where('timezones', fn (Collection $timezones): bool => $timezones->contains('Asia/Manila')),
            );
    }

    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_profile_timezone_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'timezone' => 'America/New_York',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertSame('America/New_York', $user->refresh()->timezone);
    }

    public function test_invalid_profile_timezone_is_rejected(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'timezone' => 'Not/A_Timezone',
            ])
            ->assertSessionHasErrors('timezone');

        $this->assertNull($user->refresh()->timezone);
    }

    public function test_browser_timezone_is_saved_when_no_profile_timezone_exists(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->patch(route('profile.timezone'), [
                'timezone' => 'Asia/Manila',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('Asia/Manila', $user->refresh()->timezone);
    }

    public function test_browser_timezone_does_not_replace_a_profile_timezone(): void
    {
        $user = User::factory()->create(['timezone' => 'America/New_York']);

        $this
            ->actingAs($user)
            ->patch(route('profile.timezone'), [
                'timezone' => 'Asia/Manila',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('America/New_York', $user->refresh()->timezone);
    }

    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }
}
