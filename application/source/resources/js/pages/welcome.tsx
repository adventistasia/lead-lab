import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    Building2,
    CalendarDays,
    ClipboardCheck,
    MessageSquareText,
    ShieldCheck,
    Target,
    Users,
} from 'lucide-react';
import AppLogoImage from '@/components/app-logo-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

const benefits = [
    {
        module: 'Leading Self',
        title: 'Grow personally',
        description:
            'Develop a deeper sense of leadership identity, purpose, and calling.',
        icon: BookOpenCheck,
    },
    {
        module: 'Leading with Others',
        title: 'Lead relationally',
        description:
            'Build practical skills in communication, emotional intelligence, and peer coaching.',
        icon: Users,
    },
    {
        module: 'Leading in Organizations',
        title: 'Strengthen organizations',
        description:
            'Apply innovation, strategic planning, and organizational leadership to real work.',
        icon: Building2,
    },
    {
        module: 'Leading Mission Multiplication',
        title: 'Multiply mission impact',
        description:
            'Turn learning into practical change through a Personal Leadership Project.',
        icon: Target,
    },
];

const journeyHighlights = [
    {
        value: '42 weeks',
        label: 'Minimum program length',
    },
    {
        value: '24',
        label: 'Weekly leadership sessions',
        detail: '1.5 hours each',
    },
    {
        value: '40 weeks',
        label: 'Leadership Learning Groups',
        detail: '1 hour each',
    },
    {
        value: '2 retreats',
        label: 'Face-to-face gatherings',
        detail: '3 days each',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primaryDestination = auth.user ? dashboard() : register();

    return (
        <>
            <Head title="LeadLab Growth Series" />
            <div className="min-h-screen bg-background">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <AppLogoImage
                            alt="LeadLab"
                            className="h-auto w-36 rounded-md sm:w-44"
                        />
                    </div>
                    <Badge className="hidden sm:inline-flex" variant="outline">
                        For leaders in our organization
                    </Badge>
                </header>

                <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-10 lg:px-8 lg:py-20">
                    <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="flex max-w-2xl flex-col gap-7">
                            <Badge className="w-fit" variant="secondary">
                                LeadLab Growth Series
                            </Badge>
                            <div className="flex flex-col gap-5">
                                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                    Grow as a leader. Strengthen your
                                    organization. Multiply your mission.
                                </h1>
                                <p className="max-w-xl text-base leading-8 text-muted-foreground">
                                    LeadLab is a practical leadership
                                    development journey that helps leaders grow
                                    personally, lead relationally, strengthen
                                    organizations, and multiply mission impact.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild size="lg">
                                    <Link href={primaryDestination}>
                                        {auth.user
                                            ? 'Open workspace'
                                            : 'Register'}
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                                {auth.user ? (
                                    <Button asChild size="lg" variant="outline">
                                        <a href="#benefits">Explore LeadLab</a>
                                    </Button>
                                ) : (
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    Designed for leaders in our organization.
                                    Access is limited to approved LeadLab
                                    participants.
                                </span>
                            </div>
                        </div>

                        <Card className="overflow-hidden border-border/70 shadow-xl shadow-primary/5">
                            <CardHeader className="gap-3 bg-muted/40 p-6">
                                <Badge className="w-fit" variant="outline">
                                    Four focus areas
                                </Badge>
                                <CardTitle>
                                    From self-leadership to mission impact.
                                </CardTitle>
                                <CardDescription>
                                    A connected journey that turns reflection
                                    into practical leadership growth.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 p-6">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={benefit.module}
                                        className="flex min-w-0 items-start gap-4"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <p className="text-sm font-medium">
                                                {benefit.module}
                                            </p>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {benefit.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <section
                        id="benefits"
                        className="scroll-mt-8"
                        aria-labelledby="benefits-heading"
                    >
                        <div className="mb-8 flex max-w-2xl flex-col gap-4">
                            <Badge className="w-fit" variant="outline">
                                What participants gain
                            </Badge>
                            <h2
                                id="benefits-heading"
                                className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                            >
                                Leadership growth that reaches beyond the
                                classroom.
                            </h2>
                            <p className="text-base leading-7 text-muted-foreground">
                                Through workshops, peer coaching, reflective
                                learning, strategic planning, and mentoring,
                                LeadLab helps participants turn insight into
                                lasting impact.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit) => {
                                const Icon = benefit.icon;

                                return (
                                    <Card
                                        key={benefit.module}
                                        className="border-border/70"
                                    >
                                        <CardHeader className="gap-4 p-6">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Icon className="size-5" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <CardDescription>
                                                    {benefit.module}
                                                </CardDescription>
                                                <CardTitle className="text-lg">
                                                    {benefit.title}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0">
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-3xl border bg-muted/30 p-6 sm:p-8 lg:p-10">
                        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                            <div className="flex max-w-xl flex-col gap-4">
                                <Badge className="w-fit" variant="secondary">
                                    The journey
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    Learn, reflect, and put leadership into
                                    practice.
                                </h2>
                                <p className="text-base leading-7 text-muted-foreground">
                                    LeadLab is an immersive,
                                    application-oriented experience designed to
                                    build consistent opportunities for
                                    reflection, accountability, peer coaching,
                                    and practical application.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {journeyHighlights.map((highlight, index) => (
                                    <div
                                        key={highlight.label}
                                        className="flex min-w-0 flex-col gap-2"
                                    >
                                        {index === 0 ? (
                                            <CalendarDays className="size-5 text-muted-foreground" />
                                        ) : index === 3 ? (
                                            <ClipboardCheck className="size-5 text-muted-foreground" />
                                        ) : (
                                            <MessageSquareText className="size-5 text-muted-foreground" />
                                        )}
                                        <p className="text-2xl font-semibold tracking-tight">
                                            {highlight.value}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {highlight.label}
                                        </p>
                                        {highlight.detail && (
                                            <p className="text-xs leading-5 text-muted-foreground">
                                                {highlight.detail}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-6 rounded-3xl border p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                        <div className="flex max-w-2xl flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Target className="size-5" />
                                </div>
                                <Badge variant="outline">
                                    Practical application
                                </Badge>
                            </div>
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                Turn your growth into action.
                            </h2>
                            <p className="text-base leading-7 text-muted-foreground">
                                Each participant designs, implements, and
                                presents a Personal Leadership Project that
                                applies LeadLab principles to a real leadership
                                opportunity.
                            </p>
                        </div>
                        <Button asChild size="lg" className="shrink-0">
                            <Link href={primaryDestination}>
                                {auth.user ? 'Open workspace' : 'Register'}
                                <ArrowRight data-icon="inline-end" />
                            </Link>
                        </Button>
                    </section>
                </main>
            </div>
        </>
    );
}
