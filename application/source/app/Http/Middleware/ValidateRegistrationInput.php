<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ValidateRegistrationInput
{
    /**
     * Reject structured email input before Fortify normalizes the username.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('post')
            && $request->is('register')
            && $request->has('email')
            && ! is_string($request->input('email'))) {
            throw ValidationException::withMessages([
                'email' => 'The email field must be a string.',
            ]);
        }

        return $next($request);
    }
}
