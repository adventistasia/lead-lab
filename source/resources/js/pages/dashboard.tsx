import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Clock3,
    MessageSquareText,
    Play,
    Plus,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { CalendarEventDialog } from '@/components/calendar-event-dialog';
import type { CalendarEventSummary } from '@/components/calendar-utils';
import {
    formatEventDate,
    formatEventTimeRange,
} from '@/components/calendar-utils';
import { SessionThumbnail } from '@/components/session-thumbnail';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';

type DashboardSession = {
    id: number;
    title: string;
    category: string;
    sessionDate: string;
    description: string;
    thumbnailUrl: string | null;
};

type SessionSummary = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    description: string;
    resources_count: number;
    video_thumbnail_url: string | null;
};

type CommunityUpdate = {
    id: string;
    type: 'question' | 'answer';
    author: string;
    text: string;
    time: string;
    session_title: string;
    url: string;
};

type DashboardMetrics = {
    sessions_ready: number;
    active_members: number;
    community_activity: number;
};

const initials = (name: string): string =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const formatSessionDate = (value: string): string => {
    const [year, month, day] = value.split('-').map(Number);

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(year, month - 1, day));
};

export default function Dashboard({
    metrics = {
        sessions_ready: 0,
        active_members: 0,
        community_activity: 0,
    },
    sessions = [],
    upcoming_events = [],
    timezone = 'UTC',
    community_updates = [],
    is_admin = false,
}: {
    metrics?: DashboardMetrics;
    sessions?: SessionSummary[];
    upcoming_events?: CalendarEventSummary[];
    timezone?: string;
    community_updates?: CommunityUpdate[];
    is_admin?: boolean;
}) {
    const { auth } = usePage().props;
    const displayedSessions: DashboardSession[] = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        category: session.category,
        sessionDate: formatSessionDate(session.session_date),
        description: session.description,
        thumbnailUrl: session.video_thumbnail_url,
    }));
    const displayedCommunityUpdates = community_updates.slice(0, 3);
    const classroomHref = is_admin ? '/admin/classroom' : '/classroom';
    const nextEvent = upcoming_events[0];
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const displayedStats = [
        {
            label: 'Sessions ready',
            value: metrics.sessions_ready,
            detail: 'Published sessions',
            icon: BookOpen,
        },
        {
            label: 'Community activity',
            value: metrics.community_activity,
            detail: 'Questions and answers',
            icon: MessageSquareText,
        },
        {
            label: 'Upcoming events',
            value: nextEvent ? formatEventDate(nextEvent, timezone) : 'None',
            detail: nextEvent
                ? nextEvent.title
                : 'No events have been scheduled',
            icon: CalendarDays,
        },
        {
            label: 'Active members',
            value: metrics.active_members,
            detail: 'Members with active access',
            icon: UsersRound,
        },
    ];

    return (
        <>
            <Head title="Home" />
            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 md:p-8">
                <section className="grid gap-6 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm lg:grid-cols-[1fr_20rem] lg:p-8">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Lead Lab 2026</Badge>
                            <Badge variant="outline">Prototype shell</Badge>
                        </div>
                        <div className="flex max-w-2xl flex-col gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Welcome back, {auth.user.name}.
                            </h1>
                            <p className="max-w-xl text-base leading-7 text-muted-foreground">
                                Keep your learning rhythm moving. Pick up where
                                you left off, join the next conversation, or
                                prepare for the next live session.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href={classroomHref}>
                                    <Play data-icon="inline-start" />
                                    View Classroom
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/calendar">
                                    <CalendarDays data-icon="inline-start" />
                                    View calendar
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8 rounded-xl bg-primary p-6 text-primary-foreground">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-primary-foreground/70">
                                Next live session
                            </span>
                            <Clock3 className="size-5 text-primary-foreground/70" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-2xl font-semibold">
                                {nextEvent?.title ?? 'No scheduled events'}
                            </p>
                            <p className="text-sm text-primary-foreground/70">
                                {nextEvent
                                    ? `${formatEventDate(nextEvent, timezone)} at ${formatEventTimeRange(nextEvent, timezone)}`
                                    : 'Add an event when the next live moment is confirmed.'}
                            </p>
                        </div>
                        <Button asChild variant="secondary" className="w-full">
                            <a href="#calendar">
                                See details
                                <ArrowRight data-icon="inline-end" />
                            </a>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {displayedStats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-border/70 shadow-none"
                        >
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <CardDescription>
                                        {stat.label}
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                        {stat.value}
                                    </CardTitle>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                                    <stat.icon className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {stat.detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section
                    id="classroom"
                    className="grid min-w-0 scroll-mt-8 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
                >
                    <Card className="min-w-0">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Recent sessions</CardTitle>
                                <CardDescription>
                                    {sessions.length === 0
                                        ? 'No published sessions are available yet.'
                                        : `Your ${sessions.length === 5 ? 'five' : sessions.length} most recent sessions.`}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={classroomHref}>
                                    Browse all
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {displayedSessions.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    No published sessions are available yet.
                                </p>
                            ) : (
                                displayedSessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessions/${session.id}`}
                                        className="group flex min-w-0 items-stretch gap-4 rounded-lg p-3 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-5"
                                    >
                                        <SessionThumbnail
                                            thumbnailUrl={session.thumbnailUrl}
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                                            <h3 className="line-clamp-2 text-sm font-medium group-hover:underline md:text-base">
                                                {session.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {session.category} ·{' '}
                                                {session.sessionDate}
                                            </p>
                                            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                {session.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card id="community" className="min-w-0 scroll-mt-8">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>Community pulse</CardTitle>
                                    <CardDescription>
                                        Recent Q&amp;A activity from your
                                        cohort.
                                    </CardDescription>
                                </div>
                                <MessageSquareText className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {displayedCommunityUpdates.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    No Q&amp;A activity yet.
                                </p>
                            ) : (
                                displayedCommunityUpdates.map(
                                    (update, index) => (
                                        <div
                                            key={update.id}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                                                        {initials(
                                                            update.author,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                    <p className="text-sm font-medium">
                                                        {update.author}
                                                    </p>
                                                    <Link
                                                        href={update.url}
                                                        className="text-sm leading-6 text-muted-foreground hover:text-foreground hover:underline"
                                                    >
                                                        {update.text}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {update.session_title} ·{' '}
                                                        {update.time}
                                                    </p>
                                                </div>
                                            </div>
                                            {index <
                                                displayedCommunityUpdates.length -
                                                    1 && <Separator />}
                                        </div>
                                    ),
                                )
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section id="calendar" className="scroll-mt-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Upcoming calendar</CardTitle>
                                <CardDescription>
                                    Make the next live moment easy to find.
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {is_admin && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setIsEventDialogOpen(true)
                                        }
                                    >
                                        <Plus data-icon="inline-start" />
                                        Add event
                                    </Button>
                                )}
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/calendar">
                                        View calendar
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {upcoming_events.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    No events have been scheduled yet.
                                </p>
                            ) : (
                                upcoming_events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {event.title}
                                                </p>
                                                <Badge variant="secondary">
                                                    Scheduled
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatEventDate(
                                                    event,
                                                    timezone,
                                                )}{' '}
                                                ·{' '}
                                                {formatEventTimeRange(
                                                    event,
                                                    timezone,
                                                )}
                                            </p>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
            {is_admin && (
                <CalendarEventDialog
                    open={isEventDialogOpen}
                    onOpenChange={setIsEventDialogOpen}
                    returnTo="dashboard"
                    timezone={timezone}
                />
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
    ],
};

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
