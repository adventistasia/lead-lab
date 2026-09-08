import { usePage } from '@inertiajs/react';
import AppLogoImage from '@/components/app-logo-image';
import { cn } from '@/lib/utils';

export default function AppLogo({
    imageClassName,
}: {
    imageClassName?: string;
}) {
    const { name } = usePage().props;
    const logoAlt = name || 'Lead Hub';

    return (
        <div className="flex min-w-0 items-center">
            <AppLogoImage
                alt={logoAlt}
                className={cn(
                    'h-auto w-[208px] max-w-full rounded-md object-contain group-data-[collapsible=icon]:hidden',
                    imageClassName,
                )}
            />
            <span
                className="hidden size-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold tracking-tight text-primary group-data-[collapsible=icon]:flex"
                aria-hidden="true"
            >
                LH
            </span>
        </div>
    );
}
