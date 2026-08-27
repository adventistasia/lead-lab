<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\NewParticipantRegistrationNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $registrationKey = 'registration:'.(request()->ip() ?? 'unknown');

        if (! RateLimiter::attempt($registrationKey, 5, fn (): bool => true, 60)) {
            throw ValidationException::withMessages([
                'email' => 'Too many registration attempts. Please try again later.',
            ]);
        }

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => 'participant',
            'is_active' => false,
            'access_status' => User::ACCESS_PENDING,
        ]);

        ActivityLog::record(null, 'participant_registered', $user);

        $administrators = User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->where('access_status', User::ACCESS_ACTIVE)
            ->get();

        Notification::send(
            $administrators,
            new NewParticipantRegistrationNotification($user),
        );

        return $user;
    }
}
