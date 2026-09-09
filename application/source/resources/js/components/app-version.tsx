import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function AppVersion({ className }: { className?: string }) {
    const { appVersion } = usePage().props;

    return (
        <div
            className={cn('truncate text-xs text-muted-foreground', className)}
        >
            {appVersion}
        </div>
    );
}
