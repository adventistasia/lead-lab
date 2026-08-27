<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $calendar_event_id
 * @property int $user_id
 * @property int $offset_minutes
 * @property CarbonImmutable $scheduled_for
 * @property string $status
 * @property int $attempts
 * @property CarbonImmutable|null $queued_at
 * @property CarbonImmutable|null $sent_at
 * @property string|null $last_error
 * @property CalendarEvent $calendarEvent
 * @property User $user
 */
#[Fillable([
    'calendar_event_id',
    'user_id',
    'offset_minutes',
    'scheduled_for',
    'status',
    'attempts',
    'queued_at',
    'sent_at',
    'last_error',
])]
#[Hidden(['last_error'])]
class CalendarEventReminderDelivery extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'scheduled_for' => 'datetime',
            'queued_at' => 'datetime',
            'sent_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /** @return BelongsTo<CalendarEvent, $this> */
    public function calendarEvent(): BelongsTo
    {
        return $this->belongsTo(CalendarEvent::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
