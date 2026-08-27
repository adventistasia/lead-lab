import { Head, router } from '@inertiajs/react';
import { ShieldCheck, UserRoundX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    access_status: 'pending' | 'active' | 'revoked';
    email_verified_at: string | null;
    created_at: string | null;
};

export default function AdminMembers({
    members,
    emailVerificationRequired,
}: {
    members: Member[];
    emailVerificationRequired: boolean;
}) {
    const updateAccess = (member: Member, status: 'active' | 'revoked') => {
        router.patch(
            `/admin/members/${member.id}/status`,
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Manage members" />
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
                                    Application-managed accounts for the MVP.
                                </CardDescription>
                            </div>
                            <ShieldCheck className="size-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
                            >
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <p className="font-medium">{member.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {member.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {member.role} · joined{' '}
                                        {member.created_at}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {member.email_verified_at
                                            ? 'Email verified'
                                            : 'Email not verified'}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        member.access_status === 'revoked'
                                            ? 'destructive'
                                            : member.access_status === 'pending'
                                              ? 'outline'
                                              : 'secondary'
                                    }
                                >
                                    {member.access_status === 'pending'
                                        ? 'Pending'
                                        : member.access_status === 'active'
                                          ? 'Active'
                                          : 'Revoked'}
                                </Badge>
                                {member.access_status === 'pending' ? (
                                    !emailVerificationRequired ||
                                    member.email_verified_at ? (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() =>
                                                updateAccess(member, 'active')
                                            }
                                        >
                                            Approve access
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Waiting for email verification
                                        </span>
                                    )
                                ) : (
                                    <Button
                                        variant={
                                            member.access_status === 'active'
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
                                        {member.access_status === 'active'
                                            ? 'Revoke access'
                                            : 'Restore access'}
                                    </Button>
                                )}
                            </div>
                        ))}
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
            href: '/admin/members',
        },
    ],
};
