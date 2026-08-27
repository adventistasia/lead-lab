<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse;

class PendingRegistrationResponse implements RegisterResponse
{
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? new JsonResponse(['status' => 'pending'], 201)
            : redirect()->route('registration.pending');
    }
}
