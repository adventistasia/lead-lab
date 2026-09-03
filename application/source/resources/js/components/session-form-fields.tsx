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

export type SessionFormData = {
    title: string;
    season: string;
    session_date: string;
    description: string;
    video_url: string;
    resource: File | null;
};

type SessionFormFieldsProps = {
    form: InertiaForm<SessionFormData>;
    resourceTitle?: string | null;
};

export function SessionFormFields({
    form,
    resourceTitle,
}: SessionFormFieldsProps) {
    return (
        <FieldGroup>
            <Field data-invalid={Boolean(form.errors.title)}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                    id="title"
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.title)}
                    placeholder="Build your weekly lead engine"
                />
                <FieldError>{form.errors.title}</FieldError>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
                <Field data-invalid={Boolean(form.errors.season)}>
                    <FieldLabel htmlFor="season">Season</FieldLabel>
                    <Input
                        id="season"
                        value={form.data.season}
                        onChange={(event) =>
                            form.setData('season', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.season)}
                        placeholder="2026 Growth Series"
                    />
                    <FieldDescription>
                        Optional while drafting. Required before publication.
                    </FieldDescription>
                    <FieldError>{form.errors.season}</FieldError>
                </Field>

                <Field data-invalid={Boolean(form.errors.session_date)}>
                    <FieldLabel htmlFor="session_date">Session date</FieldLabel>
                    <Input
                        id="session_date"
                        type="date"
                        value={form.data.session_date}
                        onChange={(event) =>
                            form.setData('session_date', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.session_date)}
                    />
                    <FieldDescription>
                        Optional while drafting. Required before publication.
                    </FieldDescription>
                    <FieldError>{form.errors.session_date}</FieldError>
                </Field>
            </div>

            <Field data-invalid={Boolean(form.errors.description)}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                    id="description"
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.description)}
                    placeholder="What should participants take away from this session?"
                    rows={5}
                />
                <FieldDescription>
                    Keep the description practical and easy to scan. It is
                    optional while drafting and required before publication.
                </FieldDescription>
                <FieldError>{form.errors.description}</FieldError>
            </Field>

            <Field data-invalid={Boolean(form.errors.video_url)}>
                <FieldLabel htmlFor="video_url">
                    YouTube URL or embed code
                </FieldLabel>
                <Input
                    id="video_url"
                    type="text"
                    value={form.data.video_url}
                    onChange={(event) =>
                        form.setData('video_url', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.video_url)}
                    placeholder="Paste a YouTube URL or <iframe ...> code"
                />
                <FieldDescription>
                    Paste once. The application extracts the video and builds
                    the protected player automatically. Use Unlisted videos for
                    participant recordings.
                </FieldDescription>
                <FieldError>{form.errors.video_url}</FieldError>
            </Field>

            <Field data-invalid={Boolean(form.errors.resource)}>
                <FieldLabel htmlFor="resource">Supporting material</FieldLabel>
                <Input
                    id="resource"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    onChange={(event) =>
                        form.setData(
                            'resource',
                            event.target.files?.[0] ?? null,
                        )
                    }
                    aria-invalid={Boolean(form.errors.resource)}
                />
                <FieldDescription>
                    {resourceTitle
                        ? `Current material: ${resourceTitle}. Upload a replacement to swap it. `
                        : ''}
                    PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, JPEG, PNG, or WEBP up
                    to 25 MB. Stored outside the public web directory and
                    downloaded through an authenticated route.
                </FieldDescription>
                <FieldError>{form.errors.resource}</FieldError>
            </Field>
        </FieldGroup>
    );
}
