<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LearningResource;
use App\Models\LearningSession;
use App\Support\YouTubeVideoReference;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class AdminLearningSessionController
{
    private const MAX_RESOURCES_PER_SESSION = 10;

    private const MAX_RESOURCE_SIZE_KB = 10240;

    private const MAX_RESOURCE_SIZE_BYTES = 10 * 1024 * 1024;

    public function index(): Response
    {
        return Inertia::render('admin/sessions/index', [
            'sessions' => $this->sessionSummaries(),
        ]);
    }

    public function edit(LearningSession $learningSession): Response
    {
        $learningSession->load('resources');

        return Inertia::render('admin/sessions/index', [
            'sessions' => $this->sessionSummaries(),
            'session' => [
                'id' => $learningSession->id,
                'title' => $learningSession->title,
                'season' => $learningSession->season,
                'session_date' => $learningSession->session_date?->toDateString(),
                'description' => $learningSession->description,
                'video_url' => $learningSession->video_url ?? '',
                'resources' => $learningSession->resources->map(
                    fn (LearningResource $resource): array => [
                        'id' => $resource->id,
                        'title' => $resource->title,
                        'size' => $resource->size,
                    ],
                )->values(),
            ],
        ]);
    }

    public function recordings(Request $request): Response
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

        return Inertia::render('admin/classroom/index', [
            'sessions' => $this->sessionSummaries(
                $search,
                $season,
                $dateFrom,
                $dateTo,
            ),
            'seasons' => LearningSession::query()
                ->distinct()
                ->orderBy('season')
                ->pluck('season')
                ->values(),
            'filters' => [
                'search' => $search,
                'season' => $season,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateSessionRequest($request);

        try {
            $videoUrl = YouTubeVideoReference::normalize($validated['video_url'] ?? null);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'video_url' => $exception->getMessage(),
            ]);
        }

        $session = LearningSession::create([
            'title' => $validated['title'],
            'season' => $validated['season'] ?? null,
            'session_date' => $validated['session_date'] ?? null,
            'description' => $validated['description'] ?? null,
            'video_url' => $videoUrl,
            'is_published' => false,
        ]);

        $this->storeResources($session, $request);
        ActivityLog::record($request->user(), 'session_created', $session);
        $this->flashSuccess('Session saved as a draft.');

        return to_route(
            $request->input('return_to') === 'classroom'
                ? 'admin.classroom.index'
                : 'admin.sessions.index',
        );
    }

    public function update(Request $request, LearningSession $learningSession): RedirectResponse
    {
        $validated = $this->validateSessionRequest(
            $request,
            $learningSession->resources()->count(),
        );

        try {
            $videoUrl = YouTubeVideoReference::normalize($validated['video_url'] ?? null);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'video_url' => $exception->getMessage(),
            ]);
        }

        if ($learningSession->is_published) {
            $errors = $this->publicationValidationErrors([
                'title' => $validated['title'] ?? null,
                'season' => $validated['season'] ?? null,
                'session_date' => $validated['session_date'] ?? null,
                'description' => $validated['description'] ?? null,
            ]);

            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }
        }

        $learningSession->update([
            'title' => $validated['title'],
            'season' => $validated['season'] ?? null,
            'session_date' => $validated['session_date'] ?? null,
            'description' => $validated['description'] ?? null,
            'video_url' => $videoUrl,
        ]);

        $this->storeResources($learningSession, $request);
        ActivityLog::record($request->user(), 'session_updated', $learningSession, [
            'resources_added' => count($this->resourceFiles($request)),
        ]);
        $this->flashSuccess('Session changes saved.');

        return to_route('admin.sessions.index');
    }

    public function destroy(
        Request $request,
        LearningResource $learningResource,
    ): RedirectResponse {
        $session = $learningResource->learningSession;

        ActivityLog::record($request->user(), 'resource_deleted', $session, [
            'resource_id' => $learningResource->id,
            'resource_title' => $learningResource->title,
        ]);
        Storage::disk('local')->delete($learningResource->stored_path);
        $learningResource->delete();
        $this->flashSuccess('Supporting material removed.');

        return to_route('admin.sessions.edit', $session);
    }

    public function publish(
        Request $request,
        LearningSession $learningSession,
    ): RedirectResponse {
        $errors = $this->publicationValidationErrors([
            'title' => $learningSession->title,
            'season' => $learningSession->season,
            'session_date' => $learningSession->session_date,
            'description' => $learningSession->description,
        ]);

        if ($errors !== []) {
            $this->flashError('Complete the required session details before publishing.');
            throw ValidationException::withMessages($errors);
        }

        $learningSession->update(['is_published' => true]);
        ActivityLog::record($request->user(), 'session_published', $learningSession);
        $this->flashSuccess('Session published to the Lead Lab classroom.');

        return $this->lifecycleRedirect($request);
    }

    public function unpublish(
        Request $request,
        LearningSession $learningSession,
    ): RedirectResponse {
        $learningSession->update(['is_published' => false]);
        ActivityLog::record($request->user(), 'session_unpublished', $learningSession);
        $this->flashSuccess('Session unpublished from the Lead Lab classroom.');

        return $this->lifecycleRedirect($request);
    }

    public function archive(
        Request $request,
        LearningSession $learningSession,
    ): RedirectResponse {
        $learningSession->update(['archived_at' => now()]);
        ActivityLog::record($request->user(), 'session_archived', $learningSession);
        $this->flashSuccess('Session archived.');

        return $this->lifecycleRedirect($request);
    }

    public function restore(
        Request $request,
        LearningSession $learningSession,
    ): RedirectResponse {
        $learningSession->update(['archived_at' => null]);
        ActivityLog::record($request->user(), 'session_restored', $learningSession);
        $this->flashSuccess('Session restored.');

        return $this->lifecycleRedirect($request);
    }

    private function lifecycleRedirect(Request $request): RedirectResponse
    {
        return to_route(
            $request->input('return_to') === 'classroom'
                ? 'admin.classroom.index'
                : 'admin.sessions.index',
        );
    }

    /**
     * @return array<int, array{id: int, title: string, season: string|null, session_date: string|null, is_published: bool, is_archived: bool, resources_count: int, video_thumbnail_url: string|null}>
     */
    private function sessionSummaries(
        string $search = '',
        string $season = '',
        ?string $dateFrom = null,
        ?string $dateTo = null,
    ): array {
        return LearningSession::query()
            ->withCount('resources')
            ->filterForClassroom($search, $season, $dateFrom, $dateTo)
            ->orderByDesc('session_date')
            ->get()
            ->map(fn (LearningSession $session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'season' => $session->season,
                'session_date' => $session->session_date?->toDateString(),
                'is_published' => $session->is_published,
                'is_archived' => $session->archived_at !== null,
                'resources_count' => $session->resources_count,
                'video_thumbnail_url' => YouTubeVideoReference::thumbnailUrl(
                    $session->video_url,
                ),
            ])
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function validateSessionRequest(
        Request $request,
        int $existingResourceCount = 0,
    ): array {
        $remainingResourceSlots = max(
            0,
            self::MAX_RESOURCES_PER_SESSION - $existingResourceCount,
        );
        $validator = Validator::make(
            $request->all(),
            [
                'title' => ['required', 'string', 'max:160'],
                'season' => ['nullable', 'string', 'max:80'],
                'session_date' => ['nullable', 'date'],
                'description' => ['nullable', 'string', 'max:5000'],
                'video_url' => ['nullable', 'string', 'max:2000'],
                'resources' => ['nullable', 'array', "max:{$remainingResourceSlots}"],
                'resources.*' => [
                    'file',
                    'max:'.self::MAX_RESOURCE_SIZE_KB,
                    'mimes:pdf,doc,docx,txt,ppt,pptx,jpg,jpeg,png,webp',
                    'extensions:pdf,doc,docx,txt,ppt,pptx,jpg,jpeg,png,webp',
                ],
            ],
            [
                'resources.max' => 'A session can have no more than 10 supporting materials. Remove an existing material before adding more files.',
                'resources.*.max' => 'Each file must be 10 MB or less.',
                'resources.*.mimes' => 'Each file must be PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, JPEG, PNG, or WEBP.',
            ],
        );
        $files = $this->resourceFiles($request);

        $validator->after(function (ValidatorContract $validator) use ($files): void {
            foreach ($files as $index => $file) {
                if (! $this->resourceIsTooLarge($file)) {
                    continue;
                }

                $attribute = "resources.{$index}";
                $validator->errors()->forget($attribute);
                $validator->errors()->add(
                    $attribute,
                    $this->resourceTooLargeMessage($file),
                );
            }
        });

        return $validator->validate();
    }

    private function storeResources(LearningSession $session, Request $request): void
    {
        foreach ($this->resourceFiles($request) as $file) {
            $session->resources()->create([
                'title' => $file->getClientOriginalName(),
                'stored_path' => $file->store('lead-lab/resources'),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }
    }

    /** @return array<int, UploadedFile> */
    private function resourceFiles(Request $request): array
    {
        $files = $request->file('resources');

        if ($files === null) {
            return [];
        }

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        return array_values($files);
    }

    private function resourceIsTooLarge(UploadedFile $file): bool
    {
        return in_array($file->getError(), [
            UPLOAD_ERR_INI_SIZE,
            UPLOAD_ERR_FORM_SIZE,
        ], true) || (int) $file->getSize() > self::MAX_RESOURCE_SIZE_BYTES;
    }

    private function resourceTooLargeMessage(UploadedFile $file): string
    {
        return sprintf(
            '%s is too big. Each file must be 10 MB or less.',
            $file->getClientOriginalName(),
        );
    }

    private function flashSuccess(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, string>
     */
    private function publicationValidationErrors(array $values): array
    {
        $errors = [];

        foreach ([
            'title' => 'Title',
            'season' => 'Season',
            'session_date' => 'Session date',
            'description' => 'Description',
        ] as $field => $label) {
            if (blank($values[$field] ?? null)) {
                $errors[$field] = "{$label} is required before publishing.";
            }
        }

        return $errors;
    }

    private function flashError(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'error',
            'message' => $message,
        ]);
    }
}
