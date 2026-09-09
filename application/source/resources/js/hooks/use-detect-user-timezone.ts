import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { timezone as updateTimezone } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function useDetectUserTimezone(): void {
    const { auth } = usePage<PageProps>().props;
    const attemptedTimezone = useRef<string | null>(null);

    useEffect(() => {
        if (auth.user.timezone !== null) {
            attemptedTimezone.current = null;

            return;
        }

        if (attemptedTimezone.current !== null) {
            return;
        }

        const detectedTimezone = new Intl.DateTimeFormat().resolvedOptions()
            .timeZone;

        if (!detectedTimezone) {
            return;
        }

        try {
            new Intl.DateTimeFormat(undefined, {
                timeZone: detectedTimezone,
            }).format();
        } catch {
            return;
        }

        attemptedTimezone.current = detectedTimezone;

        router.patch(
            updateTimezone.url(),
            { timezone: detectedTimezone },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onError: () => {
                    attemptedTimezone.current = null;
                },
            },
        );
    }, [auth.user.timezone]);
}
