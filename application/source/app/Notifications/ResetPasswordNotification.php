<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPasswordNotification
{
    public function toMail($notifiable): MailMessage
    {
        $expiryMinutes = (int) config(
            'auth.passwords.'.config('fortify.passwords').'.expire',
            60,
        );
        $brandName = (string) config('mail.brand_name', 'LEADHub');

        return (new MailMessage)
            ->subject('Reset your '.$brandName.' password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We received a request to reset the password for your '.$brandName.' account.')
            ->action('Reset password', $this->resetUrl($notifiable))
            ->line("This secure link expires in {$expiryMinutes} minutes and can be used only once.")
            ->line('If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.')
            ->line('For your security, do not forward this email or share the reset link.')
            ->salutation($brandName.' Support');
    }
}
