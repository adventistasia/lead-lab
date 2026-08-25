import type { InertiaForm } from '@inertiajs/react';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type CalendarEventFormData = {
    title: string;
    starts_at: string;
    ends_at: string;
    description: string;
};

export function CalendarEventFormFields({
    form,
    timezone,
}: {
    form: InertiaForm<CalendarEventFormData>;
    timezone: string;
}) {
    return (
        <FieldGroup>
            <Field data-invalid={Boolean(form.errors.title)}>
                <FieldLabel htmlFor="event_title">Event title</FieldLabel>
                <Input
                    id="event_title"
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.title)}
                    placeholder="Lead Lab planning session"
                />
                <FieldError>{form.errors.title}</FieldError>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
                <Field data-invalid={Boolean(form.errors.starts_at)}>
                    <FieldLabel htmlFor="event_starts_at">Starts</FieldLabel>
                    <Input
                        id="event_starts_at"
                        type="datetime-local"
                        value={form.data.starts_at}
                        onChange={(event) =>
                            form.setData('starts_at', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.starts_at)}
                    />
                    <FieldError>{form.errors.starts_at}</FieldError>
                </Field>

                <Field data-invalid={Boolean(form.errors.ends_at)}>
                    <FieldLabel htmlFor="event_ends_at">Ends</FieldLabel>
                    <Input
                        id="event_ends_at"
                        type="datetime-local"
                        value={form.data.ends_at}
                        onChange={(event) =>
                            form.setData('ends_at', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.ends_at)}
                    />
                    <FieldError>{form.errors.ends_at}</FieldError>
                </Field>
            </div>

            <FieldDescription>
                Event times are saved and displayed in {timezone}.
            </FieldDescription>

            <Field data-invalid={Boolean(form.errors.description)}>
                <FieldLabel htmlFor="event_description">Description</FieldLabel>
                <Textarea
                    id="event_description"
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.description)}
                    placeholder="What should participants know before joining?"
                    rows={4}
                />
                <FieldError>{form.errors.description}</FieldError>
            </Field>
        </FieldGroup>
    );
}
