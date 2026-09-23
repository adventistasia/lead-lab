<?php

namespace App\Notifications;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementPublishedNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Announcement $announcement) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $publishedAt = $this->announcement->published_at?->copy()->setTimezone(
            $notifiable->effectiveTimezone(),
        );
        $brandName = (string) config('mail.brand_name', 'LEADHub');

        return (new MailMessage)
            ->subject('New '.$brandName.' announcement: '.$this->announcement->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new announcement is available in '.$brandName.'.')
            ->line($this->announcement->summaryPreview())
            ->line('Published: '.($publishedAt?->format('l, F j, Y \a\t g:i A') ?? 'Unknown'))
            ->action('Read announcement', route('announcements.show', $this->announcement))
            ->line('Times are shown in '.$notifiable->effectiveTimezoneLabel($publishedAt).'.');
    }
}
