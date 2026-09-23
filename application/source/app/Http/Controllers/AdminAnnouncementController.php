<?php

namespace App\Http\Controllers;

use App\Jobs\SendAnnouncementEmail;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\AnnouncementEmailDelivery;
use App\Models\User;
use App\Support\AnnouncementContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAnnouncementController
{
    private const STATUS_ALL = 'all';

    public function index(Request $request): Response
    {
        return $this->renderPage($request);
    }

    public function edit(Request $request, Announcement $announcement): Response
    {
        return $this->renderPage($request, $announcement);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAnnouncementRequest($request);
        $announcement = Announcement::query()->create([
            ...$validated,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
            'status' => Announcement::STATUS_DRAFT,
            'is_pinned' => false,
        ]);

        ActivityLog::record($request->user(), 'announcement_created', $announcement);
        $this->flashSuccess('Announcement saved as a draft.');

        return to_route('admin.announcements.edit', $announcement);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $this->validateAnnouncementRequest($request);
        $announcement->update([
            ...$validated,
            'updated_by' => $request->user()->id,
        ]);

        ActivityLog::record($request->user(), 'announcement_updated', $announcement);
        $this->flashSuccess('Announcement changes saved.');

        return to_route('admin.announcements.edit', $announcement);
    }

    public function publish(Request $request, Announcement $announcement): RedirectResponse
    {
        $result = DB::transaction(function () use ($request, $announcement): array {
            $announcement = Announcement::query()
                ->lockForUpdate()
                ->findOrFail($announcement->id);

            if ($announcement->status === Announcement::STATUS_PUBLISHED) {
                return [
                    'delivery_ids' => [],
                    'republished' => false,
                ];
            }

            $now = now('UTC');
            $isRepublish = $announcement->status === Announcement::STATUS_ARCHIVED;
            $announcement->update([
                'status' => Announcement::STATUS_PUBLISHED,
                'published_at' => $isRepublish
                    ? $now
                    : ($announcement->published_at ?? $now),
                'archived_at' => null,
                'is_pinned' => false,
                'updated_by' => $request->user()->id,
            ]);

            if ($isRepublish) {
                ActivityLog::record($request->user(), 'announcement_republished', $announcement);

                return [
                    'delivery_ids' => [],
                    'republished' => true,
                ];
            }

            $recipientIds = User::query()
                ->eligibleForAnnouncements()
                ->pluck('id');
            $deliveryRows = $recipientIds->map(fn (int $userId): array => [
                'announcement_id' => $announcement->id,
                'user_id' => $userId,
                'status' => AnnouncementEmailDelivery::STATUS_PENDING,
                'attempts' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if ($deliveryRows !== []) {
                AnnouncementEmailDelivery::query()->insertOrIgnore($deliveryRows);
            }

            $deliveries = AnnouncementEmailDelivery::query()
                ->where('announcement_id', $announcement->id)
                ->where('status', AnnouncementEmailDelivery::STATUS_PENDING)
                ->get();
            $deliveryIds = [];

            foreach ($deliveries as $delivery) {
                $delivery->update([
                    'status' => AnnouncementEmailDelivery::STATUS_QUEUED,
                    'queued_at' => $now,
                ]);
                $deliveryIds[] = $delivery->id;
            }

            ActivityLog::record($request->user(), 'announcement_published', $announcement, [
                'recipient_count' => count($deliveryIds),
            ]);

            return [
                'delivery_ids' => $deliveryIds,
                'republished' => false,
            ];
        });

        foreach ($result['delivery_ids'] as $deliveryId) {
            SendAnnouncementEmail::dispatch($deliveryId);
        }

        $this->flashSuccess(
            $result['republished']
                ? 'Announcement republished. No email was sent.'
                : 'Announcement published and email delivery queued.',
        );

        return to_route('admin.announcements.index');
    }

    public function pin(Request $request, Announcement $announcement): RedirectResponse
    {
        abort_unless($announcement->isPublished(), 422, 'Only published announcements can be pinned.');

        $announcement->update([
            'is_pinned' => true,
            'updated_by' => $request->user()->id,
        ]);
        ActivityLog::record($request->user(), 'announcement_pinned', $announcement);
        $this->flashSuccess('Announcement pinned to the dashboard.');

        return to_route('admin.announcements.index');
    }

    public function unpin(Request $request, Announcement $announcement): RedirectResponse
    {
        $announcement->update([
            'is_pinned' => false,
            'updated_by' => $request->user()->id,
        ]);
        ActivityLog::record($request->user(), 'announcement_unpinned', $announcement);
        $this->flashSuccess('Announcement removed from the dashboard.');

        return to_route('admin.announcements.index');
    }

    public function archive(Request $request, Announcement $announcement): RedirectResponse
    {
        $now = now('UTC');
        $announcement->update([
            'status' => Announcement::STATUS_ARCHIVED,
            'is_pinned' => false,
            'archived_at' => $now,
            'updated_by' => $request->user()->id,
        ]);

        AnnouncementEmailDelivery::query()
            ->where('announcement_id', $announcement->id)
            ->whereIn('status', [
                AnnouncementEmailDelivery::STATUS_PENDING,
                AnnouncementEmailDelivery::STATUS_QUEUED,
            ])
            ->update([
                'status' => AnnouncementEmailDelivery::STATUS_CANCELLED,
                'queued_at' => null,
                'updated_at' => $now,
            ]);

        ActivityLog::record($request->user(), 'announcement_archived', $announcement);
        $this->flashSuccess('Announcement archived. Pending email delivery was cancelled.');

        return to_route('admin.announcements.index');
    }

    private function renderPage(Request $request, ?Announcement $editing = null): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in([
                self::STATUS_ALL,
                Announcement::STATUS_DRAFT,
                Announcement::STATUS_PUBLISHED,
                Announcement::STATUS_ARCHIVED,
            ])],
        ]);
        $status = $filters['status'] ?? self::STATUS_ALL;
        $timezone = $request->user()->effectiveTimezone();

        $announcements = Announcement::query()
            ->when(
                $status !== self::STATUS_ALL,
                fn (Builder $query) => $query->where('status', $status),
            )
            ->orderByRaw("case status when 'published' then 1 when 'draft' then 2 else 3 end")
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('updated_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Announcement $announcement): array => $this->adminSummary(
                $announcement,
                $timezone,
            ));

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
            'counts' => [
                Announcement::STATUS_DRAFT => Announcement::query()
                    ->where('status', Announcement::STATUS_DRAFT)
                    ->count(),
                Announcement::STATUS_PUBLISHED => Announcement::query()
                    ->where('status', Announcement::STATUS_PUBLISHED)
                    ->count(),
                Announcement::STATUS_ARCHIVED => Announcement::query()
                    ->where('status', Announcement::STATUS_ARCHIVED)
                    ->count(),
            ],
            'filters' => ['status' => $status],
            'announcement' => $editing === null ? null : [
                'id' => $editing->id,
                'title' => $editing->title,
                'body' => $editing->body,
                'status' => $editing->status,
                'is_pinned' => $editing->is_pinned,
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private function adminSummary(Announcement $announcement, string $timezone): array
    {
        $publishedAt = $announcement->published_at?->copy()->setTimezone($timezone);

        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'summary' => $announcement->summaryPreview(),
            'status' => $announcement->status,
            'is_pinned' => $announcement->is_pinned,
            'published_at' => $publishedAt?->toIso8601String(),
            'published_at_label' => $publishedAt?->format('M j, Y g:i A'),
            'deliveries_count' => $announcement->emailDeliveries()->count(),
        ];
    }

    /** @return array{title: string, summary: string, body: string} */
    private function validateAnnouncementRequest(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:'.AnnouncementContent::MAX_BODY_LENGTH],
        ]);
        $body = trim($validated['body']);
        $contentError = AnnouncementContent::validationError($body);

        if ($contentError !== null) {
            throw ValidationException::withMessages(['body' => $contentError]);
        }

        return [
            'title' => trim($validated['title']),
            'summary' => AnnouncementContent::preview($body),
            'body' => $body,
        ];
    }

    private function flashSuccess(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }
}
