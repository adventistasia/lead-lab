<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewParticipantRegistrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly User $participant) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $registeredAt = $this->participant->created_at?->setTimezone(
            (string) config('app.timezone'),
        )->format('l, F j, Y \\a\\t g:i A T') ?? 'Unknown';

        return (new MailMessage)
            ->subject('New Lead Lab participant registration')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new participant has registered for Lead Lab and needs access review.')
            ->line('Name: '.$this->participant->name)
            ->line('Email: '.$this->participant->email)
            ->line('Registered: '.$registeredAt)
            ->action('Review registration', route('admin.members.index'))
            ->line('Review the participant against the approved participant list before granting access.');
    }
}
