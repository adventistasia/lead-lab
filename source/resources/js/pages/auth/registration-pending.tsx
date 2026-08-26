import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';
import { notice } from '@/routes/verification';

export default function RegistrationPending({
    emailVerified,
    emailVerificationRequired,
}: {
    emailVerified: boolean;
    emailVerificationRequired: boolean;
}) {
    return (
        <>
            <Head title="Registration pending" />

            <div className="flex flex-col gap-6 text-center">
                <div className="flex flex-col gap-2">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {!emailVerificationRequired
                            ? 'Your registration is waiting for administrator approval.'
                            : emailVerified
                              ? 'Your email is verified. An administrator must approve your Lead Lab access before you can enter the workspace.'
                              : 'Verify your email address first. An administrator can approve your Lead Lab access after verification.'}
                    </p>
                </div>

                {emailVerificationRequired && !emailVerified && (
                    <TextLink href={notice()} className="text-sm">
                        Open email verification
                    </TextLink>
                )}

                <Form {...logout.form()}>
                    <Button type="submit" variant="outline" className="w-full">
                        Log out
                    </Button>
                </Form>
            </div>
        </>
    );
}

RegistrationPending.layout = {
    title: 'Registration pending',
    description: 'Your access is waiting for administrator approval.',
};
