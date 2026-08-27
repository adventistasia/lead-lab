import { useForm } from '@inertiajs/react';
import { CalendarPlus, Pencil } from 'lucide-react';
import type { FormEvent } from 'react';
import { CalendarEventFormFields } from '@/components/calendar-event-form-fields';
import type { CalendarEventFormData } from '@/components/calendar-event-form-fields';
import type { CalendarEventSummary } from '@/components/calendar-utils';
import { toDateTimeLocal } from '@/components/calendar-utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const emptyEvent: CalendarEventFormData = {
    title: '',
    location: '',
    live_broadcast_url: '',
    starts_at: '',
    ends_at: '',
    description: '',
    remind_three_days_before: true,
    remind_one_day_before: true,
    remind_fifteen_minutes_before: true,
};

const eventFormData = (
    event: CalendarEventSummary | null | undefined,
    timezone: string,
): CalendarEventFormData =>
    event === null || event === undefined
        ? emptyEvent
        : {
              title: event.title,
              location: event.location ?? '',
              live_broadcast_url: event.live_broadcast_url ?? '',
              starts_at: toDateTimeLocal(event.starts_at, timezone),
              ends_at: toDateTimeLocal(event.ends_at, timezone),
              description: event.description,
              remind_three_days_before: event.remind_three_days_before,
              remind_one_day_before: event.remind_one_day_before,
              remind_fifteen_minutes_before:
                  event.remind_fifteen_minutes_before,
          };

export function CalendarEventDialog({
    open,
    onOpenChange,
    returnTo,
    timezone,
    event,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    returnTo: 'dashboard' | 'calendar';
    timezone: string;
    event?: CalendarEventSummary | null;
}) {
    const form = useForm<CalendarEventFormData>(eventFormData(event, timezone));

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && form.processing) {
            return;
        }

        if (!nextOpen) {
            form.resetAndClearErrors();
        }

        onOpenChange(nextOpen);
    };

    const submit = (formEvent: FormEvent<HTMLFormElement>) => {
        formEvent.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        };

        if (event !== null && event !== undefined) {
            form.patch(
                `/admin/calendar-events/${event.id}?return_to=${returnTo}`,
                options,
            );

            return;
        }

        form.post(`/admin/calendar-events?return_to=${returnTo}`, options);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {event ? 'Edit calendar event' : 'Add a calendar event'}
                    </DialogTitle>
                    <DialogDescription>
                        {event
                            ? 'Update the published event details.'
                            : 'Save a published event that active participants and administrators can see immediately.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <CalendarEventFormFields form={form} timezone={timezone} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {event ? (
                                <Pencil data-icon="inline-start" />
                            ) : (
                                <CalendarPlus data-icon="inline-start" />
                            )}
                            {form.processing
                                ? 'Saving...'
                                : event
                                  ? 'Save changes'
                                  : 'Save event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
