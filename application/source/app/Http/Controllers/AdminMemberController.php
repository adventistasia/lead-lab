<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminMemberController
{
    private const STATE_ACTIVE = 'active';

    private const STATE_PENDING_EMAIL_VERIFICATION = 'pending-email-verification';

    private const STATE_PENDING_ADMIN_ACCEPTANCE = 'pending-admin-acceptance';

    private const STATE_REVOKED = 'revoked';

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', Rule::in([
                self::STATE_ACTIVE,
                self::STATE_PENDING_EMAIL_VERIFICATION,
                self::STATE_PENDING_ADMIN_ACCEPTANCE,
                self::STATE_REVOKED,
            ])],
        ]);
        $search = trim((string) ($filters['search'] ?? ''));
        $state = $filters['state'] ?? self::STATE_ACTIVE;
        $emailVerificationRequired = (bool) config('fortify.require_email_verification');
        $baseQuery = User::query()->whereKeyNot($request->user()->id);

        $members = $this->applyStateFilter(
            clone $baseQuery,
            $state,
            $emailVerificationRequired,
        )
            ->when($search !== '', function (Builder $query) use ($search): void {
                $like = "%{$search}%";

                $query->where(function (Builder $query) use ($like): void {
                    $query
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'access_status' => $user->access_status,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toFormattedDateString(),
            ]);

        $counts = [
            self::STATE_ACTIVE => $this->countMembersInState(
                clone $baseQuery,
                self::STATE_ACTIVE,
                $emailVerificationRequired,
            ),
            self::STATE_PENDING_EMAIL_VERIFICATION => $this->countMembersInState(
                clone $baseQuery,
                self::STATE_PENDING_EMAIL_VERIFICATION,
                $emailVerificationRequired,
            ),
            self::STATE_PENDING_ADMIN_ACCEPTANCE => $this->countMembersInState(
                clone $baseQuery,
                self::STATE_PENDING_ADMIN_ACCEPTANCE,
                $emailVerificationRequired,
            ),
            self::STATE_REVOKED => $this->countMembersInState(
                clone $baseQuery,
                self::STATE_REVOKED,
                $emailVerificationRequired,
            ),
        ];

        return Inertia::render('admin/members/index', [
            'members' => $members,
            'counts' => $counts,
            'filters' => [
                'search' => $search,
                'state' => $state,
            ],
            'emailVerificationRequired' => $emailVerificationRequired,
        ]);
    }

    /**
     * @param  Builder<User>  $query
     */
    private function countMembersInState(
        Builder $query,
        string $state,
        bool $emailVerificationRequired,
    ): int {
        return $this->applyStateFilter($query, $state, $emailVerificationRequired)->count();
    }

    /**
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    private function applyStateFilter(
        Builder $query,
        string $state,
        bool $emailVerificationRequired,
    ): Builder {
        if ($state === self::STATE_ACTIVE) {
            return $query->where('access_status', User::ACCESS_ACTIVE);
        }

        if ($state === self::STATE_REVOKED) {
            return $query->where('access_status', User::ACCESS_REVOKED);
        }

        $query->where('access_status', User::ACCESS_PENDING);

        if ($state === self::STATE_PENDING_EMAIL_VERIFICATION) {
            return $emailVerificationRequired
                ? $query->whereNull('email_verified_at')
                : $query->whereRaw('1 = 0');
        }

        return $emailVerificationRequired
            ? $query->whereNotNull('email_verified_at')
            : $query;
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

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'Administrators cannot change their own role.');

        $role = $request->validate([
            'role' => ['required', Rule::in(['admin', 'participant'])],
        ])['role'];

        if (! in_array($user->role, ['admin', 'participant'], true)) {
            return back()->withErrors([
                'role' => 'This member role cannot be changed yet.',
            ]);
        }

        if ($user->role === $role) {
            return back()->with('success', 'Member role is unchanged.');
        }

        $previousRole = $user->role;

        $user->update([
            'role' => $role,
        ]);

        ActivityLog::record(
            $request->user(),
            'member_role_changed',
            $user,
            [
                'from_role' => $previousRole,
                'to_role' => $role,
            ],
        );

        return back()->with(
            'success',
            $role === 'admin'
                ? 'Member is now an administrator.'
                : 'Member is now a participant.',
        );
    }
}
