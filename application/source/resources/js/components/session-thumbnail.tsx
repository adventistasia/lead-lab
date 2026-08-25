import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type SessionThumbnailProps = {
    thumbnailUrl: string | null;
    alt?: string;
    className?: string;
};

export function SessionThumbnail({
    thumbnailUrl,
    alt = '',
    className,
}: SessionThumbnailProps) {
    return (
        <div
            className={cn(
                'relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-40',
                className,
            )}
        >
            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt={alt}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Play className="size-5" />
                </div>
            )}
        </div>
    );
}
