import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    Bold,
    FilePlus2,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    Megaphone,
    Pencil,
    Pin,
    PinOff,
    Send,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnnouncementMarkdownPreview } from '@/components/announcement-markdown-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import {
    archive,
    edit,
    index as announcementsRoute,
    pin,
    publish,
    store,
    unpin,
    update,
} from '@/routes/admin/announcements';

type AnnouncementStatus = 'draft' | 'published' | 'archived';
type AnnouncementFilter = 'all' | AnnouncementStatus;

type Announcement = {
    id: number;
    title: string;
    summary: string;
    status: AnnouncementStatus;
    is_pinned: boolean;
    published_at_label: string | null;
    deliveries_count: number;
};

type EditableAnnouncement = {
    id: number;
    title: string;
    body: string;
    status: AnnouncementStatus;
    is_pinned: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type AnnouncementsPage = {
    data: Announcement[];
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type AnnouncementForm = {
    title: string;
    body: string;
};

const filterOptions: Array<{
    value: AnnouncementFilter;
    label: string;
}> = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

const statusLabel = (status: AnnouncementStatus): string =>
    status.charAt(0).toUpperCase() + status.slice(1);

const fieldError = (message: string | undefined) =>
    message ? <p className="text-sm text-destructive">{message}</p> : null;

export default function AdminAnnouncements({
    announcements,
    counts,
    filters,
    announcement,
}: {
    announcements: AnnouncementsPage;
    counts: Record<AnnouncementStatus, number>;
    filters: { status: AnnouncementFilter };
    announcement: EditableAnnouncement | null;
}) {
    const form = useForm<AnnouncementForm>({
        title: announcement?.title ?? '',
        body: announcement?.body ?? '',
    });
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const [preview, setPreview] = useState(false);
    const editing = announcement !== null;

    const insertMarkdown = (
        prefix: string,
        suffix: string,
        placeholder: string,
    ) => {
        const textarea = bodyRef.current;
        const current = form.data.body;

        if (textarea === null) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = current.slice(start, end) || placeholder;
        const next = `${current.slice(0, start)}${prefix}${selected}${suffix}${current.slice(end)}`;
        form.setData('body', next);

        window.requestAnimationFrame(() => {
            textarea.focus();
            const cursorStart = start + prefix.length;
            textarea.setSelectionRange(
                cursorStart,
                cursorStart + selected.length,
            );
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            preserveState: 'errors' as const,
        };

        if (announcement !== null) {
            form.patch(update.url(announcement.id), options);
        } else {
            form.post(store.url(), options);
        }
    };

    const changeFilter = (status: string) => {
        router.get(
            announcementsRoute.url(),
            { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const changeLifecycle = (
        announcementId: number,
        action: 'publish' | 'pin' | 'unpin' | 'archive',
    ) => {
        const lifecycleRoutes = { archive, pin, publish, unpin };
        router.patch(
            lifecycleRoutes[action].url(announcementId),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Manage announcements" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit" variant="secondary">
                        Administration
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Manage announcements
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Prepare a clear update, preview the formatting, then
                        publish it manually when the content is ready.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>
                                        {editing
                                            ? 'Edit announcement'
                                            : 'New draft'}
                                    </CardTitle>
                                    <CardDescription>
                                        Formatting supports headings, bold,
                                        italic, lists, and HTTP(S) links.
                                    </CardDescription>
                                </div>
                                <Megaphone className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="flex flex-col gap-6"
                                onSubmit={submit}
                            >
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="announcement-title">
                                        Title
                                    </Label>
                                    <Input
                                        id="announcement-title"
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={160}
                                        aria-invalid={
                                            form.errors.title ? true : undefined
                                        }
                                    />
                                    {fieldError(form.errors.title)}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label htmlFor="announcement-body">
                                            Body
                                        </Label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setPreview((value) => !value)
                                            }
                                        >
                                            {preview ? (
                                                <Pencil />
                                            ) : (
                                                <Megaphone />
                                            )}
                                            {preview ? 'Edit body' : 'Preview'}
                                        </Button>
                                    </div>
                                    {preview ? (
                                        <div className="min-h-56 rounded-md border bg-muted/20 p-4">
                                            {form.data.body.trim() ? (
                                                <AnnouncementMarkdownPreview
                                                    body={form.data.body}
                                                />
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Add body content to preview
                                                    it here.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap gap-1 rounded-md border bg-muted/30 p-1">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Bold"
                                                    aria-label="Bold"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '**',
                                                            '**',
                                                            'bold text',
                                                        )
                                                    }
                                                >
                                                    <Bold />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Italic"
                                                    aria-label="Italic"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '*',
                                                            '*',
                                                            'italic text',
                                                        )
                                                    }
                                                >
                                                    <Italic />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Heading"
                                                    aria-label="Heading"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '## ',
                                                            '',
                                                            'Heading',
                                                        )
                                                    }
                                                >
                                                    <Heading2 />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Bullet list"
                                                    aria-label="Bullet list"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '- ',
                                                            '',
                                                            'List item',
                                                        )
                                                    }
                                                >
                                                    <List />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="HTTP(S) link"
                                                    aria-label="HTTP(S) link"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '[',
                                                            '](https://example.com)',
                                                            'Link text',
                                                        )
                                                    }
                                                >
                                                    <LinkIcon />
                                                </Button>
                                            </div>
                                            <Textarea
                                                ref={bodyRef}
                                                id="announcement-body"
                                                value={form.data.body}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'body',
                                                        event.target.value,
                                                    )
                                                }
                                                maxLength={20000}
                                                rows={14}
                                                aria-invalid={
                                                    form.errors.body
                                                        ? true
                                                        : undefined
                                                }
                                                placeholder="## What changed?\n\nWrite the update here."
                                            />
                                        </>
                                    )}
                                    {fieldError(form.errors.body)}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <FilePlus2 data-icon="inline-start" />
                                        {form.processing
                                            ? 'Saving...'
                                            : editing
                                              ? 'Save changes'
                                              : 'Save draft'}
                                    </Button>
                                    {editing ? (
                                        <Button
                                            asChild
                                            type="button"
                                            variant="outline"
                                        >
                                            <Link href={announcementsRoute()}>
                                                New draft
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>Announcement library</CardTitle>
                                    <CardDescription>
                                        {announcements.total}{' '}
                                        {announcements.total === 1
                                            ? 'announcement'
                                            : 'announcements'}
                                        .
                                    </CardDescription>
                                </div>
                                <Send className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            <Tabs
                                value={filters.status}
                                onValueChange={changeFilter}
                            >
                                <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                                    {filterOptions.map((option) => (
                                        <TabsTrigger
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                            {option.value !== 'all'
                                                ? ` (${counts[option.value]})`
                                                : null}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {announcements.data.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
                                    <Megaphone className="size-6 text-muted-foreground" />
                                    <p className="font-medium">
                                        No announcements in this view
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Save a draft from the form to get
                                        started.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {announcements.data.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex min-w-0 flex-col gap-4 rounded-lg border p-4"
                                        >
                                            <div className="flex min-w-0 flex-col gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {item.title}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            'archived'
                                                                ? 'destructive'
                                                                : item.status ===
                                                                    'published'
                                                                  ? 'default'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {statusLabel(
                                                            item.status,
                                                        )}
                                                    </Badge>
                                                    {item.is_pinned ? (
                                                        <Badge variant="secondary">
                                                            <Pin data-icon="inline-start" />
                                                            Pinned
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {item.summary}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.published_at_label ??
                                                        'Not published'}{' '}
                                                    · {item.deliveries_count}{' '}
                                                    email{' '}
                                                    {item.deliveries_count === 1
                                                        ? 'delivery'
                                                        : 'deliveries'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link href={edit(item.id)}>
                                                        <Pencil data-icon="inline-start" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                {item.status === 'draft' ||
                                                item.status === 'archived' ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            changeLifecycle(
                                                                item.id,
                                                                'publish',
                                                            )
                                                        }
                                                    >
                                                        <Send data-icon="inline-start" />
                                                        {item.status ===
                                                            'archived' &&
                                                        item.published_at_label !==
                                                            null
                                                            ? 'Republish'
                                                            : 'Publish'}
                                                    </Button>
                                                ) : null}
                                                {item.status === 'published' ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                changeLifecycle(
                                                                    item.id,
                                                                    item.is_pinned
                                                                        ? 'unpin'
                                                                        : 'pin',
                                                                )
                                                            }
                                                        >
                                                            {item.is_pinned ? (
                                                                <PinOff data-icon="inline-start" />
                                                            ) : (
                                                                <Pin data-icon="inline-start" />
                                                            )}
                                                            {item.is_pinned
                                                                ? 'Unpin'
                                                                : 'Pin'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                changeLifecycle(
                                                                    item.id,
                                                                    'archive',
                                                                )
                                                            }
                                                        >
                                                            <Archive data-icon="inline-start" />
                                                            Archive
                                                        </Button>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {announcements.last_page > 1 ? (
                                <nav
                                    className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                                    aria-label="Admin announcement pagination"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        Showing {announcements.from} to{' '}
                                        {announcements.to} of{' '}
                                        {announcements.total}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {announcements.links.map(
                                            (link, index) =>
                                                link.url ? (
                                                    <Link
                                                        key={`${link.label}-${index}`}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={`${link.label}-${index}`}
                                                        className="rounded-md px-3 py-2 text-sm text-muted-foreground"
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ),
                                        )}
                                    </div>
                                </nav>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminAnnouncements.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Manage announcements',
            href: announcementsRoute(),
        },
    ],
};
