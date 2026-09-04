<?php

use App\Http\Middleware\EnsureActiveUser;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandlePostSize;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\ValidatePostSize;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->remove(ValidatePostSize::class);

        // Behind the deploy stack's reverse proxy (Caddy/FrankenPHP terminates
        // TLS upstream), Laravel needs to trust X-Forwarded-* or every request
        // looks like plain HTTP from the container network. TRUSTED_PROXIES is
        // a comma-separated CIDR list, or "*" to trust the immediate proxy —
        // safe only because compose.yaml never exposes the app port beyond a
        // trusted reverse proxy.
        // env() is correct here and config() is not: this closure runs while the
        // kernel is being resolved, before the config service is bound, so
        // config() fatals with "Target class [config] does not exist" and takes
        // the whole application down. Verified against the deployed image.
        /** @phpstan-ignore larastan.noEnvCallsOutsideOfConfig */
        $trustedProxies = env('TRUSTED_PROXIES', '*');

        $middleware->trustProxies(
            at: $trustedProxies === '*' ? '*' : array_filter(explode(',', (string) $trustedProxies)),
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->alias([
            'active' => EnsureActiveUser::class,
            'admin' => EnsureAdmin::class,
        ]);

        $middleware->web(
            append: [
                // Run after sessions start so oversized batch errors can flash back to the form.
                HandlePostSize::class,
                HandleAppearance::class,
                HandleInertiaRequests::class,
                AddLinkHeadersForPreloadedAssets::class,
            ],
        );
        $middleware->api(append: [HandlePostSize::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
