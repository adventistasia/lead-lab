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

    /** @return array{id: int, title: string, description: string, starts_at: string, ends_at: string, start_date: string, end_date: string} */
    private function eventData(CalendarEvent $event, string $timezone): array
    {
        $startsAt = $event->starts_at->setTimezone($timezone);
        $endsAt = $event->ends_at->setTimezone($timezone);

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'starts_at' => $startsAt->toIso8601String(),
            'ends_at' => $endsAt->toIso8601String(),
            'start_date' => $startsAt->toDateString(),
            'end_date' => $endsAt->toDateString(),
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
