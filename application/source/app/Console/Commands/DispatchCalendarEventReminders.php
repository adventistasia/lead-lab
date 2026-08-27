<?php

namespace App\Console\Commands;

use App\Services\CalendarEventReminderService;
use Illuminate\Console\Command;

class DispatchCalendarEventReminders extends Command
{
    protected $signature = 'calendar:send-reminders';

    protected $description = 'Queue due calendar event email reminders';

    public function handle(CalendarEventReminderService $reminders): int
    {
        $queued = $reminders->dispatchDue();

        $this->info("Queued {$queued} calendar reminder deliveries.");

        return self::SUCCESS;
    }
}
