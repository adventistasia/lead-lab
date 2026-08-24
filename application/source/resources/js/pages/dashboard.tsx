import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Clock3,
    MessageSquareText,
    Play,
    UsersRound,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';

const stats = [
    {
        label: 'Sessions ready',
        value: '12',
        detail: 'Across 4 learning tracks',
        icon: BookOpen,
    },
    {
        label: 'Community posts',
        value: '28',
        detail: '6 new conversations this week',
        icon: MessageSquareText,
    },
    {
        label: 'Next event',
        value: '2 days',
        detail: 'Lead Lab office hours',
        icon: CalendarDays,
    },
    {
        label: 'Cohort members',
        value: '24',
        detail: 'Everyone is on track',
        icon: UsersRound,
    },
];

type DashboardSession = {
    id: number;
    title: string;
    track: string;
    duration: string;
    progress: string;
};

type SessionSummary = {
    id: number;
    title: string;
    category: string;
    resources_count: number;
};

const communityUpdates = [
    {
        author: 'Maya Chen',
        initials: 'MC',
        text: 'Shared a useful question about follow-up timing.',
        time: '18 min ago',
    },
    {
        author: 'Jordan Lee',
        initials: 'JL',
        text: "Posted a win from this week's outreach sprint.",
        time: '2 hrs ago',
    },
    {
        author: 'Lead Lab team',
        initials: 'LL',
        text: 'Pinned the preparation notes for office hours.',
        time: 'Yesterday',
    },
];

export default function Dashboard({
    sessions = [],
    is_admin = false,
}: {
    sessions?: SessionSummary[];
    is_admin?: boolean;
}) {
    const displayedSessions: DashboardSession[] = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        track: session.category,
        duration: `${session.resources_count} resource${session.resources_count === 1 ? '' : 's'}`,
        progress: 'Open session',
    }));
    const classroomHref = is_admin ? '/admin/classroom' : '/classroom';

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
                                Welcome back, Agno.
                            </h1>
                            <p className="max-w-xl text-base leading-7 text-muted-foreground">
                                Keep your learning rhythm moving. Pick up where
                                you left off, join the next conversation, or
                                prepare for the next live session.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <a href="#classroom">
                                    <Play data-icon="inline-start" />
                                    Resume classroom
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <a href="#calendar">
                                    <CalendarDays data-icon="inline-start" />
                                    View calendar
                                </a>
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
                                Office hours
                            </p>
                            <p className="text-sm text-primary-foreground/70">
                                Thursday, August 21 at 10:00 AM
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
                    {stats.map((stat) => (
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
                        <CardContent className="flex flex-col gap-2">
                            {displayedSessions.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    No published sessions are available yet.
                                </p>
                            ) : (
                                displayedSessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/60"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <span className="text-sm font-semibold">
                                                0{index + 1}
                                            </span>
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <Link
                                                href={`/sessions/${session.id}`}
                                                className="truncate text-sm font-medium hover:underline"
                                            >
                                                {session.title}
                                            </Link>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {session.track} ·{' '}
                                                {session.duration}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                index === 0
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {session.progress}
                                        </Badge>
                                    </div>
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
                                        Recent activity from your cohort.
                                    </CardDescription>
                                </div>
                                <MessageSquareText className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {communityUpdates.map((update, index) => (
                                <div
                                    key={update.author}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-9">
                                            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                                                {update.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="text-sm font-medium">
                                                {update.author}
                                            </p>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {update.text}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {update.time}
                                            </p>
                                        </div>
                                    </div>
                                    {index < communityUpdates.length - 1 && (
                                        <Separator />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <a href="#community">
                                    Open community
                                    <ArrowRight data-icon="inline-end" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                </section>

                <section id="calendar" className="scroll-mt-8">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Upcoming calendar</CardTitle>
                                <CardDescription>
                                    Make the next live moment easy to find.
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <a href="#calendar">
                                    View all
                                    <ArrowRight data-icon="inline-end" />
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-background text-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Aug
                                    </span>
                                    <span className="text-xl font-semibold">
                                        21
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <p className="font-medium">
                                        Lead Lab office hours
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Bring one live question for the group.
                                    </p>
                                </div>
                                <Badge variant="secondary">Live</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
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
