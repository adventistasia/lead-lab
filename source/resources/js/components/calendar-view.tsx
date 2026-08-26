import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { CalendarEventSummary } from '@/components/calendar-utils';
import {
    formatEventDate,
    formatEventTimeRange,
} from '@/components/calendar-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarCell = {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
};

type CalendarEventSegment = {
    event: CalendarEventSummary;
    startColumn: number;
    endColumn: number;
    lane: number;
    continuesBefore: boolean;
    continuesAfter: boolean;
};

const dateKey = (date: Date): string =>
    [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part, index) =>
            index === 0 ? String(part) : String(part).padStart(2, '0'),
        )
        .join('-');

const monthCells = (month: string): CalendarCell[] => {
    const [year, monthNumber] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNumber - 1, 1);
    const firstCell = new Date(year, monthNumber - 1, 1 - firstDay.getDay());
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const cellCount = Math.ceil((firstDay.getDay() + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
        const date = new Date(firstCell);
        date.setDate(firstCell.getDate() + index);

        return {
            date,
            dateKey: dateKey(date),
            isCurrentMonth: date.getMonth() === monthNumber - 1,
        };
    });
};

const eventSegmentsForWeek = (
    week: CalendarCell[],
    events: CalendarEventSummary[],
): CalendarEventSegment[] => {
    const weekStart = week[0].dateKey;
    const weekEnd = week[week.length - 1].dateKey;
    const segments: CalendarEventSegment[] = [];

    events
        .filter(
            (event) =>
                event.start_date <= weekEnd && event.end_date >= weekStart,
        )
        .forEach((event) => {
            const eventStartIndex = week.findIndex(
                (cell) => cell.dateKey === event.start_date,
            );
            const eventEndIndex = week.findIndex(
                (cell) => cell.dateKey === event.end_date,
            );
            const startColumn = eventStartIndex === -1 ? 0 : eventStartIndex;
            const endColumn = eventEndIndex === -1 ? 6 : eventEndIndex;
            let lane = 0;

            while (
                segments.some(
                    (segment) =>
                        segment.lane === lane &&
                        segment.startColumn <= endColumn &&
                        segment.endColumn >= startColumn,
                )
            ) {
                lane += 1;
            }

            segments.push({
                event,
                startColumn,
                endColumn,
                lane,
                continuesBefore: event.start_date < weekStart,
                continuesAfter: event.end_date > weekEnd,
            });
        });

    return segments;
};

