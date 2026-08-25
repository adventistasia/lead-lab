<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CalendarEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use InvalidArgumentException;

class AdminCalendarEventController
{
    public function store(Request $request): RedirectResponse
    {
        $event = CalendarEvent::create($this->eventAttributes($request));

        ActivityLog::record($request->user(), 'calendar_event_created', $event);
        $this->flashSuccess('Calendar event added.');

        return $this->redirectTo($request);
    }

    public function update(
        Request $request,
        CalendarEvent $calendarEvent,
    ): RedirectResponse {
        $calendarEvent->update($this->eventAttributes($request));

        ActivityLog::record($request->user(), 'calendar_event_updated', $calendarEvent);
        $this->flashSuccess('Calendar event updated.');

        return $this->redirectTo($request);
    }

    public function destroy(
        Request $request,
        CalendarEvent $calendarEvent,
    ): RedirectResponse {
        ActivityLog::record($request->user(), 'calendar_event_deleted', $calendarEvent);
        $calendarEvent->delete();
        $this->flashSuccess('Calendar event deleted.');

        return $this->redirectTo($request);
    }

    /** @return array{title: string, starts_at: Carbon, ends_at: Carbon, description: string} */
    private function eventAttributes(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'starts_at' => ['required', 'date_format:Y-m-d\\TH:i'],
            'ends_at' => ['required', 'date_format:Y-m-d\\TH:i', 'after:starts_at'],
            'description' => ['required', 'string', 'max:5000'],
        ]);

        return [
            'title' => $validated['title'],
            'starts_at' => $this->parseDateTime($validated['starts_at']),
            'ends_at' => $this->parseDateTime($validated['ends_at']),
            'description' => $validated['description'],
        ];
    }

    private function redirectTo(Request $request): RedirectResponse
    {
        return to_route(
            $request->input('return_to') === 'calendar'
                ? 'calendar'
                : 'dashboard',
        );
    }

    private function flashSuccess(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }

    private function parseDateTime(string $value): Carbon
    {
        $dateTime = Carbon::createFromFormat(
            'Y-m-d\\TH:i',
            $value,
            config('app.timezone'),
        );

        if ($dateTime === null) {
            throw new InvalidArgumentException('The event date and time is invalid.');
        }

        return $dateTime->utc();
    }
}
