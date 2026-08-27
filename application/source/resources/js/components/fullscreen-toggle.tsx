import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useIsMobile } from '@/hooks/use-mobile';

export function FullscreenToggle() {
    const isMobile = useIsMobile();
    const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();

    if (!isMobile || !isSupported) {
        return null;
    }

    const label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
    const Icon = isFullscreen ? Minimize2 : Maximize2;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    aria-label={label}
                    aria-pressed={isFullscreen}
                    data-test="fullscreen-toggle"
                    title={label}
                    onClick={() => void toggleFullscreen()}
                >
                    <Icon className="size-5" />
                    <span className="sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
