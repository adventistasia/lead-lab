<?php

namespace App\Services;

use App\Jobs\SendCalendarEventReminder;
use App\Models\CalendarEvent;
use App\Models\CalendarEventReminderDelivery;
use App\Models\User;
use Carbon\CarbonImmutable;

class CalendarEventReminderService
{
    private const MAX_REMINDER_OFFSET = CalendarEvent::REMINDER_THREE_DAYS;

    public function dispatchDue(?CarbonImmutable $now = null): int
    {
        $now ??= CarbonImmutable::now('UTC');

        $events = CalendarEvent::query()
            ->where('starts_at', '>', $now)
            ->where('starts_at', '<=', $now->addMinutes(self::MAX_REMINDER_OFFSET))
            ->get();

        $queued = 0;

        foreach ($events as $event) {
            foreach ($event->enabledReminderOffsets() as $offset) {
                $scheduledFor = $event->reminderAt($offset)->utc();

                if (
                    $scheduledFor->isFuture()
                    || $scheduledFor->lt($event->created_at)
                    || $scheduledFor->lt($event->updated_at)
                ) {
                    continue;
                }

                foreach ($this->eligibleUsers() as $user) {
                    if ($this->queueDelivery($event, $user, $offset, $scheduledFor, $now)) {
                        $queued++;
                    }
                }
            }
        }

        return $queued;
    }

    /** @return iterable<int, User> */
    private function eligibleUsers(): iterable
    {
        return User::query()
            ->where('is_active', true)
            ->where('access_status', User::ACCESS_ACTIVE)
            ->whereNotNull('email_verified_at')
            ->whereIn('role', ['participant', 'admin'])
            ->cursor();
    }

    private function queueDelivery(
        CalendarEvent $event,
        User $user,
        int $offset,
        CarbonImmutable $scheduledFor,
        CarbonImmutable $now,
    ): bool {
        $delivery = CalendarEventReminderDelivery::query()->firstOrNew([
            'calendar_event_id' => $event->id,
            'user_id' => $user->id,
            'offset_minutes' => $offset,
        ]);

        if ($delivery->status === CalendarEventReminderDelivery::STATUS_SENT
            || $delivery->status === CalendarEventReminderDelivery::STATUS_CANCELLED) {
            return false;
        }

        if ($delivery->status === CalendarEventReminderDelivery::STATUS_FAILED
            && $delivery->attempts >= 3) {
            return false;
        }

        if (
            $delivery->status === CalendarEventReminderDelivery::STATUS_QUEUED
            && $delivery->queued_at?->gt($now->subMinutes(10))
        ) {
            return false;
        }

        $delivery->scheduled_for = $scheduledFor;
        $delivery->status = CalendarEventReminderDelivery::STATUS_QUEUED;
        $delivery->queued_at = $now;
        $delivery->last_error = null;
        $delivery->save();

        SendCalendarEventReminder::dispatch($delivery->id);

        return true;
    }
}
