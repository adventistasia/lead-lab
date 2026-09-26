<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LearningSession;
use App\Models\SessionAnswer;
use App\Models\SessionAnswerVote;
use App\Models\SessionQuestion;
use App\Models\SessionQuestionVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SessionQnaController
{
    public function storeQuestion(Request $request, LearningSession $learningSession): RedirectResponse
    {
        $this->ensureSessionVisible($request, $learningSession);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'details' => ['nullable', 'string', 'max:5000'],
        ]);

        $question = $learningSession->questions()->create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'details' => $validated['details'] ?? null,
        ]);
        ActivityLog::record($request->user(), 'qna_question_created', $question);

        return back();
    }

    public function updateQuestion(
        Request $request,
        LearningSession $learningSession,
        SessionQuestion $sessionQuestion,
    ): RedirectResponse {
        $this->ensureQuestionBelongsToSession($learningSession, $sessionQuestion);
        $this->ensureSessionVisible($request, $learningSession);
        $this->ensureCanManage($request, $sessionQuestion->user_id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'details' => ['nullable', 'string', 'max:5000'],
        ]);

        $sessionQuestion->update([
            'title' => $validated['title'],
            'details' => $validated['details'] ?? null,
        ]);
        if (! $request->user()->isAdmin()) {
            ActivityLog::record($request->user(), 'qna_question_updated', $sessionQuestion);
        }
        $this->recordQuestionModeration($request, 'qna_question_updated', $sessionQuestion);

        return back();
    }

    public function destroyQuestion(
        Request $request,
        LearningSession $learningSession,
        SessionQuestion $sessionQuestion,
    ): RedirectResponse {
        $this->ensureQuestionBelongsToSession($learningSession, $sessionQuestion);
        $this->ensureSessionVisible($request, $learningSession);
        $this->ensureCanManage($request, $sessionQuestion->user_id);

        if ($request->user()->isAdmin()) {
            $this->recordQuestionModeration($request, 'qna_question_deleted', $sessionQuestion);
        } else {
            ActivityLog::record($request->user(), 'qna_question_deleted', $sessionQuestion);
        }
        $sessionQuestion->delete();

        return back();
    }

    public function storeAnswer(Request $request, SessionQuestion $sessionQuestion): RedirectResponse
    {
        $sessionQuestion->load('learningSession');
        $this->ensureSessionVisible($request, $sessionQuestion->learningSession);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $answer = $sessionQuestion->answers()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);
        ActivityLog::record($request->user(), 'qna_answer_created', $answer);

        return back();
    }

    public function updateAnswer(
        Request $request,
        SessionQuestion $sessionQuestion,
        SessionAnswer $sessionAnswer,
    ): RedirectResponse {
        $this->ensureAnswerBelongsToQuestion($sessionQuestion, $sessionAnswer);
        $sessionQuestion->load('learningSession');
        $this->ensureSessionVisible($request, $sessionQuestion->learningSession);
        $this->ensureCanManage($request, $sessionAnswer->user_id);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $sessionAnswer->update(['body' => $validated['body']]);
        if (! $request->user()->isAdmin()) {
            ActivityLog::record($request->user(), 'qna_answer_updated', $sessionAnswer);
        }
        $this->recordAnswerModeration($request, 'qna_answer_updated', $sessionQuestion, $sessionAnswer);

        return back();
    }

    public function destroyAnswer(
        Request $request,
        SessionQuestion $sessionQuestion,
        SessionAnswer $sessionAnswer,
    ): RedirectResponse {
        $this->ensureAnswerBelongsToQuestion($sessionQuestion, $sessionAnswer);
        $sessionQuestion->load('learningSession');
        $this->ensureSessionVisible($request, $sessionQuestion->learningSession);
        $this->ensureCanManage($request, $sessionAnswer->user_id);

        if ($request->user()->isAdmin()) {
            $this->recordAnswerModeration($request, 'qna_answer_deleted', $sessionQuestion, $sessionAnswer);
        } else {
            ActivityLog::record($request->user(), 'qna_answer_deleted', $sessionAnswer);
        }
        $sessionAnswer->delete();

        return back();
    }

    public function toggleQuestionVote(Request $request, SessionQuestion $sessionQuestion): RedirectResponse
    {
        $sessionQuestion->load('learningSession');
        $this->ensureSessionVisible($request, $sessionQuestion->learningSession);

        $vote = $sessionQuestion->votes()
            ->where('user_id', $request->user()->id)
            ->first();

        if ($vote instanceof SessionQuestionVote) {
            $vote->delete();
            $action = 'qna_question_vote_removed';
        } else {
            $sessionQuestion->votes()->create(['user_id' => $request->user()->id]);
            $action = 'qna_question_vote_added';
        }

        ActivityLog::record($request->user(), $action, $sessionQuestion);

        return back();
    }

    public function toggleAnswerVote(Request $request, SessionAnswer $sessionAnswer): RedirectResponse
    {
        $sessionAnswer->load('question.learningSession');
        $this->ensureSessionVisible($request, $sessionAnswer->question->learningSession);

        $vote = $sessionAnswer->votes()
            ->where('user_id', $request->user()->id)
            ->first();

        if ($vote instanceof SessionAnswerVote) {
            $vote->delete();
            $action = 'qna_answer_vote_removed';
        } else {
            $sessionAnswer->votes()->create(['user_id' => $request->user()->id]);
            $action = 'qna_answer_vote_added';
        }

        ActivityLog::record($request->user(), $action, $sessionAnswer);

        return back();
    }

    private function ensureSessionVisible(Request $request, LearningSession $learningSession): void
    {
        abort_unless(
            $request->user()->isAdmin()
                || ($learningSession->is_published && $learningSession->archived_at === null),
            404,
        );
    }

    private function ensureQuestionBelongsToSession(
        LearningSession $learningSession,
        SessionQuestion $sessionQuestion,
    ): void {
        abort_unless($sessionQuestion->learning_session_id === $learningSession->id, 404);
    }

    private function ensureAnswerBelongsToQuestion(
        SessionQuestion $sessionQuestion,
        SessionAnswer $sessionAnswer,
    ): void {
        abort_unless($sessionAnswer->session_question_id === $sessionQuestion->id, 404);
    }

    private function ensureCanManage(Request $request, int $ownerId): void
    {
        abort_unless(
            $request->user()->isAdmin() || $request->user()->id === $ownerId,
            403,
        );
    }

    private function recordQuestionModeration(
        Request $request,
        string $action,
        SessionQuestion $sessionQuestion,
    ): void {
        if (! $request->user()->isAdmin()) {
            return;
        }

        ActivityLog::record($request->user(), $action, $sessionQuestion, [
            'learning_session_id' => $sessionQuestion->learning_session_id,
            'content_owner_id' => $sessionQuestion->user_id,
        ]);
    }

    private function recordAnswerModeration(
        Request $request,
        string $action,
        SessionQuestion $sessionQuestion,
        SessionAnswer $sessionAnswer,
    ): void {
        if (! $request->user()->isAdmin()) {
            return;
        }

        ActivityLog::record($request->user(), $action, $sessionAnswer, [
            'learning_session_id' => $sessionQuestion->learning_session_id,
            'session_question_id' => $sessionQuestion->id,
            'content_owner_id' => $sessionAnswer->user_id,
        ]);
    }
}
