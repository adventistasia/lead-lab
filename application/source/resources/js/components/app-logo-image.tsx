import type { ImgHTMLAttributes } from 'react';

type AppLogoImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export default function AppLogoImage({
    alt = 'Lead Hub',
    ...props
}: AppLogoImageProps) {
    return <img src="/lead-hub-logo.png" alt={alt} {...props} />;
}
