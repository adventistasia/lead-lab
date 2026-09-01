import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    UserRoundX,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    index as membersRoute,
    role as updateMemberRole,
    status as updateMemberStatus,
} from '@/routes/admin/members';

type MemberStatus = 'pending' | 'active' | 'revoked';
type MemberRole = 'admin' | 'participant';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    access_status: MemberStatus;
    email_verified_at: string | null;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type MembersPage = {
    data: Member[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

const statusOptions: Array<{
    value: MemberStatus | 'all';
    label: string;
}> = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'revoked', label: 'Revoked' },
];

const statusLabel = (status: MemberStatus): string =>
    statusOptions.find((option) => option.value === status)?.label ?? status;

const roleOptions: Array<{
    value: MemberRole;
    label: string;
}> = [
    { value: 'participant', label: 'Participant' },
    { value: 'admin', label: 'Administrator' },
];

const roleLabel = (role: string): string =>
    roleOptions.find((option) => option.value === role)?.label ?? role;

const isManageableRole = (role: string): role is MemberRole =>
    role === 'admin' || role === 'participant';

export default function AdminMembers({
    members,
    filters,
    emailVerificationRequired,
}: {
    members: MembersPage;
    filters: {
        search: string;
        status: MemberStatus | null;
    };
    emailVerificationRequired: boolean;
}) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState<MemberStatus | 'all'>(
        filters.status ?? 'all',
    );
    const [selectedRoleMember, setSelectedRoleMember] = useState<Member | null>(
        null,
    );
    const roleForm = useForm<{ role: MemberRole }>({
        role: 'participant',
    });

    const updateAccess = (member: Member, status: 'active' | 'revoked') => {
        router.patch(
            updateMemberStatus.url(member.id),
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    const openRoleDialog = (member: Member) => {
        if (!isManageableRole(member.role)) {
            return;
        }

        setSelectedRoleMember(member);
        roleForm.setData('role', member.role);
        roleForm.clearErrors();
    };

    const handleRoleDialogOpenChange = (open: boolean) => {
        if (!open && roleForm.processing) {
            return;
        }

        if (!open) {
            setSelectedRoleMember(null);
            roleForm.resetAndClearErrors();
        }
    };

    const submitRoleChange = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedRoleMember === null) {
            return;
        }

        roleForm.patch(updateMemberRole.url(selectedRoleMember.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedRoleMember(null);
                roleForm.resetAndClearErrors();
            },
        });
    };

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params: Record<string, string> = {};

        if (search.trim() !== '') {
            params.search = search.trim();
        }

        if (status !== 'all') {
            params.status = status;
        }

        router.get(membersRoute.url(), params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');

        router.get(
            membersRoute.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const hasFilters = search.trim() !== '' || status !== 'all';
    const hasAppliedFilters = filters.search !== '' || filters.status !== null;

    return (
        <>
            <Head title="Manage members" />
            <Dialog
                open={selectedRoleMember !== null}
                onOpenChange={handleRoleDialogOpenChange}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change member role</DialogTitle>
                        <DialogDescription>
                            {selectedRoleMember
                                ? `Choose a role for ${selectedRoleMember.name}. This changes administrative permissions only.`
                                : null}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-6"
                        onSubmit={submitRoleChange}
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="member-role">Role</Label>
                            <Select
                                value={roleForm.data.role}
                                onValueChange={(value) =>
                                    roleForm.setData(
                                        'role',
                                        value as MemberRole,
                                    )
                                }
                                disabled={roleForm.processing}
                            >
                                <SelectTrigger
                                    id="member-role"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {roleForm.errors.role ? (
                                <p className="text-sm text-destructive">
                                    {roleForm.errors.role}
                                </p>
                            ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Changing the role does not approve, restore, or
                            revoke access. Pending and revoked members remain
                            unable to enter the workspace.
                        </p>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={roleForm.processing}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={
                                    roleForm.processing ||
                                    selectedRoleMember === null ||
                                    roleForm.data.role ===
                                        selectedRoleMember?.role
                                }
                            >
                                {roleForm.processing
                                    ? 'Saving...'
                                    : 'Save role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit" variant="secondary">
                        Administration
                    </Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Member access
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Review registrations and manage access without changing
                        the content itself. Pending and revoked members cannot
                        enter the workspace.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Lead Lab members</CardTitle>
                                <CardDescription>
                                    {members.total}{' '}
                                    {members.total === 1 ? 'member' : 'members'}
                                    {filters.search
                                        ? ` matching "${filters.search}"`
                                        : ''}
                                    {filters.status
                                        ? ` with ${statusLabel(filters.status).toLowerCase()} access`
                                        : ' in the workspace'}
                                </CardDescription>
                            </div>
                            <ShieldCheck className="size-5 text-muted-foreground" />
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
                                    Filter members
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)]">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="member-search">
                                        Search
                                    </Label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="member-search"
                                            className="pl-9"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Name or email"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="member-status">
                                        Account status
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value as MemberStatus | 'all',
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="member-status"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
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
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit">Apply filter</Button>
                                {hasFilters || hasAppliedFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                ) : null}
                            </div>
                        </form>

                        {members.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
                                <p className="font-medium">
                                    {filters.search || filters.status
                                        ? `No members${filters.search ? ` matching "${filters.search}"` : ''}${filters.status ? ` with ${statusLabel(filters.status).toLowerCase()} access` : ''} found`
                                        : 'No members found'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {filters.search || filters.status
                                        ? 'Try another name, email, or account status.'
                                        : 'Registered accounts will appear here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {members.data.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="font-medium">
                                                {member.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {roleLabel(member.role)} ·
                                                joined {member.created_at}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {member.email_verified_at
                                                    ? 'Email verified'
                                                    : 'Email not verified'}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                member.access_status ===
                                                'revoked'
                                                    ? 'destructive'
                                                    : member.access_status ===
                                                        'pending'
                                                      ? 'outline'
                                                      : 'secondary'
                                            }
                                        >
                                            {statusLabel(member.access_status)}
                                        </Badge>
                                        {member.access_status === 'pending' ? (
                                            !emailVerificationRequired ||
                                            member.email_verified_at ? (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() =>
                                                        updateAccess(
                                                            member,
                                                            'active',
                                                        )
                                                    }
                                                >
                                                    Approve access
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Waiting for email
                                                    verification
                                                </span>
                                            )
                                        ) : (
                                            <Button
                                                variant={
                                                    member.access_status ===
                                                    'active'
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    updateAccess(
                                                        member,
                                                        member.access_status ===
                                                            'active'
                                                            ? 'revoked'
                                                            : 'active',
                                                    )
                                                }
                                            >
                                                <UserRoundX data-icon="inline-start" />
                                                {member.access_status ===
                                                'active'
                                                    ? 'Revoke access'
                                                    : 'Restore access'}
                                            </Button>
                                        )}
                                        {isManageableRole(member.role) ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openRoleDialog(member)
                                                }
                                            >
                                                Change role
                                            </Button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}

                        {members.last_page > 1 ? (
                            <nav
                                className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
                                aria-label="Member pagination"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Showing {members.from} to {members.to} of{' '}
                                    {members.total} members
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {members.prev_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={members.prev_page_url}
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
                                        {members.links
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
                                    {members.next_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={members.next_page_url}
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

AdminMembers.layout = {
    breadcrumbs: [
        {
            title: 'Home',
            href: dashboard(),
        },
        {
            title: 'Manage members',
            href: membersRoute(),
        },
    ],
};
