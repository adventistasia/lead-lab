<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __invoke(Request $request): Response
    {
        $sessions = LearningSession::query()
            ->where('is_published', true)
            ->whereNull('archived_at')
            ->withCount('resources')
            ->orderByDesc('session_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'category' => $session->category,
                'session_date' => $session->session_date->toDateString(),
                'description' => $session->description,
                'resources_count' => $session->resources_count,
            ])
            ->values();

        return Inertia::render('dashboard', [
            'sessions' => $sessions,
            'is_admin' => $request->user()->isAdmin(),
        ]);
    }
}
