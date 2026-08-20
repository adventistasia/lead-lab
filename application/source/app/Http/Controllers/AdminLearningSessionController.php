<?php

namespace App\Http\Controllers;

use App\Models\LearningResource;
use App\Models\LearningSession;
use App\Support\YouTubeVideoReference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class AdminLearningSessionController
{
    public function index(): Response
    {
        return Inertia::render('admin/sessions/index', [
            'sessions' => $this->sessionSummaries(),
        ]);
    }

    public function recordings(Request $request): Response
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

        return Inertia::render('admin/classroom/index', [
            'sessions' => $this->sessionSummaries(
                $search,
                $category,
                $dateFrom,
                $dateTo,
            ),
            'categories' => LearningSession::query()
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->values(),
            'filters' => [
                'search' => $search,
                'category' => $category,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'session_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:5000'],
            'video_url' => ['nullable', 'string', 'max:2000'],
            'is_published' => ['sometimes', 'boolean'],
            'resource' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,txt'],
        ]);

        try {
            $videoUrl = YouTubeVideoReference::normalize($validated['video_url'] ?? null);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'video_url' => $exception->getMessage(),
            ]);
        }

        $session = LearningSession::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'session_date' => $validated['session_date'],
            'description' => $validated['description'],
            'video_url' => $videoUrl,
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

    /**
     * @return array<int, array{id: int, title: string, category: string, session_date: string, is_published: bool, resources_count: int}>
     */
    private function sessionSummaries(
        string $search = '',
        string $category = '',
        ?string $dateFrom = null,
        ?string $dateTo = null,
    ): array {
        return LearningSession::query()
            ->withCount('resources')
            ->filterForClassroom($search, $category, $dateFrom, $dateTo)
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
            ->values()
            ->all();
    }
}
