<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property bool $is_active
 * @property string $access_status
 * @property string|null $timezone
 * @property bool $must_change_password
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'is_active', 'access_status', 'timezone', 'must_change_password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    public const DEFAULT_TIMEZONE = 'Asia/Manila';

    public const ACCESS_PENDING = 'pending';

    public const ACCESS_ACTIVE = 'active';

    public const ACCESS_REVOKED = 'revoked';

    /** @use HasFactory<UserFactory> */
    use HasFactory, MustVerifyEmailTrait, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function sendEmailVerificationNotification(): void
    {
        if (! config('fortify.require_email_verification')) {
            return;
        }

        $this->notify(new VerifyEmail);
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    public function isPending(): bool
    {
        return $this->access_status === self::ACCESS_PENDING;
    }

    public function isRevoked(): bool
    {
        return $this->access_status === self::ACCESS_REVOKED;
    }

    public function canAccessLeadLab(): bool
    {
        return $this->is_active && $this->access_status === self::ACCESS_ACTIVE;
    }

    public function effectiveTimezone(): string
    {
        $timezone = $this->timezone ?: config('app.default_timezone', self::DEFAULT_TIMEZONE);

        return is_string($timezone) && in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : self::DEFAULT_TIMEZONE;
    }

    public function effectiveTimezoneLabel(?CarbonInterface $at = null): string
    {
        $timezone = $this->effectiveTimezone();
        $offsetMinutes = intdiv(
            ($at ?? Carbon::now('UTC'))->copy()->setTimezone($timezone)->getOffset(),
            60,
        );
        $sign = $offsetMinutes < 0 ? '-' : '+';
        $absoluteMinutes = abs($offsetMinutes);
        $hours = intdiv($absoluteMinutes, 60);
        $minutes = $absoluteMinutes % 60;
        $offset = $minutes === 0
            ? $sign.$hours
            : sprintf('%s%d:%02d', $sign, $hours, $minutes);

        return "GMT{$offset} ({$timezone})";
    }

    /** @return HasMany<SessionQuestion, $this> */
    public function sessionQuestions(): HasMany
    {
        return $this->hasMany(SessionQuestion::class);
    }

    /** @return HasMany<SessionAnswer, $this> */
    public function sessionAnswers(): HasMany
    {
        return $this->hasMany(SessionAnswer::class);
    }
}
