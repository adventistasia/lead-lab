import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CircleHelp,
    ClipboardCheck,
    UsersRound,
    Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { calendar, dashboard } from '@/routes';
import { index as adminClassroom } from '@/routes/admin/classroom';
import { index as adminGuidelines } from '@/routes/admin/guidelines';
import { index as adminMembers } from '@/routes/admin/members';

const responsibilities = [
    {
        title: 'Protect member access',
        description:
            'Review registrations carefully. Approve, revoke, or restore access when needed. Change roles only when the person should have different portal duties.',
    },
    {
        title: 'Keep sessions ready',
        description:
            'Check titles, Seasons, dates, descriptions, videos, and supporting files. Keep unfinished work as a draft until it is ready to publish.',
    },
    {
        title: 'Keep the calendar clear',
        description:
            'Add useful events, check the local date and time, and choose the reminders that help members prepare.',
    },
    {
        title: 'Keep Q&A useful',
        description:
            'Review questions and answers in each Learning Session. Use the moderation controls when content needs to be corrected or removed.',
    },
];

const howTos = [
    {
        title: 'Manage members and roles',
        icon: UsersRound,
        href: adminMembers(),
        recording: {
            src: '/admin-guidelines-members.gif',
            alt: 'Screen recording showing a filtered member list and the Change member role dialog.',
        },
        steps: [
            'Open Members from the sidebar.',
            'Use the account-state tabs to view active, pending email verification, pending administrator acceptance, or revoked members. Search by name or email when needed.',
            'Review the member and email status.',
            'Choose Approve access, Revoke access, or Restore access.',
            'Choose Change role when the member needs Participant or Administrator permissions. This does not change access status.',
        ],
    },
    {
        title: 'Create and publish a Learning Session',
        icon: BookOpen,
        href: adminClassroom(),
        recording: {
            src: '/admin-guidelines-classroom.gif',
            alt: 'Screen recording showing the administrator Classroom list, the Add a classroom session dialog, and a draft title being entered.',
        },
        steps: [
            'Open Classroom from the sidebar.',
            'Choose Add Session or an action for an existing session.',
            'Save a draft while details are missing. Add the title, Season, date, description, video, and supporting materials when ready. You can add up to 10 files per session, with each file up to 10 MB.',
            'Choose Publish only after the required details are complete.',
            'Use Unpublish, Archive, or Restore to change a session later.',
        ],
    },
    {
        title: 'Manage Calendar Events and reminders',
        icon: CalendarDays,
        href: calendar(),
        recording: {
            src: '/admin-guidelines-calendar.gif',
            alt: 'Screen recording showing the Calendar, event details, and the Edit calendar event form with reminders.',
        },
        steps: [
            'Open Calendar from the sidebar and choose Add event.',
            'Enter the event title, local start and end times, and description.',
            'Choose the 3-day, 1-day, and 15-minute reminders. All three are on by default.',
            'Use the event details to edit or delete an event.',
            'Your saved timezone is used first. The browser timezone or Asia/Manila (GMT+8) is used when no saved timezone exists.',
        ],
    },
    {
        title: 'Moderate Learning Session Q&A',
        icon: CircleHelp,
        href: adminClassroom(),
        recording: {
            src: '/admin-guidelines-q-and-a.gif',
            alt: 'Screen recording showing a Learning Session Q&A tab with the question form and details field.',
        },
        steps: [
            'Open Classroom and open a Learning Session.',
            'Open the Q&A tab and read the questions and answers.',
            'Use edit or delete when content needs administrator attention.',
            'Authors can manage their own content. Administrators can manage any question or answer.',
            'Keep the feed focused on useful session discussion.',
        ],
    },
];

export default function AdminGuidelines() {
    return (
        <>
            <Head title="Admin Guidelines V0.1" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex max-w-3xl flex-col gap-3">
                    <Badge className="w-fit" variant="secondary">
                        Administration
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Admin Guidelines V0.1
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">AI-generated by:</span>{' '}
                        Alson (A.I Agent)
                    </p>
                    <p className="text-base leading-7 text-muted-foreground">
                        A short guide for the people who manage the Lead Hub
                        portal. Use it to manage access, learning content,
                        events, and session discussion.
                    </p>
                </div>

                <section aria-labelledby="description-title">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle id="description-title">
                                        Description
                                    </CardTitle>
                                    <CardDescription>
                                        What portal administrators manage
                                    </CardDescription>
                                </div>
                                <ClipboardCheck className="size-5 shrink-0 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="max-w-3xl space-y-3 text-sm leading-6">
                            <p>
                                Administrators manage the parts of Lead Hub that
                                members use every day. This includes member
                                access, member roles, Learning Sessions,
                                Calendar Events, reminders, and session Q&A.
                            </p>
                            <p className="text-muted-foreground">
                                You do not need technical skills for these
                                tasks. Use the page that matches the work, and
                                check the result before you move on.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="responsibilities-title">
                    <Card>
                        <CardHeader>
                            <CardTitle id="responsibilities-title">
                                Responsibilities
                            </CardTitle>
                            <CardDescription>
                                The main things to check as an administrator
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {responsibilities.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border bg-muted/20 p-4"
                                >
                                    <h2 className="font-medium">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="how-tos-title">
                    <div className="mb-4 flex flex-col gap-1.5">
                        <h2
                            id="how-tos-title"
                            className="text-2xl font-semibold tracking-tight"
                        >
                            How To&apos;s
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Follow these steps for the common administrator
                            tasks.
                        </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                        {howTos.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-lg bg-muted p-2">
                                                    <Icon className="size-5" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <CardTitle className="text-lg">
                                                        {item.title}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {item.title ===
                                                        'Manage members and roles'
                                                            ? 'Use the Members page.'
                                                            : item.title ===
                                                                'Create and publish a Learning Session'
                                                              ? 'Use the administrator Classroom page.'
                                                              : item.title ===
                                                                  'Manage Calendar Events and reminders'
                                                                ? 'Use the Calendar page.'
                                                                : 'Use the Q&A tab inside a Learning Session.'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                                            {item.steps.map((step) => (
                                                <li key={step}>{step}</li>
                                            ))}
                                        </ol>
                                        <figure className="mt-6 overflow-hidden rounded-xl border bg-muted/20">
                                            <a
                                                href={item.recording.src}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Open the ${item.title} workflow recording in a new tab`}
                                            >
                                                <img
                                                    src={item.recording.src}
                                                    alt={item.recording.alt}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="block h-auto w-full"
                                                />
                                            </a>
                                            <figcaption className="border-t px-4 py-3 text-xs text-muted-foreground">
                                                Real portal recording. Select
                                                the image to open it full size.
                                            </figcaption>
                                        </figure>
                                        <Button
                                            asChild
                                            className="mt-5"
                                            variant="outline"
                                        >
                                            <Link href={item.href}>
                                                Open page
                                                <ArrowRight data-icon="inline-end" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <Wrench className="size-5" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>When to ask IT</CardTitle>
                                <CardDescription>
                                    Portal administration is different from
                                    technical operations.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        <p>
                            Ask IT or the assigned technical operator about
                            deployment, servers, backups, HTTPS, email, queues,
                            schedulers, monitoring, database problems, or
                            staging access. Do not change technical settings to
                            solve a member or content problem.
                        </p>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href={dashboard()}>Back to dashboard</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

AdminGuidelines.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Admin Guidelines V0.1',
            href: adminGuidelines(),
        },
    ],
};
