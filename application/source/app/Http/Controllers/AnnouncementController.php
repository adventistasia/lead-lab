<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController
{
    public function index(Request $request): Response
    {
        $announcements = Announcement::query()
            ->published()
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Announcement $announcement): array => $this->summary(
                $announcement,
                $request->user(),
            ));

        return Inertia::render('announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Request $request, Announcement $announcement): Response
    {
        abort_unless($announcement->isPublished(), 404);

        if (! $request->hasHeader('X-Inertia-Prefetch')) {
            ActivityLog::record($request->user(), 'announcement_viewed', $announcement);
        }

        $publishedAt = $announcement->published_at?->copy()->setTimezone(
            $request->user()->effectiveTimezone(),
        );

        return Inertia::render('announcements/show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'is_pinned' => $announcement->is_pinned,
                'body_html' => $announcement->renderedBody(),
                'published_at_label' => $publishedAt?->format('M j, Y g:i A'),
            ],
            'timezone_label' => $request->user()->effectiveTimezoneLabel($publishedAt),
        ]);
    }

    /** @return array<string, mixed> */
    private function summary(Announcement $announcement, User $user): array
    {
        $publishedAt = $announcement->published_at?->copy()->setTimezone(
            $user->effectiveTimezone(),
        );

        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'summary' => $announcement->summaryPreview(),
            'is_pinned' => $announcement->is_pinned,
            'published_at' => $publishedAt?->toIso8601String(),
            'published_at_label' => $publishedAt?->format('M j, Y g:i A'),
            'timezone_label' => $user->effectiveTimezoneLabel($publishedAt),
            'url' => route('announcements.show', $announcement),
        ];
    }
}
