<?php

namespace Tests\Feature\Auth;

use App\Providers\AppServiceProvider;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Tests\TestCase;

class PasswordPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_browser_password_rules_describe_a_compliant_subset(): void
    {
        $this->assertSame(
            'minlength: 8; required: lower; required: upper; required: digit;',
            AppServiceProvider::PASSWORD_RULES,
        );
    }

    public function test_passwords_with_at_least_three_character_types_are_accepted(): void
    {
        $passwords = [
            'abcdef1!',
            'ABCDEF1!',
            'Abcdef!@',
            'Abcdef12',
            'Abcdef1!',
        ];

        foreach ($passwords as $password) {
            $validator = $this->passwordValidator($password);

            $this->assertFalse(
                $validator->fails(),
                $password.': '.$validator->errors()->first('password'),
            );
        }
    }

    public function test_passwords_without_three_character_types_are_rejected(): void
    {
        $passwords = [
            'abcdefgh',
            'abcdef12',
            'abcdef!@',
            'ABCDEF12',
            '12345678',
        ];

        foreach ($passwords as $password) {
            $validator = $this->passwordValidator($password);

            $this->assertTrue(
                $validator->fails(),
                $password.' should have been rejected.',
            );
        }
    }

    public function test_passwords_shorter_than_eight_characters_are_rejected(): void
    {
        $validator = $this->passwordValidator('Ab1!xyz');

        $this->assertTrue($validator->fails());
        $this->assertStringContainsString(
            'at least 8 characters',
            (string) $validator->errors()->first('password'),
        );
    }

    public function test_character_type_validation_message_explains_the_requirement(): void
    {
        $validator = $this->passwordValidator('abcdef12');

        $this->assertTrue($validator->fails());
        $this->assertStringContainsString(
            'at least 3 of the following 4 character types',
            (string) $validator->errors()->first('password'),
        );
    }

    private function passwordValidator(string $password): ValidatorContract
    {
        return Validator::make(
            [
                'password' => $password,
                'password_confirmation' => $password,
            ],
            [
                'password' => ['required', 'string', Password::default(), 'confirmed'],
            ],
        );
    }
}
