<?php

namespace App\Http\Middleware;

use App\Models\SessionAnswer;
use App\Models\SessionQuestion;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuppressRedirectedActivityViews
{
    public const REQUEST_ATTRIBUTE = 'suppress_redirected_activity_view';

    private const SESSION_KEY = '_suppress_redirected_activity_view';

    /**
     * Suppress only the view caused by the redirect after an action.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $redirectTarget = $request->session()->pull(self::SESSION_KEY);

        if (
            $request->isMethod('GET')
            && is_string($redirectTarget)
            && $request->getPathInfo() === $redirectTarget
        ) {
            $request->attributes->set(self::REQUEST_ATTRIBUTE, true);
        }

        $response = $next($request);
        $redirectTarget = $this->activityRedirectTarget($request, $response);

        if ($redirectTarget !== null) {
            $request->session()->flash(self::SESSION_KEY, $redirectTarget);
        }

        return $response;
    }

    private function activityRedirectTarget(Request $request, Response $response): ?string
    {
        if (! $response->isRedirect()) {
            return null;
        }

        $locationPath = parse_url((string) $response->headers->get('Location'), PHP_URL_PATH);

        if (! is_string($locationPath)) {
            return null;
        }

        if ($request->routeIs('sessions.questions.*')) {
            $sessionId = $this->routeKey($request->route('learningSession'));
            $sessionUrl = $sessionId === null
                ? null
                : route('sessions.show', ['learningSession' => $sessionId], false);
            $sessionPath = $sessionUrl === null
                ? null
                : parse_url($sessionUrl, PHP_URL_PATH);

            return is_string($sessionPath) && $locationPath === $sessionPath
                ? $sessionPath
                : null;
        }

        if ($request->routeIs('questions.answers.*', 'questions.vote')) {
            $questionId = $this->routeKey($request->route('sessionQuestion'));

            if ($questionId === null) {
                return null;
            }

            $sessionId = SessionQuestion::query()
                ->whereKey($questionId)
                ->value('learning_session_id');
            $sessionId = is_string($sessionId) && ctype_digit($sessionId)
                ? (int) $sessionId
                : $sessionId;
            $sessionUrl = is_int($sessionId)
                ? route('sessions.show', ['learningSession' => $sessionId], false)
                : null;
            $sessionPath = $sessionUrl === null
                ? null
                : parse_url($sessionUrl, PHP_URL_PATH);

            return is_string($sessionPath) && $locationPath === $sessionPath
                ? $sessionPath
                : null;
        }

        if ($request->routeIs('answers.vote')) {
            $answerId = $this->routeKey($request->route('sessionAnswer'));

            if ($answerId === null) {
                return null;
            }

            $sessionId = SessionAnswer::query()
                ->join('session_questions', 'session_questions.id', '=', 'session_answers.session_question_id')
                ->where('session_answers.id', $answerId)
                ->value('session_questions.learning_session_id');
            $sessionId = is_string($sessionId) && ctype_digit($sessionId)
                ? (int) $sessionId
                : $sessionId;
            $sessionUrl = is_int($sessionId)
                ? route('sessions.show', ['learningSession' => $sessionId], false)
                : null;
            $sessionPath = $sessionUrl === null
                ? null
                : parse_url($sessionUrl, PHP_URL_PATH);

            return is_string($sessionPath) && $locationPath === $sessionPath
                ? $sessionPath
                : null;
        }

        if (
            $request->routeIs(
                'admin.calendar-events.store',
                'admin.calendar-events.update',
                'admin.calendar-events.destroy',
            )
            && $request->input('return_to') === 'calendar'
        ) {
            $calendarPath = parse_url(route('calendar', [], false), PHP_URL_PATH);

            return is_string($calendarPath) && $locationPath === $calendarPath
                ? $calendarPath
                : null;
        }

        return null;
    }

    private function routeKey(mixed $parameter): ?int
    {
        $key = $parameter instanceof Model ? $parameter->getKey() : $parameter;

        if (is_int($key)) {
            return $key;
        }

        return is_string($key) && ctype_digit($key)
            ? (int) $key
            : null;
    }
}
