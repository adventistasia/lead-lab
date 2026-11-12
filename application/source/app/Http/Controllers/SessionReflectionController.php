<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LearningSession;
use App\Models\SessionReflection;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SessionReflectionController
{
    public function store(Request $request, LearningSession $learningSession): RedirectResponse
    {
        $this->ensureSessionVisible($request, $learningSession);
        $body = $this->validatedBody($request);

        if ($learningSession->reflections()->where('user_id', $request->user()->id)->exists()) {
            throw ValidationException::withMessages([
                'body' => 'You already have a reflection for this session. Edit your saved reflection instead.',
            ]);
        }

        try {
            $reflection = $learningSession->reflections()->create([
                'user_id' => $request->user()->id,
                'body' => $body,
            ]);
        } catch (QueryException $exception) {
            if (! $this->isUniqueReflectionViolation($exception)) {
                throw $exception;
            }

            throw ValidationException::withMessages([
                'body' => 'You already have a reflection for this session. Edit your saved reflection instead.',
            ]);
        }

        ActivityLog::record($request->user(), 'reflection_created', $reflection);

        return back();
    }

    public function update(
        Request $request,
        LearningSession $learningSession,
        SessionReflection $sessionReflection,
    ): RedirectResponse {
        $this->ensureReflectionBelongsToSession($learningSession, $sessionReflection);
        $this->ensureSessionVisible($request, $learningSession);
        $this->ensureCanEdit($request, $sessionReflection);

        $sessionReflection->update([
            'body' => $this->validatedBody($request),
            'edited_at' => now(),
        ]);
        ActivityLog::record($request->user(), 'reflection_updated', $sessionReflection);

        return back();
    }

    public function destroy(
        Request $request,
        LearningSession $learningSession,
        SessionReflection $sessionReflection,
    ): RedirectResponse {
        $this->ensureReflectionBelongsToSession($learningSession, $sessionReflection);
        $this->ensureSessionVisible($request, $learningSession);
        $this->ensureCanDelete($request, $sessionReflection);

        if ($request->user()->isAdmin() && $sessionReflection->user_id !== $request->user()->id) {
            ActivityLog::record($request->user(), 'reflection_deleted', $sessionReflection, [
                'learning_session_id' => $sessionReflection->learning_session_id,
                'content_owner_id' => $sessionReflection->user_id,
            ]);
        } else {
            ActivityLog::record($request->user(), 'reflection_deleted', $sessionReflection);
        }
        $sessionReflection->delete();

        return back();
    }

    private function validatedBody(Request $request): string
    {
        $validated = $request->validate([
            'body' => ['nullable', 'string', 'max:5000'],
        ], [
            'body.max' => 'Use 5,000 characters or fewer',
        ]);
        $body = trim((string) ($validated['body'] ?? ''));

        if ($body === '') {
            throw ValidationException::withMessages([
                'body' => 'Enter a reflection',
            ]);
        }

        return $body;
    }

    private function ensureSessionVisible(Request $request, LearningSession $learningSession): void
    {
        abort_unless(
            $request->user()->isAdmin()
                || ($learningSession->is_published && $learningSession->archived_at === null),
            404,
        );
    }

    private function ensureReflectionBelongsToSession(
        LearningSession $learningSession,
        SessionReflection $sessionReflection,
    ): void {
        abort_unless($sessionReflection->learning_session_id === $learningSession->id, 404);
    }

    private function ensureCanEdit(Request $request, SessionReflection $sessionReflection): void
    {
        abort_unless($request->user()->id === $sessionReflection->user_id, 403);
    }

    private function ensureCanDelete(Request $request, SessionReflection $sessionReflection): void
    {
        abort_unless(
            $request->user()->isAdmin() || $request->user()->id === $sessionReflection->user_id,
            403,
        );
    }

    private function isUniqueReflectionViolation(QueryException $exception): bool
    {
        return $exception->getCode() === '23000';
    }
}
