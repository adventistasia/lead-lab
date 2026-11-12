import { router, useForm } from '@inertiajs/react';
import { Pencil, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import {
    destroy as destroyReflection,
    store as storeReflection,
    update as updateReflection,
} from '@/routes/sessions/reflections';

type SessionReflectionAuthor = {
    id: number;
    name: string;
    role: string;
};

export type SessionReflectionEntry = {
    id: number;
    body: string;
    created_at: string;
    is_edited: boolean;
    author: SessionReflectionAuthor;
    can_edit: boolean;
    can_delete: boolean;
};

type ReflectionFormData = {
    body: string;
};

type Notice = {
    message: string;
    tone: 'error' | 'success';
};

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

const initials = (name: string): string =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const roleLabel = (role: string): string => {
    if (role === 'admin') {
        return 'Administrator';
    }

    return role === 'moderator' ? 'Moderator' : 'Participant';
};

function FormErrors({ message }: { message?: string }) {
    return message ? <FieldError errors={[{ message }]} /> : null;
}

export function SessionReflection({
    sessionId,
    reflections,
}: {
    sessionId: number;
    reflections: SessionReflectionEntry[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const form = useForm<ReflectionFormData>({ body: '' });
    const editForm = useForm<ReflectionFormData>({ body: '' });
    const hasOwnReflection = reflections.some(
        (reflection) => reflection.can_edit,
    );

    const submitReflection = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setNotice(null);
        form.post(storeReflection.url(sessionId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                setNotice({
                    message: 'Reflection submitted.',
                    tone: 'success',
                });
            },
            onError: () =>
                setNotice({
                    message: 'Unable to save your reflection. Try again.',
                    tone: 'error',
                }),
        });
    };

    const startEditing = (reflection: SessionReflectionEntry) => {
        editForm.setData('body', reflection.body);
        editForm.clearErrors();
        setNotice(null);
        setEditingId(reflection.id);
    };

    const cancelEditing = () => {
        editForm.reset();
        editForm.clearErrors();
        setEditingId(null);
    };

    const submitEdit = (
        event: FormEvent<HTMLFormElement>,
        reflectionId: number,
    ) => {
        event.preventDefault();
        setNotice(null);
        editForm.patch(updateReflection.url([sessionId, reflectionId]), {
            preserveScroll: true,
            onSuccess: () => {
                editForm.reset();
                editForm.clearErrors();
                setEditingId(null);
                setNotice({
                    message: 'Reflection updated.',
                    tone: 'success',
                });
            },
            onError: () =>
                setNotice({
                    message: 'Unable to save your reflection. Try again.',
                    tone: 'error',
                }),
        });
    };

    const deleteReflection = (reflection: SessionReflectionEntry) => {
        if (!window.confirm('Delete this reflection?')) {
            return;
        }

        setNotice(null);
        router.delete(destroyReflection.url([sessionId, reflection.id]), {
            preserveScroll: true,
            onSuccess: () =>
                setNotice({ message: 'Reflection deleted.', tone: 'success' }),
            onError: () =>
                setNotice({
                    message: 'Unable to delete your reflection. Try again.',
                    tone: 'error',
                }),
        });
    };

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Session reflection</h2>
                <p className="text-sm text-muted-foreground">
                    Share what you learned and what you will apply from this
                    session.
                </p>
                <p className="text-sm text-muted-foreground">
                    Your reflection will be visible to everyone who can access
                    this session.
                </p>
            </div>

            {notice && (
                <p
                    role="status"
                    aria-live="polite"
                    className={`text-sm ${
                        notice.tone === 'error'
                            ? 'text-destructive'
                            : 'text-primary'
                    }`}
                >
                    {notice.message}
                </p>
            )}

            {!hasOwnReflection && (
                <form
                    onSubmit={submitReflection}
                    className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4"
                >
                    <FieldGroup className="gap-4">
                        <Field data-invalid={Boolean(form.errors.body)}>
                            <FieldLabel htmlFor="session-reflection-body">
                                Your reflection
                            </FieldLabel>
                            <Textarea
                                id="session-reflection-body"
                                value={form.data.body}
                                onChange={(event) =>
                                    form.setData('body', event.target.value)
                                }
                                aria-invalid={Boolean(form.errors.body)}
                                aria-describedby="session-reflection-help"
                                placeholder="What stood out to you from this session?"
                                maxLength={5000}
                                required
                            />
                            <FieldDescription id="session-reflection-help">
                                Required. Use up to 5,000 characters. Paragraph
                                breaks are kept.
                            </FieldDescription>
                            <FormErrors message={form.errors.body} />
                        </Field>
                    </FieldGroup>
                    <Button
                        type="submit"
                        className="w-fit"
                        disabled={form.processing}
                    >
                        <Send data-icon="inline-start" />
                        Submit reflection
                    </Button>
                </form>
            )}

            {reflections.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="font-medium">No reflections yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Be the first to reflect on this session.
                    </p>
                </div>
            ) : (
                <div className="flex min-w-0 flex-col gap-4">
                    {reflections.map((reflection) => (
                        <article
                            key={reflection.id}
                            className="flex min-w-0 flex-col gap-4 rounded-lg border p-4"
                        >
                            {editingId === reflection.id ? (
                                <form
                                    onSubmit={(event) =>
                                        submitEdit(event, reflection.id)
                                    }
                                    className="flex flex-col gap-4"
                                >
                                    <FieldGroup>
                                        <Field
                                            data-invalid={Boolean(
                                                editForm.errors.body,
                                            )}
                                        >
                                            <FieldLabel
                                                htmlFor={`edit-reflection-body-${reflection.id}`}
                                            >
                                                Edit your reflection
                                            </FieldLabel>
                                            <Textarea
                                                id={`edit-reflection-body-${reflection.id}`}
                                                value={editForm.data.body}
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'body',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={Boolean(
                                                    editForm.errors.body,
                                                )}
                                                maxLength={5000}
                                                required
                                            />
                                            <FormErrors
                                                message={editForm.errors.body}
                                            />
                                        </Field>
                                    </FieldGroup>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={editForm.processing}
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEditing}
                                        >
                                            <X data-icon="inline-start" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <Avatar className="size-9">
                                            <AvatarFallback>
                                                {initials(
                                                    reflection.author.name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <p className="font-medium">
                                                    {reflection.author.name}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {roleLabel(
                                                        reflection.author.role,
                                                    )}
                                                </span>
                                                {reflection.is_edited && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Edited
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    reflection.created_at,
                                                )}
                                            </p>
                                        </div>
                                        {(reflection.can_edit ||
                                            reflection.can_delete) && (
                                            <div className="flex shrink-0 gap-1">
                                                {reflection.can_edit && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Edit reflection"
                                                        onClick={() =>
                                                            startEditing(
                                                                reflection,
                                                            )
                                                        }
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                )}
                                                {reflection.can_delete && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Delete reflection"
                                                        onClick={() =>
                                                            deleteReflection(
                                                                reflection,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm leading-7 break-words whitespace-pre-wrap">
                                        {reflection.body}
                                    </p>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
