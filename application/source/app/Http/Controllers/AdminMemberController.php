<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminMemberController
{
    public function index(Request $request): Response
    {
        $members = User::query()
            ->whereKeyNot($request->user()->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'access_status', 'email_verified_at', 'created_at'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'access_status' => $user->access_status,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toFormattedDateString(),
            ])
            ->values();

        return Inertia::render('admin/members/index', [
            'members' => $members,
            'emailVerificationRequired' => config('fortify.require_email_verification'),
        ]);
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'Administrators cannot disable their own account.');

        $status = $request->validate([
            'status' => ['required', Rule::in([
                User::ACCESS_ACTIVE,
                User::ACCESS_REVOKED,
            ])],
        ])['status'];

        if (
            $status === User::ACCESS_ACTIVE
            && config('fortify.require_email_verification')
            && ! $user->hasVerifiedEmail()
        ) {
            return back()->withErrors([
                'status' => 'The participant must verify their email before access is approved.',
            ]);
        }

        $wasPending = $user->isPending();

        $user->update([
            'access_status' => $status,
            'is_active' => $status === User::ACCESS_ACTIVE,
        ]);

        ActivityLog::record(
            $request->user(),
            $status === User::ACCESS_ACTIVE
                ? ($wasPending ? 'member_access_approved' : 'member_access_restored')
                : 'member_access_revoked',
            $user,
            ['access_status' => $status],
        );

        return back()->with(
            'success',
            $status === User::ACCESS_ACTIVE ? 'Member access approved.' : 'Member access revoked.',
        );
    }
}
