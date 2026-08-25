export type CalendarEventSummary = {
    id: number;
    title: string;
    description: string;
    starts_at: string;
    ends_at: string;
    start_date: string;
    end_date: string;
};

export function formatEventDate(
    event: CalendarEventSummary,
    timezone: string,
): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timezone,
    }).format(new Date(event.starts_at));
}

export function formatEventTimeRange(
    event: CalendarEventSummary,
    timezone: string,
): string {
    const formatTime = (value: string): string =>
        new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone,
        }).format(new Date(value));

    if (event.start_date === event.end_date) {
        return `${formatTime(event.starts_at)} - ${formatTime(event.ends_at)}`;
    }

    const formatDateTime = (value: string): string =>
        new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone,
        }).format(new Date(value));

    return `${formatDateTime(event.starts_at)} - ${formatDateTime(event.ends_at)}`;
}

export function toDateTimeLocal(value: string, timezone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: timezone,
    })
        .formatToParts(new Date(value))
        .reduce<Record<string, string>>((values, part) => {
            values[part.type] = part.value;

            return values;
        }, {});

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
