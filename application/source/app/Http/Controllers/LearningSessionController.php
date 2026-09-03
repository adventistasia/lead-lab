<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
use App\Models\SessionQuestion;
use App\Support\YouTubeVideoReference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningSessionController
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'season' => ['nullable', 'string', 'max:80'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $season = trim((string) ($validated['season'] ?? ''));
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $query = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at')
            ->withCount('resources')
            ->filterForClassroom($search, $season, $dateFrom, $dateTo);

        $sessions = $query
            ->orderByDesc('session_date')
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'season' => $session->season ?? '',
                'session_date' => $session->session_date?->toFormattedDateString() ?? '',
                'resources_count' => $session->resources_count,
                'video_thumbnail_url' => YouTubeVideoReference::thumbnailUrl(
                    $session->video_url,
                ),
            ])
            ->values();

        $seasons = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at')
            ->distinct()
            ->orderBy('season')
            ->pluck('season')
            ->values();

        return Inertia::render('classroom/index', [
            'sessions' => $sessions,
            'seasons' => $seasons,
            'filters' => [
                'search' => $search,
                'season' => $season,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function show(Request $request, LearningSession $learningSession): Response
    {
        abort_unless(
            $request->user()->isAdmin()
                || ($learningSession->is_published && $learningSession->archived_at === null),
            404,
        );

        $learningSession->load('resources');

        $questions = $learningSession->questions()
            ->with([
                'user:id,name,role',
                'votes',
                'answers' => fn ($query) => $query
                    ->with(['user:id,name,role', 'votes'])
                    ->oldest(),
            ])
            ->latest()
            ->get();

        $user = $request->user();

        $videoUrl = $learningSession->video_url;

        return Inertia::render('sessions/show', [
            'session' => [
                'id' => $learningSession->id,
                'title' => $learningSession->title,
                'season' => $learningSession->season ?? '',
                'session_date' => $learningSession->session_date?->toFormattedDateString() ?? '',
                'description' => $learningSession->description ?? '',
                'video_embed_url' => YouTubeVideoReference::embedUrl(
                    $videoUrl,
                    $request->getSchemeAndHttpHost(),
                ),
                'initial_tab' => $request->query('tab') === 'q-and-a'
                    ? 'q-and-a'
                    : 'materials',
                'resources' => $learningSession->resources->map(fn ($resource): array => [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'size' => $resource->size,
                    'download_url' => route('resources.download', $resource),
                ])->values(),
                'questions' => $questions->map(fn (SessionQuestion $question): array => [
                    'id' => $question->id,
                    'title' => $question->title,
                    'details' => $question->details,
                    'created_at' => $question->created_at->toIso8601String(),
                    'author' => [
                        'id' => $question->user->id,
                        'name' => $question->user->name,
                        'role' => $question->user->role,
                    ],
                    'votes_count' => $question->votes->count(),
                    'has_voted' => $question->votes->contains('user_id', $user->id),
                    'can_edit' => $user->isAdmin() || $question->user_id === $user->id,
                    'can_delete' => $user->isAdmin() || $question->user_id === $user->id,
                    'answers' => $question->answers->map(fn ($answer): array => [
                        'id' => $answer->id,
                        'body' => $answer->body,
                        'created_at' => $answer->created_at->toIso8601String(),
                        'author' => [
                            'id' => $answer->user->id,
                            'name' => $answer->user->name,
                            'role' => $answer->user->role,
                        ],
                        'votes_count' => $answer->votes->count(),
                        'has_voted' => $answer->votes->contains('user_id', $user->id),
                        'can_edit' => $user->isAdmin() || $answer->user_id === $user->id,
                        'can_delete' => $user->isAdmin() || $answer->user_id === $user->id,
                    ])->values()->all(),
                ])->values()->all(),
            ],
        ]);
    }
}
