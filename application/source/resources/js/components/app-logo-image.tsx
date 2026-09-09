import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AppLogoImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export default function AppLogoImage({
    alt = 'Lead Hub',
    className,
    ...props
}: AppLogoImageProps) {
    return (
        <>
            <img
                src="/lead-hub-logo.png"
                alt={alt}
                className={cn(className, 'dark:hidden')}
                {...props}
            />
            <img
                src="/lead-hub-logo-dark.png"
                alt={alt}
                className={cn(className, 'hidden dark:block')}
                {...props}
            />
        </>
    );
}
