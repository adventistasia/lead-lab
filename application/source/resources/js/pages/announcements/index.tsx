import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Megaphone, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as announcementsRoute, show } from '@/routes/announcements';

type Announcement = {
    id: number;
    title: string;
    summary: string;
    is_pinned: boolean;
    published_at_label: string | null;
    timezone_label: string;
    url: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type AnnouncementsPage = {
    data: Announcement[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export default function Announcements({
    announcements,
}: {
    announcements: AnnouncementsPage;
}) {
    return (
        <>
            <Head title="Announcements" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-3">
                    <Badge className="w-fit" variant="secondary">
                        Lead Hub updates
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Announcements
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Important updates from the Lead Hub team, collected in
                        one place.
                    </p>
                </div>

                {announcements.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <Megaphone className="size-8 text-muted-foreground" />
                            <p className="font-medium">No announcements yet</p>
                            <p className="max-w-md text-sm text-muted-foreground">
                                New updates will appear here after they are
                                published.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-4">
                        {announcements.data.map((announcement) => (
                            <Card key={announcement.id}>
                                <CardHeader>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {announcement.is_pinned ? (
                                            <Badge variant="default">
                                                <Pin data-icon="inline-start" />
                                                Pinned
                                            </Badge>
                                        ) : null}
                                        <CardTitle>
                                            {announcement.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        {announcement.published_at_label} ·{' '}
                                        {announcement.timezone_label}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <p className="leading-7 text-muted-foreground">
                                        {announcement.summary}
                                    </p>
                                    <Link
                                        href={show(announcement.id)}
                                        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-brand-green-dark hover:underline dark:text-brand-yellow"
                                    >
                                        Read announcement
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {announcements.last_page > 1 ? (
                    <nav
                        className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                        aria-label="Announcement pagination"
                    >
                        <p className="text-sm text-muted-foreground">
                            Showing {announcements.from} to {announcements.to}{' '}
                            of {announcements.total} announcements
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            {announcements.links.map((link, index) =>
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
            </div>
        </>
    );
}

Announcements.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Announcements',
            href: announcementsRoute(),
        },
    ],
};
