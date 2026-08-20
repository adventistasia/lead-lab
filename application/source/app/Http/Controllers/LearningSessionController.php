<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
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
            'category' => ['nullable', 'string', 'max:80'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $category = trim((string) ($validated['category'] ?? ''));
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $query = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at')
            ->withCount('resources')
            ->filterForClassroom($search, $category, $dateFrom, $dateTo);

        $sessions = $query
            ->orderByDesc('session_date')
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'category' => $session->category,
                'session_date' => $session->session_date->toFormattedDateString(),
                'resources_count' => $session->resources_count,
            ])
            ->values();

        $categories = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->values();

        return Inertia::render('classroom/index', [
            'sessions' => $sessions,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category,
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

        $videoUrl = $learningSession->video_url;

        return Inertia::render('sessions/show', [
            'session' => [
                'id' => $learningSession->id,
                'title' => $learningSession->title,
                'category' => $learningSession->category,
                'session_date' => $learningSession->session_date->toFormattedDateString(),
                'description' => $learningSession->description,
                'video_embed_url' => YouTubeVideoReference::embedUrl(
                    $videoUrl,
                    $request->getSchemeAndHttpHost(),
                ),
                'resources' => $learningSession->resources->map(fn ($resource): array => [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'size' => $resource->size,
                    'download_url' => route('resources.download', $resource),
                ])->values(),
            ],
        ]);
    }
}
