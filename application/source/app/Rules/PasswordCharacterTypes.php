<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordCharacterTypes implements ValidationRule
{
    /**
     * Validate that a password contains at least three character categories.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        $hasCharacterType = [
            preg_match('/\p{Lu}/u', $value) === 1,
            preg_match('/\p{Ll}/u', $value) === 1,
            preg_match('/\p{N}/u', $value) === 1,
            preg_match('/[\p{S}\p{P}]/u', $value) === 1,
        ];

        if (count(array_filter($hasCharacterType)) < 3) {
            $fail('The :attribute must contain at least 3 of the following 4 character types: an uppercase letter, a lowercase letter, a number, and a special character.');
        }
    }
}
