import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    SlidersHorizontal,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { index as activityLogsRoute } from '@/routes/admin/activity-logs';

type ActivityLog = {
    id: number;
    action_label: string;
    actor: {
        name: string;
        email: string;
    } | null;
    subject: {
        label: string;
        type: string | null;
        id: number | string | null;
        available: boolean;
    };
    details: Record<string, string>;
    occurred_at_label: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ActivityLogPage = {
    data: ActivityLog[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type ActionOption = {
    value: string;
    label: string;
};

export default function AdminActivityLogs({
    logs,
    actions,
    filters,
    timezone_label,
}: {
    logs: ActivityLogPage;
    actions: ActionOption[];
    filters: {
        action: string | null;
        date_from: string | null;
        date_to: string | null;
    };
    timezone_label: string;
}) {
    const [action, setAction] = useState(filters.action ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params: Record<string, string> = {};

        if (action !== '') {
            params.action = action;
        }

        if (dateFrom !== '') {
            params.date_from = dateFrom;
        }

        if (dateTo !== '') {
            params.date_to = dateTo;
        }

        router.get(activityLogsRoute.url(), params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setAction('');
        setDateFrom('');
        setDateTo('');
        router.get(
            activityLogsRoute.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const hasFilters = action !== '' || dateFrom !== '' || dateTo !== '';
    const hasAppliedFilters =
        filters.action !== null ||
        filters.date_from !== null ||
        filters.date_to !== null;

    return (
        <>
            <Head title="Activity log" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit" variant="secondary">
                        Administration
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Activity log
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Review recorded administrative activity. This page is
                        read-only and shows only approved event details.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Administrative activity</CardTitle>
                                <CardDescription>
                                    {logs.total}{' '}
                                    {logs.total === 1 ? 'entry' : 'entries'}
                                    {' · '}
                                    Times shown in {timezone_label}.
                                </CardDescription>
                            </div>
                            <ClipboardList className="size-5 shrink-0 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <form
                            className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
                            onSubmit={applyFilters}
                        >
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="size-4 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    Filter activity
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="activity-action">
                                        Action
                                    </Label>
                                    <Select
                                        value={action || 'all'}
                                        onValueChange={(value) =>
                                            setAction(
                                                value === 'all' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="activity-action"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="All actions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All actions
                                            </SelectItem>
                                            {actions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="activity-date-from">
                                        From date
                                    </Label>
                                    <Input
                                        id="activity-date-from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="activity-date-to">
                                        To date
                                    </Label>
                                    <Input
                                        id="activity-date-to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) =>
                                            setDateTo(event.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit">Apply filter</Button>
                                {hasFilters || hasAppliedFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                ) : null}
                            </div>
                        </form>

                        {logs.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
                                <p className="font-medium">
                                    No activity found.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Try a wider date range or a different
                                    action.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[760px] text-left text-sm">
                                        <caption className="sr-only">
                                            Administrative activity log
                                        </caption>
                                        <thead>
                                            <tr className="border-b text-muted-foreground">
                                                <th
                                                    className="px-3 py-3 font-medium"
                                                    scope="col"
                                                >
                                                    When
                                                </th>
                                                <th
                                                    className="px-3 py-3 font-medium"
                                                    scope="col"
                                                >
                                                    Actor
                                                </th>
                                                <th
                                                    className="px-3 py-3 font-medium"
                                                    scope="col"
                                                >
                                                    Action
                                                </th>
                                                <th
                                                    className="px-3 py-3 font-medium"
                                                    scope="col"
                                                >
                                                    Affected record
                                                </th>
                                                <th
                                                    className="px-3 py-3 font-medium"
                                                    scope="col"
                                                >
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.data.map((log) => (
                                                <tr
                                                    key={log.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-4 align-top whitespace-nowrap">
                                                        {log.occurred_at_label}
                                                    </td>
                                                    <td className="px-3 py-4 align-top">
                                                        <div className="font-medium">
                                                            {log.actor?.name ??
                                                                'Actor record unavailable'}
                                                        </div>
                                                        {log.actor?.email ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    log.actor
                                                                        .email
                                                                }
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-4 align-top font-medium">
                                                        {log.action_label}
                                                    </td>
                                                    <td className="px-3 py-4 align-top">
                                                        <div>
                                                            {log.subject.label}
                                                        </div>
                                                        {log.subject.type ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    log.subject
                                                                        .type
                                                                }
                                                                {log.subject
                                                                    .id !== null
                                                                    ? ` #${log.subject.id}`
                                                                    : ''}
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-4 align-top text-muted-foreground">
                                                        <Details
                                                            details={
                                                                log.details
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col gap-3 md:hidden">
                                    {logs.data.map((log) => (
                                        <article
                                            key={log.id}
                                            className="flex flex-col gap-3 rounded-lg border p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {log.action_label}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.occurred_at_label}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {log.subject.type ??
                                                        'Record'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm">
                                                <p>{log.subject.label}</p>
                                                <p className="text-muted-foreground">
                                                    {log.actor?.name ??
                                                        'Actor record unavailable'}
                                                    {log.actor?.email
                                                        ? ` · ${log.actor.email}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <Details details={log.details} />
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        {logs.last_page > 1 ? (
                            <nav
                                className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
                                aria-label="Activity log pagination"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Showing {logs.from} to {logs.to} of{' '}
                                    {logs.total} entries
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {logs.prev_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={logs.prev_page_url}
                                                preserveScroll
                                            >
                                                <ChevronLeft data-icon="inline-start" />
                                                Previous
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            <ChevronLeft data-icon="inline-start" />
                                            Previous
                                        </Button>
                                    )}
                                    <div className="flex flex-wrap items-center gap-1">
                                        {logs.links
                                            .filter(
                                                ({ label }) =>
                                                    !label.includes(
                                                        'Previous',
                                                    ) &&
                                                    !label.includes('Next'),
                                            )
                                            .map((link, index) =>
                                                link.url ? (
                                                    <Button
                                                        key={`${link.label}-${index}`}
                                                        asChild
                                                        variant={
                                                            link.active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={link.url}
                                                            preserveScroll
                                                            aria-label={`Go to page ${link.label}`}
                                                            aria-current={
                                                                link.active
                                                                    ? 'page'
                                                                    : undefined
                                                            }
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <span
                                                        key={`${link.label}-${index}`}
                                                        className="flex size-9 items-center justify-center text-sm text-muted-foreground"
                                                        aria-hidden="true"
                                                    >
                                                        {link.label}
                                                    </span>
                                                ),
                                            )}
                                    </div>
                                    {logs.next_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={logs.next_page_url}
                                                preserveScroll
                                            >
                                                Next
                                                <ChevronRight data-icon="inline-end" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Next
                                            <ChevronRight data-icon="inline-end" />
                                        </Button>
                                    )}
                                </div>
                            </nav>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Details({ details }: { details: Record<string, string> }) {
    const entries = Object.entries(details);

    if (entries.length === 0) {
        return <span>None</span>;
    }

    return (
        <dl className="flex flex-col gap-1">
            {entries.map(([label, value]) => (
                <div key={label}>
                    <dt className="inline font-medium text-foreground">
                        {label}:{' '}
                    </dt>
                    <dd className="inline">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

AdminActivityLogs.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Activity Log',
            href: activityLogsRoute(),
        },
    ],
};
