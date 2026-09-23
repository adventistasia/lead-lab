<?php

namespace App\Jobs;

use App\Models\AnnouncementEmailDelivery;
use App\Notifications\AnnouncementPublishedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;
use Throwable;

class SendAnnouncementEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(public readonly int $deliveryId) {}

    public function handle(): void
    {
        $delivery = AnnouncementEmailDelivery::query()
            ->with(['announcement', 'user'])
            ->find($this->deliveryId);

        if (
            $delivery === null
            || in_array($delivery->status, [
                AnnouncementEmailDelivery::STATUS_SENT,
                AnnouncementEmailDelivery::STATUS_CANCELLED,
            ], true)
        ) {
            return;
        }

        if (! $delivery->announcement->isPublished()) {
            $delivery->update([
                'status' => AnnouncementEmailDelivery::STATUS_CANCELLED,
                'queued_at' => null,
            ]);

            return;
        }

        $user = $delivery->user;

        if (! $user->canReceiveAnnouncements()) {
            $delivery->update([
                'status' => AnnouncementEmailDelivery::STATUS_CANCELLED,
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
            new AnnouncementPublishedNotification($delivery->announcement),
        );

        $delivery->update([
            'status' => AnnouncementEmailDelivery::STATUS_SENT,
            'sent_at' => now('UTC'),
            'queued_at' => null,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        AnnouncementEmailDelivery::query()
            ->whereKey($this->deliveryId)
            ->update([
                'status' => AnnouncementEmailDelivery::STATUS_FAILED,
                'last_error' => $exception->getMessage(),
                'queued_at' => null,
            ]);
    }
}
