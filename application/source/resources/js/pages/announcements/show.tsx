import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as announcementsRoute } from '@/routes/announcements';

type Announcement = {
    id: number;
    title: string;
    summary: string;
    body_html: string;
    is_pinned: boolean;
    published_at_label: string | null;
};

export default function AnnouncementShow({
    announcement,
    timezone_label,
}: {
    announcement: Announcement;
    timezone_label: string;
}) {
    return (
        <>
            <Head title={announcement.title} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <Link
                    href={announcementsRoute()}
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    All announcements
                </Link>
                <Card className="mx-auto w-full max-w-4xl">
                    <CardHeader className="gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {announcement.is_pinned ? (
                                <Badge variant="default">
                                    <Pin data-icon="inline-start" />
                                    Pinned
                                </Badge>
                            ) : null}
                            <Badge variant="secondary">Announcement</Badge>
                        </div>
                        <CardTitle className="text-3xl leading-tight md:text-4xl">
                            {announcement.title}
                        </CardTitle>
                        <CardDescription>
                            {announcement.published_at_label} · {timezone_label}
                        </CardDescription>
                        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                            {announcement.summary}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="announcement-content"
                            dangerouslySetInnerHTML={{
                                __html: announcement.body_html,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnnouncementShow.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Announcements',
            href: announcementsRoute(),
        },
        {
            title: 'Announcement',
            href: announcementsRoute(),
        },
    ],
};
