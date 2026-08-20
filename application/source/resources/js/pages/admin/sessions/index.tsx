import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Eye,
    EyeOff,
    FilePlus2,
    LibraryBig,
    Pencil,
    Upload,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';

type LearningSession = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    is_published: boolean;
    is_archived: boolean;
    resources_count: number;
};

type EditableSession = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    description: string;
    video_url: string;
    resource_title: string | null;
};

type SessionForm = {
    title: string;
    category: string;
    session_date: string;
    description: string;
    video_url: string;
    resource: File | null;
};

export default function AdminSessions({
    sessions,
    session,
}: {
    sessions: LearningSession[];
    session?: EditableSession;
}) {
    const form = useForm<SessionForm>({
        title: session?.title ?? '',
        category: session?.category ?? '',
        session_date: session?.session_date ?? '',
        description: session?.description ?? '',
        video_url: session?.video_url ?? '',
        resource: null,
    });
    const lifecycleForm = useForm({});
    const isEditing = session !== undefined;

    const changeLifecycle = (
        learningSession: LearningSession,
        action: 'publish' | 'unpublish' | 'archive' | 'restore',
    ) => {
        if (
            action === 'archive' &&
            !window.confirm(
                `Archive "${learningSession.title}"? Participants will no longer see it.`,
            )
        ) {
            return;
        }

        lifecycleForm.patch(`/admin/sessions/${learningSession.id}/${action}`, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                router.reload({
                    only: ['sessions'],
                });
            },
        });
    };

    const statusLabel = (learningSession: LearningSession) => {
        if (learningSession.is_archived) {
            return 'Archived';
        }

        return learningSession.is_published ? 'Published' : 'Draft';
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            forceFormData: true,
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => form.reset(),
        };

        if (session !== undefined) {
            form.transform((data) => ({
                ...data,
                _method: 'PATCH',
            }));
            form.post(`/admin/sessions/${session.id}`, {
                ...options,
                onFinish: () => form.transform((data) => data),
            });

            return;
        }

        form.post('/admin/sessions', options);
    };

    return (
        <>
            <Head title="Manage sessions" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit" variant="secondary">
                        Administration
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {isEditing
                            ? 'Edit a classroom session'
                            : 'Add a classroom session'}
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        {isEditing
                            ? 'Update the session details and replace its protected material when needed.'
                            : 'Save a complete session as a draft, then publish it when the content is ready.'}
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {isEditing ? 'Edit session' : 'New draft'}
                            </CardTitle>
                            <CardDescription>
                                Publishing is a separate action. Archived
                                sessions remain available to administrators.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="flex flex-col gap-6"
                                onSubmit={submit}
                            >
                                <FieldGroup>
                                    <Field
                                        data-invalid={Boolean(
                                            form.errors.title,
                                        )}
                                    >
                                        <FieldLabel htmlFor="title">
                                            Title
                                        </FieldLabel>
                                        <Input
                                            id="title"
                                            value={form.data.title}
                                            onChange={(event) =>
                                                form.setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                form.errors.title,
                                            )}
                                            placeholder="Build your weekly lead engine"
                                        />
                                        <FieldError>
                                            {form.errors.title}
                                        </FieldError>
                                    </Field>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <Field
                                            data-invalid={Boolean(
                                                form.errors.category,
                                            )}
                                        >
                                            <FieldLabel htmlFor="category">
                                                Category
                                            </FieldLabel>
                                            <Input
                                                id="category"
                                                value={form.data.category}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'category',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={Boolean(
                                                    form.errors.category,
                                                )}
                                                placeholder="Lead generation systems"
                                            />
                                            <FieldError>
                                                {form.errors.category}
                                            </FieldError>
                                        </Field>

                                        <Field
                                            data-invalid={Boolean(
                                                form.errors.session_date,
                                            )}
                                        >
                                            <FieldLabel htmlFor="session_date">
                                                Session date
                                            </FieldLabel>
                                            <Input
                                                id="session_date"
                                                type="date"
                                                value={form.data.session_date}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'session_date',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={Boolean(
                                                    form.errors.session_date,
                                                )}
                                            />
                                            <FieldError>
                                                {form.errors.session_date}
                                            </FieldError>
                                        </Field>
                                    </div>

                                    <Field
                                        data-invalid={Boolean(
                                            form.errors.description,
                                        )}
                                    >
                                        <FieldLabel htmlFor="description">
                                            Description
                                        </FieldLabel>
                                        <Textarea
                                            id="description"
                                            value={form.data.description}
                                            onChange={(event) =>
                                                form.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                form.errors.description,
                                            )}
                                            placeholder="What should participants take away from this session?"
                                            rows={5}
                                        />
                                        <FieldDescription>
                                            Keep the description practical and
                                            easy to scan.
                                        </FieldDescription>
                                        <FieldError>
                                            {form.errors.description}
                                        </FieldError>
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(
                                            form.errors.video_url,
                                        )}
                                    >
                                        <FieldLabel htmlFor="video_url">
                                            YouTube URL or embed code
                                        </FieldLabel>
                                        <Input
                                            id="video_url"
                                            type="text"
                                            value={form.data.video_url}
                                            onChange={(event) =>
                                                form.setData(
                                                    'video_url',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                form.errors.video_url,
                                            )}
                                            placeholder="Paste a YouTube URL or <iframe ...> code"
                                        />
                                        <FieldDescription>
                                            Paste once. The application extracts
                                            the video and builds the protected
                                            player automatically. Use Unlisted
                                            videos for participant recordings.
                                        </FieldDescription>
                                        <FieldError>
                                            {form.errors.video_url}
                                        </FieldError>
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(
                                            form.errors.resource,
                                        )}
                                    >
                                        <FieldLabel htmlFor="resource">
                                            Supporting material
                                        </FieldLabel>
                                        <Input
                                            id="resource"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={(event) =>
                                                form.setData(
                                                    'resource',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                form.errors.resource,
                                            )}
                                        />
                                        <FieldDescription>
                                            {session?.resource_title
                                                ? `Current material: ${session.resource_title}. Upload a replacement to swap it. `
                                                : ''}
                                            Stored outside the public web
                                            directory and downloaded through an
                                            authenticated route.
                                        </FieldDescription>
                                        <FieldError>
                                            {form.errors.resource}
                                        </FieldError>
                                    </Field>
                                </FieldGroup>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Upload data-icon="inline-start" />
                                        {form.processing
                                            ? 'Saving...'
                                            : isEditing
                                              ? 'Save changes'
                                              : 'Save draft'}
                                    </Button>
                                    {isEditing && (
                                        <Button asChild variant="outline">
                                            <Link href="/admin/sessions">
                                                Cancel edit
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>Session library</CardTitle>
                                    <CardDescription>
                                        Draft, published, and archived content.
                                    </CardDescription>
                                </div>
                                <LibraryBig className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {sessions.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
                                    <FilePlus2 className="size-6 text-muted-foreground" />
                                    <p className="font-medium">
                                        No sessions yet
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Save the first draft from the form.
                                    </p>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-start"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {session.title}
                                                </p>
                                                <Badge
                                                    variant={
                                                        session.is_archived
                                                            ? 'destructive'
                                                            : session.is_published
                                                              ? 'default'
                                                              : 'outline'
                                                    }
                                                >
                                                    {statusLabel(session)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {session.category} ·{' '}
                                                {session.session_date}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.resources_count}{' '}
                                                protected resource
                                                {session.resources_count === 1
                                                    ? ''
                                                    : 's'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:justify-end">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={`/admin/sessions/${session.id}/edit`}
                                                >
                                                    <Pencil data-icon="inline-start" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            {session.is_archived ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={
                                                        lifecycleForm.processing
                                                    }
                                                    onClick={() =>
                                                        changeLifecycle(
                                                            session,
                                                            'restore',
                                                        )
                                                    }
                                                >
                                                    <ArchiveRestore data-icon="inline-start" />
                                                    Restore
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            lifecycleForm.processing
                                                        }
                                                        onClick={() =>
                                                            changeLifecycle(
                                                                session,
                                                                session.is_published
                                                                    ? 'unpublish'
                                                                    : 'publish',
                                                            )
                                                        }
                                                    >
                                                        {session.is_published ? (
                                                            <EyeOff data-icon="inline-start" />
                                                        ) : (
                                                            <Eye data-icon="inline-start" />
                                                        )}
                                                        {session.is_published
                                                            ? 'Unpublish'
                                                            : 'Publish'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={
                                                            lifecycleForm.processing
                                                        }
                                                        onClick={() =>
                                                            changeLifecycle(
                                                                session,
                                                                'archive',
                                                            )
                                                        }
                                                    >
                                                        <Archive data-icon="inline-start" />
                                                        Archive
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminSessions.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Manage sessions',
            href: '/admin/sessions',
        },
    ],
};
