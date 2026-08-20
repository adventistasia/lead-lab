<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
use App\Support\YouTubeVideoReference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningSessionController
{
    public function index(): Response
    {
        $sessions = LearningSession::query()
            ->where('is_published', true)
            ->withCount('resources')
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

        return Inertia::render('classroom/index', [
            'sessions' => $sessions,
        ]);
    }

    public function show(Request $request, LearningSession $learningSession): Response
    {
        abort_unless($learningSession->is_published || $request->user()->isAdmin(), 404);

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
