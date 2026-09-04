import type { InertiaForm } from '@inertiajs/react';
import { FileText, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const MAX_SESSION_RESOURCES = 10;
export const MAX_RESOURCE_SIZE_BYTES = 10 * 1024 * 1024;

export type SessionFormData = {
    title: string;
    season: string;
    session_date: string;
    description: string;
    video_url: string;
    resources: File[];
};

export type SessionResource = {
    id: number;
    title: string;
    size: number | null;
};

type SessionFormFieldsProps = {
    form: InertiaForm<SessionFormData>;
    existingResources?: SessionResource[];
    onRemoveResource?: (resource: SessionResource) => void;
    removingResourceId?: number | null;
};

const resourceErrorKey = (key: string) =>
    key === 'resources' || key.startsWith('resources.');

export function hasSessionResourceErrors(
    form: InertiaForm<SessionFormData>,
): boolean {
    return Object.keys(form.errors).some(resourceErrorKey);
}

function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export function SessionFormFields({
    form,
    existingResources = [],
    onRemoveResource,
    removingResourceId = null,
}: SessionFormFieldsProps) {
    const resourceErrors = Object.entries(form.errors)
        .filter(([key]) => resourceErrorKey(key))
        .map(([, message]) => message)
        .filter((message): message is string => typeof message === 'string');

    const clearResourceErrors = () => {
        const keys = Object.keys(form.errors).filter(resourceErrorKey) as Array<
            keyof SessionFormData
        >;

        form.clearErrors(...keys);
    };

    const handleResourceChange = (event: ChangeEvent<HTMLInputElement>) => {
        const resources = Array.from(event.target.files ?? []);
        const oversizedResource = resources.find(
            (resource) => resource.size > MAX_RESOURCE_SIZE_BYTES,
        );

        clearResourceErrors();
        form.setData('resources', resources);

        if (oversizedResource) {
            form.setError(
                'resources',
                `${oversizedResource.name} is too big. Each file must be 10 MB or less.`,
            );

            return;
        }

        if (
            existingResources.length + resources.length >
            MAX_SESSION_RESOURCES
        ) {
            form.setError(
                'resources',
                'A session can have no more than 10 supporting materials. Select fewer files for this batch or remove an existing material.',
            );
        }
    };

    return (
        <FieldGroup className="min-w-0">
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

            <Field className="min-w-0" data-invalid={resourceErrors.length > 0}>
                <FieldLabel htmlFor="resources">
                    Batch upload supporting materials
                </FieldLabel>
                <Input
                    id="resources"
                    type="file"
                    className="max-w-full text-sm"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    onChange={handleResourceChange}
                    aria-invalid={resourceErrors.length > 0}
                />
                <FieldDescription className="break-words">
                    Select up to{' '}
                    {Math.max(
                        0,
                        MAX_SESSION_RESOURCES - existingResources.length,
                    )}{' '}
                    files for this batch. Each file can be up to 10 MB. Accepted
                    formats: PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, JPEG, PNG, and
                    WEBP. Stored outside the public web directory and downloaded
                    through an authenticated route.
                </FieldDescription>
                {existingResources.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg border p-3">
                        <p className="text-sm font-medium">
                            Current supporting materials
                        </p>
                        {existingResources.map((resource) => (
                            <div
                                key={resource.id}
                                className="flex min-w-0 flex-wrap items-start gap-3"
                            >
                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm break-words">
                                        {resource.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {resource.size
                                            ? formatFileSize(resource.size)
                                            : 'Size unavailable'}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="shrink-0"
                                    disabled={removingResourceId !== null}
                                    onClick={() => onRemoveResource?.(resource)}
                                >
                                    <Trash2 data-icon="inline-start" />
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                {form.data.resources.length > 0 && (
                    <div className="min-w-0 rounded-lg border border-dashed">
                        <p className="px-3 py-3 text-sm font-medium">
                            Selected for this batch
                        </p>
                        <div className="divide-y border-t">
                            {form.data.resources.map((resource) => (
                                <div
                                    key={`${resource.name}-${resource.lastModified}`}
                                    className="flex min-w-0 items-start gap-3 px-3 py-2.5 text-sm"
                                >
                                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                        <span className="min-w-0 break-words">
                                            {resource.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatFileSize(resource.size)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <FieldError className="break-words">
                    {[...new Set(resourceErrors)].join(' ')}
                </FieldError>
            </Field>
        </FieldGroup>
    );
}
