<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CalendarEventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $title
 * @property CarbonImmutable $starts_at
 * @property CarbonImmutable $ends_at
 * @property string $description
 * @property string|null $location
 * @property string|null $live_broadcast_url
 * @property bool $remind_three_days_before
 * @property bool $remind_one_day_before
 * @property bool $remind_fifteen_minutes_before
 */
#[Fillable([
    'title',
    'starts_at',
    'ends_at',
    'description',
    'location',
    'live_broadcast_url',
    'remind_three_days_before',
    'remind_one_day_before',
    'remind_fifteen_minutes_before',
])]
class CalendarEvent extends Model
{
    public const REMINDER_THREE_DAYS = 4320;

    public const REMINDER_ONE_DAY = 1440;

    public const REMINDER_FIFTEEN_MINUTES = 15;

    /** @use HasFactory<CalendarEventFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'remind_three_days_before' => 'boolean',
            'remind_one_day_before' => 'boolean',
            'remind_fifteen_minutes_before' => 'boolean',
        ];
    }

    /** @return HasMany<CalendarEventReminderDelivery, $this> */
    public function reminderDeliveries(): HasMany
    {
        return $this->hasMany(CalendarEventReminderDelivery::class);
    }

    /** @return list<int> */
    public function enabledReminderOffsets(): array
    {
        return array_values(array_filter([
            self::REMINDER_THREE_DAYS,
            self::REMINDER_ONE_DAY,
            self::REMINDER_FIFTEEN_MINUTES,
        ], fn (int $offset): bool => $this->isReminderEnabled($offset)));
    }

    public function isReminderEnabled(int $offset): bool
    {
        return match ($offset) {
            self::REMINDER_THREE_DAYS => $this->remind_three_days_before,
            self::REMINDER_ONE_DAY => $this->remind_one_day_before,
            self::REMINDER_FIFTEEN_MINUTES => $this->remind_fifteen_minutes_before,
            default => false,
        };
    }

    /** @return array<string, bool> */
    public function reminderSettings(): array
    {
        return [
            'three_days_before' => $this->remind_three_days_before,
            'one_day_before' => $this->remind_one_day_before,
            'fifteen_minutes_before' => $this->remind_fifteen_minutes_before,
        ];
    }

    public function reminderAt(int $offset): CarbonImmutable
    {
        return $this->starts_at->copy()->subMinutes($offset);
    }
}
