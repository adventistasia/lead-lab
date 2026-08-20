import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    LibraryBig,
    Plus,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ClassroomFilters } from '@/components/classroom-filters';
import type { ClassroomFilterValues } from '@/components/classroom-filters';
import { SessionFormFields } from '@/components/session-form-fields';
import type { SessionFormData } from '@/components/session-form-fields';
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes';

type Recording = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    is_published: boolean;
    is_archived: boolean;
    resources_count: number;
};

export default function AdminClassroom({
    sessions,
    categories,
    filters,
}: {
    sessions: Recording[];
    categories: string[];
    filters: ClassroomFilterValues;
}) {
    const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
    const [formVersion, setFormVersion] = useState(0);
    const form = useForm<SessionFormData>({
        title: '',
        category: '',
        session_date: '',
        description: '',
        video_url: '',
        resource: null,
    });
    const hasFilters =
        filters.search.trim() !== '' ||
        filters.category !== '' ||
        filters.date_from !== null ||
        filters.date_to !== null;

    const resetForm = () => {
        form.resetAndClearErrors();
        setFormVersion((version) => version + 1);
    };

    const handleAddSessionOpenChange = (open: boolean) => {
        if (!open && form.processing) {
            return;
        }

        if (!open) {
            resetForm();
        }

        setIsAddSessionOpen(open);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/sessions?return_to=classroom', {
            forceFormData: true,
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                resetForm();
                setIsAddSessionOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Classroom recordings" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit" variant="secondary">
                        Administrator classroom
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        All session recordings
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                        Review every recording in the classroom, including draft
                        and archived sessions, before opening the protected
                        session view.
                    </p>
                    <ClassroomFilters
                        action="/admin/classroom"
                        categories={categories}
                        filters={filters}
                    />
                </div>

                <Dialog
                    open={isAddSessionOpen}
                    onOpenChange={handleAddSessionOpenChange}
                >
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Recording library</CardTitle>
                                <CardDescription>
                                    {sessions.length === 0
                                        ? 'No sessions have been added yet.'
                                        : `${sessions.length} session${sessions.length === 1 ? '' : 's'} in the classroom.`}
                                </CardDescription>
                            </div>
                            <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus data-icon="inline-start" />
                                        Add Session
                                    </Button>
                                </DialogTrigger>
                                <LibraryBig className="size-5 shrink-0 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sessions.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
                                    <LibraryBig className="size-6 text-muted-foreground" />
                                    <p className="font-medium">
                                        {hasFilters
                                            ? 'No recordings match these filters'
                                            : 'No recordings yet'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {hasFilters
                                            ? 'Try a broader search or clear the filters.'
                                            : 'Publish a session from the admin area to add the first recording.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center"
                                        >
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <LibraryBig className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-medium">
                                                        {session.title}
                                                    </h2>
                                                    <Badge
                                                        variant={
                                                            session.is_archived
                                                                ? 'destructive'
                                                                : session.is_published
                                                                  ? 'default'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {session.is_archived
                                                            ? 'Archived'
                                                            : session.is_published
                                                              ? 'Published'
                                                              : 'Draft'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                    <span>
                                                        {session.category}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDays className="size-3.5" />
                                                        {session.session_date}
                                                    </span>
                                                    <span>
                                                        {
                                                            session.resources_count
                                                        }{' '}
                                                        protected resource
                                                        {session.resources_count ===
                                                        1
                                                            ? ''
                                                            : 's'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                className="w-full md:w-auto"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={`/sessions/${session.id}`}
                                                >
                                                    Open recording
                                                    <ArrowRight data-icon="inline-end" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add a classroom session</DialogTitle>
                            <DialogDescription>
                                Save the session as a draft. Publish it later
                                when the content is ready for participants.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            key={formVersion}
                            className="flex flex-col gap-6"
                            onSubmit={submit}
                        >
                            <SessionFormFields form={form} />
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
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    <Upload data-icon="inline-start" />
                                    {form.processing
                                        ? 'Saving...'
                                        : 'Save draft'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AdminClassroom.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Classroom recordings',
            href: '/admin/classroom',
        },
    ],
};
