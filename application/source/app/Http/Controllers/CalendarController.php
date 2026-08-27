<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController
{
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $month = $this->parseMonth($validated['month'] ?? null);
        $timezone = (string) config('app.timezone');
        $monthStart = $month->startOfMonth()->startOfDay()->utc();
        $monthEnd = $month->endOfMonth()->endOfDay()->utc();

        $events = CalendarEvent::query()
            ->where('starts_at', '<=', $monthEnd)
            ->where('ends_at', '>=', $monthStart)
            ->orderBy('starts_at')
            ->orderBy('id')
            ->get()
            ->map(fn (CalendarEvent $event): array => $this->eventData($event, $timezone))
            ->values();

        return Inertia::render('calendar', [
            'events' => $events,
            'month' => $month->format('Y-m'),
            'month_label' => $month->format('F Y'),
            'previous_month' => $month->subMonth()->format('Y-m'),
            'next_month' => $month->addMonth()->format('Y-m'),
            'timezone' => $timezone,
            'is_admin' => $request->user()->isAdmin(),
        ]);
    }

    /** @return array{id: int, title: string, description: string, location: string|null, live_broadcast_url: string|null, starts_at: string, ends_at: string, start_date: string, end_date: string, remind_three_days_before: bool, remind_one_day_before: bool, remind_fifteen_minutes_before: bool} */
    private function eventData(CalendarEvent $event, string $timezone): array
    {
        $startsAt = $event->starts_at->setTimezone($timezone);
        $endsAt = $event->ends_at->setTimezone($timezone);

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'location' => $event->location,
            'live_broadcast_url' => $event->live_broadcast_url,
            'starts_at' => $startsAt->toIso8601String(),
            'ends_at' => $endsAt->toIso8601String(),
            'start_date' => $startsAt->toDateString(),
            'end_date' => $endsAt->toDateString(),
            'remind_three_days_before' => $event->remind_three_days_before,
            'remind_one_day_before' => $event->remind_one_day_before,
            'remind_fifteen_minutes_before' => $event->remind_fifteen_minutes_before,
        ];
    }

    private function parseMonth(?string $value): CarbonImmutable
    {
        if ($value === null) {
            return CarbonImmutable::now()->startOfMonth();
        }

        $month = CarbonImmutable::createFromFormat(
            '!Y-m',
            $value,
            config('app.timezone'),
        );

        return $month === null
            ? CarbonImmutable::now()->startOfMonth()
            : $month;
    }
}
