<?php

namespace App\Http\Controllers;

use App\Models\LearningResource;
use App\Models\LearningSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLearningSessionController
{
    public function index(): Response
    {
        $sessions = LearningSession::query()
            ->withCount('resources')
            ->orderByDesc('session_date')
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'category' => $session->category,
                'session_date' => $session->session_date->toDateString(),
                'is_published' => $session->is_published,
                'resources_count' => $session->resources_count,
            ])
            ->values();

        return Inertia::render('admin/sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'session_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:5000'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
            'resource' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,txt'],
        ]);

        $session = LearningSession::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'session_date' => $validated['session_date'],
            'description' => $validated['description'],
            'video_url' => $validated['video_url'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        if ($request->hasFile('resource')) {
            $file = $request->file('resource');

            LearningResource::create([
                'learning_session_id' => $session->id,
                'title' => $file->getClientOriginalName(),
                'stored_path' => $file->store('lead-lab/resources'),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return to_route('admin.sessions.index')->with('success', 'Session published to the Lead Lab classroom.');
    }
}
