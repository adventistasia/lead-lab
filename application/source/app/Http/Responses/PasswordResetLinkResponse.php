<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;

class PasswordResetLinkResponse implements FailedPasswordResetLinkRequestResponse, SuccessfulPasswordResetLinkRequestResponse
{
    public const MESSAGE = 'If an account exists for that email address, we will email a password reset link.';

    public function toResponse($request)
    {
        return $request->wantsJson()
            ? new JsonResponse(['message' => __(self::MESSAGE)], 200)
            : back()->with('status', __(self::MESSAGE));
    }
}
