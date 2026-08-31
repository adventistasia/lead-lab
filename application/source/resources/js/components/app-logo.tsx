import { usePage } from '@inertiajs/react';
import AppLogoImage from '@/components/app-logo-image';

export default function AppLogo() {
    const { name } = usePage().props;
    const logoAlt = name || 'Lead Lab';

    return (
        <div className="flex min-w-0 items-center">
            <AppLogoImage
                alt={logoAlt}
                className="h-8 w-auto max-w-full rounded-md object-contain group-data-[collapsible=icon]:hidden"
            />
            <span
                className="hidden size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white group-data-[collapsible=icon]:flex"
                aria-hidden="true"
            >
                <AppLogoImage alt="" className="h-9 w-auto max-w-none" />
            </span>
        </div>
    );
}
