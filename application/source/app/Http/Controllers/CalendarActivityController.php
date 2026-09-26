<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CalendarEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CalendarActivityController
{
    public function show(Request $request, CalendarEvent $calendarEvent): Response
    {
        ActivityLog::record($request->user(), 'calendar_event_viewed', $calendarEvent);

        return response()->noContent();
    }

    public function broadcast(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        abort_unless($calendarEvent->live_broadcast_url !== null && $calendarEvent->live_broadcast_url !== '', 404);

        ActivityLog::record($request->user(), 'calendar_broadcast_clicked', $calendarEvent);

        return redirect()->away($calendarEvent->live_broadcast_url);
    }
}
