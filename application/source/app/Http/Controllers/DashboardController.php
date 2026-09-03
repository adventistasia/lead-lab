<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\LearningSession;
use App\Models\SessionAnswer;
use App\Models\SessionQuestion;
use App\Models\User;
use App\Support\YouTubeVideoReference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __invoke(Request $request): Response
    {
        $timezone = (string) config('app.timezone');

        $visibleSession = static function (Builder $query): void {
            $query
                ->where('is_published', true)
                ->whereNull('archived_at');
        };

        $visibleSessions = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at');

        $metrics = [
            'sessions_ready' => (clone $visibleSessions)->count(),
            'active_members' => User::query()
                ->where('is_active', true)
                ->where('access_status', User::ACCESS_ACTIVE)
                ->count(),
            'community_activity' => SessionQuestion::query()
                ->whereHas('learningSession', $visibleSession)
                ->count()
                + SessionAnswer::query()
                    ->whereHas('question.learningSession', $visibleSession)
                    ->count(),
        ];

        $upcomingEvents = CalendarEvent::query()
            ->where('starts_at', '>=', now()->utc())
            ->orderBy('starts_at')
            ->orderBy('id')
            ->limit(3)
            ->get()
            ->map(function (CalendarEvent $event) use ($timezone): array {
                $startsAt = $event->starts_at->setTimezone($timezone);
                $endsAt = $event->ends_at->setTimezone($timezone);

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'location' => $event->location,
                    'live_broadcast_url' => $event->live_broadcast_url,
                    'starts_at' => $startsAt->toIso8601String(),
                    'ends_at' => $endsAt->toIso8601String(),
                    'start_date' => $startsAt->toDateString(),
                    'end_date' => $endsAt->toDateString(),
                    'remind_three_days_before' => $event->remind_three_days_before,
                    'remind_one_day_before' => $event->remind_one_day_before,
                    'remind_fifteen_minutes_before' => $event->remind_fifteen_minutes_before,
                ];
            })
            ->values();

        $sessions = (clone $visibleSessions)
            ->withCount('resources')
            ->orderByDesc('session_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'season' => $session->season ?? '',
                'session_date' => $session->session_date?->toDateString() ?? '',
                'description' => $session->description ?? '',
                'resources_count' => $session->resources_count,
                'video_thumbnail_url' => YouTubeVideoReference::thumbnailUrl(
                    $session->video_url,
                ),
            ])
            ->values();

        $questionActivities = SessionQuestion::query()
            ->whereHas('learningSession', $visibleSession)
            ->with(['user:id,name', 'learningSession:id,title'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(3)
            ->get()
            ->map(fn (SessionQuestion $question): array => [
                'id' => "question-{$question->id}",
                'type' => 'question',
                'author' => $question->user->name,
                'text' => "Asked: {$question->title}",
                'time' => $question->created_at->diffForHumans(),
                'session_title' => $question->learningSession->title,
                'url' => route('sessions.show', [
                    'learningSession' => $question->learningSession,
                    'tab' => 'q-and-a',
                ])."#question-{$question->id}",
                '_sort' => $question->created_at->getTimestamp(),
            ]);

        $answerActivities = SessionAnswer::query()
            ->whereHas('question.learningSession', $visibleSession)
            ->with([
                'user:id,name',
                'question:id,learning_session_id,title',
                'question.learningSession:id,title',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(3)
            ->get()
            ->map(fn (SessionAnswer $answer): array => [
                'id' => "answer-{$answer->id}",
                'type' => 'answer',
                'author' => $answer->user->name,
                'text' => 'Answered: '.Str::limit($answer->body, 160),
                'time' => $answer->created_at->diffForHumans(),
                'session_title' => $answer->question->learningSession->title,
                'url' => route('sessions.show', [
                    'learningSession' => $answer->question->learningSession,
                    'tab' => 'q-and-a',
                ])."#question-{$answer->question->id}",
                '_sort' => $answer->created_at->getTimestamp(),
            ]);

        $communityUpdates = $questionActivities
            ->concat($answerActivities)
            ->sortByDesc(fn (array $activity): int => $activity['_sort'])
            ->take(3)
            ->values()
            ->map(fn (array $activity): array => [
                'id' => $activity['id'],
                'type' => $activity['type'],
                'author' => $activity['author'],
                'text' => $activity['text'],
                'time' => $activity['time'],
                'session_title' => $activity['session_title'],
                'url' => $activity['url'],
            ]);

        return Inertia::render('dashboard', [
            'metrics' => $metrics,
            'sessions' => $sessions,
            'upcoming_events' => $upcomingEvents,
            'timezone' => $timezone,
            'community_updates' => $communityUpdates,
            'is_admin' => $request->user()->isAdmin(),
        ]);
    }
}
