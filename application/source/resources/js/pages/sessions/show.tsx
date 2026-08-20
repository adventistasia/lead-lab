import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { YouTubePlayer } from '@/components/youtube-player';
import { dashboard } from '@/routes';

type SessionResource = {
    id: number;
    title: string;
    size: number | null;
    download_url: string;
};

type Session = {
    id: number;
    title: string;
    category: string;
    session_date: string;
    description: string;
    video_embed_url: string | null;
    resources: SessionResource[];
};

export default function SessionShow({ session }: { session: Session }) {
    return (
        <>
            <Head title={session.title} />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={dashboard()}>
                        <ArrowLeft data-icon="inline-start" />
                        Back to home
                    </Link>
                </Button>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{session.category}</Badge>
                        <Badge variant="outline">{session.session_date}</Badge>
                    </div>
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                        {session.title}
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        {session.description}
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>Session recording</CardTitle>
                            <CardDescription>
                                Playback is available to active Lead Lab
                                participants.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {session.video_embed_url ? (
                                <YouTubePlayer
                                    embedUrl={session.video_embed_url}
                                    title={session.title}
                                />
                            ) : (
                                <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl bg-muted text-center">
                                    <Play className="size-6 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No recording has been attached yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session materials</CardTitle>
                            <CardDescription>
                                Protected files are served through an
                                authenticated download route.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {session.resources.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No materials attached.
                                </p>
                            ) : (
                                session.resources.map((resource) => (
                                    <div
                                        key={resource.id}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <FileText className="size-5 shrink-0 text-muted-foreground" />
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="truncate text-sm font-medium">
                                                {resource.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {resource.size
                                                    ? `${Math.ceil(resource.size / 1024)} KB`
                                                    : 'Protected resource'}
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="outline"
                                        >
                                            <a
                                                href={resource.download_url}
                                                aria-label={`Download ${resource.title}`}
                                            >
                                                <Download data-icon="inline-start" />
                                            </a>
                                        </Button>
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

SessionShow.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Session',
            href: '#',
        },
    ],
};
