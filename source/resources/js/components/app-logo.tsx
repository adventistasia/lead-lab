import { usePage } from '@inertiajs/react';
import { BookOpenCheck } from 'lucide-react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpenCheck className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-semibold">
                    {name || 'Lead Lab'}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/60">
                    Learning community
                </span>
            </div>
        </>
    );
}
