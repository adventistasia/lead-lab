<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CalendarEvent;
use App\Models\LearningSession;
use App\Models\SessionAnswer;
use App\Models\SessionQuestion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminActivityLogController
{
    private const PAGE_SIZE = 25;

    /** @var array<string, string> */
    private const ACTION_LABELS = [
        'participant_registered' => 'Participant registered',
        'password_reset' => 'Password reset',
        'member_access_approved' => 'Member access approved',
        'member_access_restored' => 'Member access restored',
        'member_access_revoked' => 'Member access revoked',
        'member_role_changed' => 'Member role changed',
        'session_created' => 'Session created',
        'session_updated' => 'Session updated',
        'resource_deleted' => 'Supporting material deleted',
        'session_published' => 'Session published',
        'session_unpublished' => 'Session unpublished',
        'session_archived' => 'Session archived',
        'session_restored' => 'Session restored',
        'calendar_event_created' => 'Calendar event created',
        'calendar_event_updated' => 'Calendar event updated',
        'calendar_event_deleted' => 'Calendar event deleted',
        'qna_question_updated' => 'Q&A question updated',
        'qna_question_deleted' => 'Q&A question deleted',
        'qna_answer_updated' => 'Q&A answer updated',
        'qna_answer_deleted' => 'Q&A answer deleted',
    ];

    /** @var array<string, array<int, string>> */
    private const DISPLAYABLE_METADATA = [
        'password_reset' => ['source'],
        'member_access_approved' => ['access_status'],
        'member_access_restored' => ['access_status'],
        'member_access_revoked' => ['access_status'],
        'member_role_changed' => ['from_role', 'to_role'],
        'session_updated' => ['resources_added'],
        'resource_deleted' => ['resource_title'],
        'calendar_event_created' => ['reminders'],
        'calendar_event_updated' => ['reminders'],
    ];

    /** @var array<string, string> */
    private const METADATA_LABELS = [
        'source' => 'Source',
        'access_status' => 'Access status',
        'from_role' => 'Previous role',
        'to_role' => 'New role',
        'resources_added' => 'Materials added',
        'resource_title' => 'Material',
        'reminders' => 'Reminder settings',
    ];

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'action' => ['nullable', 'string', 'max:120'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $timezone = $request->user()->effectiveTimezone();
        $action = $validated['action'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $logs = ActivityLog::query()
            ->with(['actor:id,name,email', 'subject'])
            ->when($action !== null, fn (Builder $query) => $query->where('action', $action))
            ->when(
                $dateFrom !== null,
                fn (Builder $query) => $query->where(
                    'created_at',
                    '>=',
                    $this->localDateBoundary($dateFrom, $timezone, false),
                ),
            )
            ->when(
                $dateTo !== null,
                fn (Builder $query) => $query->where(
                    'created_at',
                    '<=',
                    $this->localDateBoundary($dateTo, $timezone, true),
                ),
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PAGE_SIZE)
            ->withQueryString()
            ->through(fn (ActivityLog $log): array => $this->logData($log, $timezone));

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'actions' => $this->actionOptions(),
            'filters' => [
                'action' => $action,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'timezone_label' => $request->user()->effectiveTimezoneLabel(),
        ]);
    }

    /** @return array<int, array{value: string, label: string}> */
    private function actionOptions(): array
    {
        return collect(self::ACTION_LABELS)
            ->map(fn (string $label, string $value): array => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function logData(ActivityLog $log, string $timezone): array
    {
        $occurredAt = $log->created_at?->copy()->setTimezone($timezone);

        return [
            'id' => $log->id,
            'action' => $log->action,
            'action_label' => self::ACTION_LABELS[$log->action] ?? Str::headline($log->action),
            'actor' => $log->actor === null
                ? null
                : [
                    'name' => $log->actor->name,
                    'email' => $log->actor->email,
                ],
            'subject' => $this->subjectData($log),
            'details' => $this->displayMetadata($log),
            'occurred_at' => $occurredAt?->toIso8601String(),
            'occurred_at_label' => $occurredAt?->format('M j, Y g:i A') ?? 'Time unavailable',
        ];
    }

    /** @return array{label: string, type: string|null, id: int|string|null, available: bool} */
    private function subjectData(ActivityLog $log): array
    {
        $subject = $log->subject;
        $type = $log->subject_type === null ? null : class_basename($log->subject_type);
        $unavailableSuffix = $subject === null ? ' (record unavailable)' : '';

        $label = match (true) {
            $subject instanceof User => $subject->name,
            $subject instanceof LearningSession => $subject->title,
            $subject instanceof CalendarEvent => $subject->title,
            $subject instanceof SessionQuestion => 'Question #'.$log->subject_id,
            $subject instanceof SessionAnswer => 'Answer #'.$log->subject_id,
            default => ($type ?? 'Record').' #'.$log->subject_id.$unavailableSuffix,
        };

        return [
            'label' => $label,
            'type' => $type,
            'id' => $log->subject_id,
            'available' => $subject !== null,
        ];
    }

    /** @return array<string, string> */
    private function displayMetadata(ActivityLog $log): array
    {
        $metadata = $log->getAttribute('metadata');

        if (! is_array($metadata)) {
            return [];
        }

        $details = [];

        foreach (self::DISPLAYABLE_METADATA[$log->action] ?? [] as $key) {
            if (! array_key_exists($key, $metadata)) {
                continue;
            }

            $value = $metadata[$key];
            $details[self::METADATA_LABELS[$key]] = match (true) {
                is_bool($value) => $value ? 'Yes' : 'No',
                is_scalar($value) || $value === null => (string) $value,
                default => json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
            };
        }

        return $details;
    }

    private function localDateBoundary(string $date, string $timezone, bool $endOfDay): CarbonImmutable
    {
        $boundary = CarbonImmutable::createFromFormat('!Y-m-d', $date, $timezone);

        return ($endOfDay ? $boundary->endOfDay() : $boundary->startOfDay())->utc();
    }
}
