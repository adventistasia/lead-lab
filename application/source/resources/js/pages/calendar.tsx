import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarPlus, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { CalendarEventDialog } from '@/components/calendar-event-dialog';
import type { CalendarEventSummary } from '@/components/calendar-utils';
import { CalendarView } from '@/components/calendar-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

export default function Calendar({
    events,
    month,
    month_label,
    previous_month,
    next_month,
    timezone,
    is_admin,
}: {
    events: CalendarEventSummary[];
    month: string;
    month_label: string;
    previous_month: string;
    next_month: string;
    timezone: string;
    is_admin: boolean;
}) {
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEventSummary | null>(
        null,
    );
    const deleteForm = useForm({});

    const openCreateDialog = () => {
        setEventToEdit(null);
        setIsEventDialogOpen(true);
    };

    const openEditDialog = (event: CalendarEventSummary) => {
        setEventToEdit(event);
        setIsEventDialogOpen(true);
    };

    const handleEventDialogChange = (open: boolean) => {
        setIsEventDialogOpen(open);

        if (!open) {
            setEventToEdit(null);
        }
    };

    const deleteEvent = (event: CalendarEventSummary) => {
        if (!window.confirm(`Delete "${event.title}"?`)) {
            return;
        }

        deleteForm.delete(
            `/admin/calendar-events/${event.id}?return_to=calendar`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Calendar" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit" variant="secondary">
                            Lead Lab calendar
                        </Badge>
                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            Event calendar
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                            See the schedule at a glance and keep the next live
                            moment easy to find.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {is_admin && (
                            <Button type="button" onClick={openCreateDialog}>
                                <CalendarPlus data-icon="inline-start" />
                                Add event
                            </Button>
                        )}
                        <Button asChild variant="outline">
                            <Link href={dashboard()}>
                                <CalendarDays data-icon="inline-start" />
                                Back to dashboard
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Schedule</CardTitle>
                        <CardDescription>
                            Published events are visible to active
                            administrators and participants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CalendarView
                            events={events}
                            month={month}
                            monthLabel={month_label}
                            previousMonth={previous_month}
                            nextMonth={next_month}
                            timezone={timezone}
                            isAdmin={is_admin}
                            onEditEvent={openEditDialog}
                            onDeleteEvent={deleteEvent}
                            deleteProcessing={deleteForm.processing}
                        />
                    </CardContent>
                </Card>
            </div>
            {is_admin && (
                <CalendarEventDialog
                    key={eventToEdit?.id ?? 'new-event'}
                    open={isEventDialogOpen}
                    onOpenChange={handleEventDialogChange}
                    returnTo="calendar"
                    timezone={timezone}
                    event={eventToEdit}
                />
            )}
        </>
    );
}

Calendar.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Calendar',
            href: '/calendar',
        },
    ],
};