export function CalendarView({
    events,
    month,
    monthLabel,
    previousMonth,
    nextMonth,
    timezone,
    isAdmin,
    onEditEvent,
    onDeleteEvent,
    deleteProcessing = false,
}: {
    events: CalendarEventSummary[];
    month: string;
    monthLabel: string;
    previousMonth: string;
    nextMonth: string;
    timezone: string;
    isAdmin: boolean;
    onEditEvent?: (event: CalendarEventSummary) => void;
    onDeleteEvent?: (event: CalendarEventSummary) => void;
    deleteProcessing?: boolean;
}) {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const cells = monthCells(month);
    const weeks = Array.from({ length: cells.length / 7 }, (_, index) =>
        cells.slice(index * 7, index * 7 + 7),
    );
    const selectedEvent =
        events.find((event) => event.id === selectedEventId) ?? events[0];
    const today = dateKey(new Date());

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <CalendarDays className="size-5 text-muted-foreground" />
                    <div>
                        <CardTitle>{monthLabel}</CardTitle>
                        <CardDescription>
                            Times shown in {timezone}.
                        </CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="icon">
                        <Link
                            href={`/calendar?month=${previousMonth}`}
                            preserveScroll
                            aria-label="Previous month"
                        >
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon">
                        <Link
                            href={`/calendar?month=${nextMonth}`}
                            preserveScroll
                            aria-label="Next month"
                        >
                            <ChevronRight />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="hidden overflow-x-auto rounded-xl border sm:block">
                <div className="min-w-[42rem]">
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                        {weekdays.map((weekday) => (
                            <div
                                key={weekday}
                                className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase"
                            >
                                {weekday}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {weeks.map((week) => {
                            const segments = eventSegmentsForWeek(week, events);
                            const laneCount = Math.max(
                                1,
                                ...segments.map((segment) => segment.lane + 1),
                            );
                            const markerHeight =
                                laneCount * 28 + (laneCount - 1) * 4 + 8;

                            return (
                                <div
                                    key={week[0].dateKey}
                                    className="relative col-span-7 grid grid-cols-7 border-b last:border-b-0"
                                    style={{
                                        paddingBottom: `${Math.max(0, markerHeight - 56)}px`,
                                    }}
                                >
                                    {week.map((cell) => (
                                        <div
                                            key={cell.dateKey}
                                            className={`relative min-h-24 border-r p-2 last:border-r-0 ${cell.isCurrentMonth ? 'bg-background' : 'bg-muted/20'}`}
                                        >
                                            <div
                                                className={`flex size-7 items-center justify-center rounded-full text-sm ${cell.dateKey === today ? 'bg-primary font-semibold text-primary-foreground' : cell.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}
                                            >
                                                {cell.date.getDate()}
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className="pointer-events-none absolute inset-x-0 top-10 z-10 grid grid-cols-7 gap-x-1 gap-y-1 px-1 py-1"
                                        style={{
                                            gridTemplateRows: `repeat(${laneCount}, minmax(1.5rem, auto))`,
                                        }}
                                    >
                                        {segments.map((segment) => (
                                            <button
                                                key={`${segment.event.id}-${segment.startColumn}`}
                                                type="button"
                                                className={`pointer-events-auto flex h-7 min-w-0 items-center overflow-hidden bg-primary/20 px-2 text-left text-xs text-foreground transition-colors hover:bg-primary/30 ${segment.continuesBefore ? 'rounded-l-none' : 'rounded-l-md'} ${segment.continuesAfter ? 'rounded-r-none' : 'rounded-r-md'}`}
                                                style={{
                                                    gridColumn: `${segment.startColumn + 1} / ${segment.endColumn + 2}`,
                                                    gridRow: segment.lane + 1,
                                                }}
                                                onClick={() =>
                                                    setSelectedEventId(
                                                        segment.event.id,
                                                    )
                                                }
                                                aria-label={`${segment.event.title}, ${formatEventTimeRange(segment.event, timezone)}`}
                                            >
                                                <span className="truncate font-medium">
                                                    {segment.event.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:hidden">
                {events.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No events are scheduled for this month.
                    </p>
                ) : (
                    events.map((event) => (
                        <button
                            key={event.id}
                            type="button"
                            className="flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
                            onClick={() => setSelectedEventId(event.id)}
                        >
                            <span className="font-medium">{event.title}</span>
                            <span className="text-sm text-muted-foreground">
                                {formatEventDate(event, timezone)} ·{' '}
                                {formatEventTimeRange(event, timezone)}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {events.length > 0 && selectedEvent && (
                <div className="rounded-xl border bg-muted/20 p-4 md:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                    Scheduled event
                                </Badge>
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock3 className="size-3.5" />
                                    {formatEventDate(
                                        selectedEvent,
                                        timezone,
                                    )} ·{' '}
                                    {formatEventTimeRange(
                                        selectedEvent,
                                        timezone,
                                    )}
                                </span>
                            </div>
                            <h2 className="text-lg font-semibold">
                                {selectedEvent.title}
                            </h2>
                            <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                                {selectedEvent.description}
                            </p>
                        </div>
                        {isAdmin && (
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEditEvent?.(selectedEvent)}
                                >
                                    <Pencil data-icon="inline-start" />
                                    Edit event
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    disabled={deleteProcessing}
                                    onClick={() =>
                                        onDeleteEvent?.(selectedEvent)
                                    }
                                >
                                    <Trash2 data-icon="inline-start" />
                                    {deleteProcessing
                                        ? 'Deleting...'
                                        : 'Delete event'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
