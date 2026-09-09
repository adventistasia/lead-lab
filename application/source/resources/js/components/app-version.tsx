import { usePage } from '@inertiajs/react';

export function AppVersion() {
    const { appVersion } = usePage().props;

    return (
        <div className="truncate px-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {appVersion}
        </div>
    );
}
