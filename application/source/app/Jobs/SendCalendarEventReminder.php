<?php

namespace App\Jobs;

use App\Models\CalendarEventReminderDelivery;
use App\Notifications\CalendarEventReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;
use Throwable;

class SendCalendarEventReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(public readonly int $deliveryId) {}

    public function handle(): void
    {
        $delivery = CalendarEventReminderDelivery::query()
            ->with(['calendarEvent', 'user'])
            ->find($this->deliveryId);

        if ($delivery === null || $delivery->status === CalendarEventReminderDelivery::STATUS_SENT) {
            return;
        }

        $event = $delivery->calendarEvent;
        $user = $delivery->user;
        $now = now('UTC');

        if (
            ! $event->isReminderEnabled($delivery->offset_minutes)
            || $event->starts_at->lte($now)
            || ! $event->reminderAt($delivery->offset_minutes)->equalTo($delivery->scheduled_for)
        ) {
            $delivery->update([
                'status' => CalendarEventReminderDelivery::STATUS_PENDING,
                'queued_at' => null,
            ]);

            return;
        }

        if (
            ! $user->canAccessLeadLab()
            || ! $user->hasVerifiedEmail()
            || ! in_array($user->role, ['participant', 'admin'], true)
        ) {
            $delivery->update([
                'status' => CalendarEventReminderDelivery::STATUS_CANCELLED,
                'queued_at' => null,
            ]);

            return;
        }

        $delivery->update([
            'attempts' => $delivery->attempts + 1,
            'last_error' => null,
        ]);

        Notification::sendNow(
            $user,
            new CalendarEventReminderNotification($event, $delivery->offset_minutes),
        );

        $delivery->update([
            'status' => CalendarEventReminderDelivery::STATUS_SENT,
            'sent_at' => $now,
            'queued_at' => null,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        CalendarEventReminderDelivery::query()
            ->whereKey($this->deliveryId)
            ->update([
                'status' => CalendarEventReminderDelivery::STATUS_FAILED,
                'last_error' => $exception->getMessage(),
                'queued_at' => null,
            ]);
    }
}
