<?php

namespace App\Providers;

use App\Rules\PasswordCharacterTypes;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public const PASSWORD_RULES = 'minlength: 8; required: lower; required: upper; required: digit;';

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(function (): Password {
            $password = Password::min(8)
                ->rules([new PasswordCharacterTypes]);

            if (app()->isProduction()) {
                $password->uncompromised();
            }

            return $password;
        });
    }
}
