import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    CalendarDays,
    MessageSquareText,
    ShieldCheck,
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
import { Separator } from '@/components/ui/separator';
import { dashboard, login } from '@/routes';

const features = [
    {
        title: 'Learn together',
        description:
            'Keep sessions, practical lessons, and supporting material in one place.',
        icon: BookOpenCheck,
    },
    {
        title: 'Stay in motion',
        description:
            'See the next event, your current rhythm, and the actions worth doing next.',
        icon: CalendarDays,
    },
    {
        title: 'Share the work',
        description:
            'Ask questions, share wins, and learn from the Lead Lab cohort.',
        icon: MessageSquareText,
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const destination = auth.user ? dashboard() : login();

    return (
        <>
            <Head title="Lead Lab" />
            <div className="min-h-screen bg-background">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <BookOpenCheck className="size-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">
                                Lead Lab
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Learning community
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline">Private cohort workspace</Badge>
                </header>

                <main className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
                    <section className="flex max-w-2xl flex-col gap-7">
                        <Badge className="w-fit" variant="secondary">
                            Lead Lab 2026
                        </Badge>
                        <div className="flex flex-col gap-5">
                            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                Build the lead system you can keep.
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                                A private place for Lead Lab sessions, practical
                                resources, live events, and the conversations
                                that help the work move forward.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href={destination}>
                                    {auth.user
                                        ? 'Open workspace'
                                        : 'Sign in to workspace'}
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <a href="#about">See how it works</a>
                            </Button>
                        </div>
                        {!auth.user && (
                            <p className="text-sm text-muted-foreground">
                                New to Lead Lab?{' '}
                                <Link
                                    href="/register"
                                    className="font-medium text-foreground underline underline-offset-4"
                                >
                                    Request access
                                </Link>
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="size-4" />
                            <span>
                                Access is limited to approved Lead Lab
                                participants.
                            </span>
                        </div>
                    </section>

                    <Card className="overflow-hidden border-border/70 shadow-xl shadow-primary/5">
                        <CardHeader className="gap-4 bg-muted/40 p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <CardTitle>Your next useful step</CardTitle>
                                    <CardDescription>
                                        A focused view of the work ahead.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">Prototype</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <BookOpenCheck className="size-5" />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <p className="font-medium">
                                        Build your weekly lead engine
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Continue the session and turn one idea
                                        into a repeatable action.
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div
                                id="about"
                                className="grid gap-4 sm:grid-cols-3"
                            >
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="flex flex-col gap-2"
                                    >
                                        <feature.icon className="size-5 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {feature.title}
                                        </p>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
