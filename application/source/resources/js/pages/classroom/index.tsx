import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, LibraryBig } from 'lucide-react';
import { ClassroomFilters } from '@/components/classroom-filters';
import type { ClassroomFilterValues } from '@/components/classroom-filters';
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

type Recording = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    resources_count: number;
};

export default function Classroom({
    sessions,
    categories,
    filters,
}: {
    sessions: Recording[];
    categories: string[];
    filters: ClassroomFilterValues;
}) {
    const hasFilters =
        filters.search.trim() !== '' ||
        filters.category !== '' ||
        filters.date_from !== null ||
        filters.date_to !== null;

    return (
        <>
            <Head title="Classroom recordings" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-6">
                    <Badge className="w-fit" variant="secondary">
                        Classroom
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Session recordings
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                        Browse published recordings and open a protected session
                        view when you are ready to continue learning.
                    </p>
                    <ClassroomFilters
                        action="/classroom"
                        categories={categories}
                        filters={filters}
                    />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                            <CardTitle>Recording library</CardTitle>
                            <CardDescription>
                                {sessions.length === 0
                                    ? 'No published sessions are available yet.'
                                    : `${sessions.length} published session${sessions.length === 1 ? '' : 's'} in the classroom.`}
                            </CardDescription>
                        </div>
                        <LibraryBig className="size-5 text-muted-foreground" />
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
                                        : 'Published sessions will appear here.'}
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
                                            <h2 className="font-medium">
                                                {session.title}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                <span>{session.category}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays className="size-3.5" />
                                                    {session.session_date}
                                                </span>
                                                <span>
                                                    {session.resources_count}{' '}
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
            </div>
        </>
    );
}

Classroom.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Classroom recordings',
            href: '/classroom',
        },
    ],
};
