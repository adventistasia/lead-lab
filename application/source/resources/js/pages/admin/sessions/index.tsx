import { Head, useForm } from '@inertiajs/react';
import { FilePlus2, LibraryBig, Upload } from 'lucide-react';
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
    resources_count: number;
};

type SessionForm = {
    title: string;
    category: string;
    session_date: string;
    description: string;
    video_url: string;
    resource: File | null;
    is_published: boolean;
};

export default function AdminSessions({
    sessions,
}: {
    sessions: LearningSession[];
}) {
    const form = useForm<SessionForm>({
        title: '',
        category: '',
        session_date: '',
        description: '',
        video_url: '',
        resource: null,
        is_published: true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/sessions', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
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
                        Publish a classroom session
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Create one complete session with a video and protected
                        resource. This is the first admin step in the local
                        vertical slice.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>New session</CardTitle>
                            <CardDescription>
                                Published sessions are visible to active
                                participants.
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
                                            YouTube URL
                                        </FieldLabel>
                                        <Input
                                            id="video_url"
                                            type="url"
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
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                        <FieldDescription>
                                            Authenticated participants may still
                                            discover or share an embedded URL.
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
                                            Stored outside the public web
                                            directory and downloaded through an
                                            authenticated route.
                                        </FieldDescription>
                                        <FieldError>
                                            {form.errors.resource}
                                        </FieldError>
                                    </Field>
                                </FieldGroup>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    <Upload data-icon="inline-start" />
                                    {form.processing
                                        ? 'Publishing...'
                                        : 'Publish session'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>Published sessions</CardTitle>
                                    <CardDescription>
                                        Content currently available in the
                                        classroom.
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
                                        Publish the first one from the form.
                                    </p>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-start gap-3 rounded-lg border p-4"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="font-medium">
                                                {session.title}
                                            </p>
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
                                        <Badge
                                            variant={
                                                session.is_published
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {session.is_published
                                                ? 'Published'
                                                : 'Draft'}
                                        </Badge>
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
