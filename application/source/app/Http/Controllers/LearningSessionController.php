<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningSessionController
{
    public function show(Request $request, LearningSession $learningSession): Response
    {
        abort_unless($learningSession->is_published || $request->user()->isAdmin(), 404);

        $learningSession->load('resources');

        return Inertia::render('sessions/show', [
            'session' => [
                'id' => $learningSession->id,
                'title' => $learningSession->title,
                'category' => $learningSession->category,
                'session_date' => $learningSession->session_date->toFormattedDateString(),
                'description' => $learningSession->description,
                'video_embed_url' => $this->youtubeEmbedUrl($learningSession->video_url),
                'resources' => $learningSession->resources->map(fn ($resource): array => [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'size' => $resource->size,
                    'download_url' => route('resources.download', $resource),
                ])->values(),
            ],
        ]);
    }

    private function youtubeEmbedUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $parsed = parse_url($url);
        $host = is_array($parsed) ? ($parsed['host'] ?? '') : '';
        $path = is_array($parsed) ? trim($parsed['path'] ?? '', '/') : '';
        $videoId = null;

        if (str_contains($host, 'youtu.be')) {
            $candidate = strtok($path, '/');
            $videoId = is_string($candidate) ? $candidate : null;
        } elseif (is_array($parsed) && isset($parsed['query'])) {
            parse_str($parsed['query'], $query);
            $candidate = $query['v'] ?? null;
            $videoId = is_string($candidate) ? $candidate : null;
        } elseif (preg_match('#(?:embed|shorts)/([^/?]+)#', $path, $matches)) {
            $videoId = $matches[1];
        }

        return $videoId
            ? 'https://www.youtube-nocookie.com/embed/'.rawurlencode($videoId)
            : null;
    }
}
