import type { ImgHTMLAttributes } from 'react';

type AppLogoImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export default function AppLogoImage({
    alt = 'Lead Lab',
    ...props
}: AppLogoImageProps) {
    return <img src="/leadlab-logo.webp" alt={alt} {...props} />;
}
