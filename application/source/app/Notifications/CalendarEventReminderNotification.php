<?php

namespace App\Notifications;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CalendarEventReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly CalendarEvent $event,
        public readonly int $offsetMinutes,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $timezone = (string) config('app.timezone');
        $startsAt = $this->event->starts_at->setTimezone($timezone);
        $endsAt = $this->event->ends_at->setTimezone($timezone);

        $message = (new MailMessage)
            ->subject('Reminder: '.$this->event->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('This is a reminder for the upcoming Lead Lab event.')
            ->line('Event: '.$this->event->title)
            ->line('Starts: '.$startsAt->format('l, F j, Y \a\t g:i A T'))
            ->line('Ends: '.$endsAt->format('l, F j, Y \a\t g:i A T'));

        if ($this->event->location !== null && $this->event->location !== '') {
            $message->line('Location: '.$this->event->location);
        }

        if ($this->event->live_broadcast_url !== null && $this->event->live_broadcast_url !== '') {
            $message->line('Live broadcast: '.$this->event->live_broadcast_url);
        }

        return $message
            ->line($this->event->description)
            ->action(
                'Open calendar',
                route('calendar', ['month' => $startsAt->format('Y-m')]),
            )
            ->line('Times are shown in '.$timezone.'.');
    }
}
