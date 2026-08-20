import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';

type YouTubePlayer = {
    destroy: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    mute: () => void;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    unMute: () => void;
};

type YouTubePlayerEvent = {
    data: number;
    target: YouTubePlayer;
};

type YouTubePlayerOptions = {
    events: {
        onReady: (event: YouTubePlayerEvent) => void;
        onStateChange: (event: YouTubePlayerEvent) => void;
    };
};

type YouTubeApi = {
    Player: new (
        element: HTMLIFrameElement,
        options: YouTubePlayerOptions,
    ) => YouTubePlayer;
};

declare global {
    interface Window {
        YT?: YouTubeApi;
        onYouTubeIframeAPIReady?: () => void;
    }
}

const YOUTUBE_API_SOURCE = 'https://www.youtube.com/iframe_api';

function loadYouTubeApi(onReady: () => void): () => void {
    if (window.YT?.Player) {
        onReady();

        return () => undefined;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    const ready = () => {
        previousReady?.();
        onReady();
    };

    window.onYouTubeIframeAPIReady = ready;

    if (!document.querySelector(`script[src="${YOUTUBE_API_SOURCE}"]`)) {
        const script = document.createElement('script');
        script.src = YOUTUBE_API_SOURCE;
        script.async = true;
        document.head.appendChild(script);
    }

    return () => {
        if (window.onYouTubeIframeAPIReady === ready) {
            window.onYouTubeIframeAPIReady = previousReady;
        }
    };
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${remainder}`;
}

export function YouTubePlayer({
    embedUrl,
    title,
}: {
    embedUrl: string;
    title: string;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const initializePlayer = () => {
            if (
                cancelled ||
                !iframeRef.current ||
                !window.YT?.Player ||
                playerRef.current
            ) {
                return;
            }

            playerRef.current = new window.YT.Player(iframeRef.current, {
                events: {
                    onReady: (event) => {
                        if (cancelled) {
                            return;
                        }

                        setDuration(event.target.getDuration());
                        setIsReady(true);
                    },
                    onStateChange: (event) => {
                        if (cancelled) {
                            return;
                        }

                        setIsPlaying(event.data === 1);

                        if (event.data === 0) {
                            setCurrentTime(event.target.getDuration());
                        }
                    },
                },
            });
        };

        const removeReadyHandler = loadYouTubeApi(initializePlayer);

        return () => {
            cancelled = true;
            removeReadyHandler();
            playerRef.current?.destroy();
            playerRef.current = null;
            setIsReady(false);
            setIsPlaying(false);
        };
    }, [embedUrl]);

    useEffect(() => {
        if (!isReady) {
            return;
        }

        const interval = window.setInterval(() => {
            const player = playerRef.current;

            if (!player) {
                return;
            }

            setCurrentTime(player.getCurrentTime());
            setDuration(player.getDuration());
        }, 500);

        return () => window.clearInterval(interval);
    }, [isReady]);

    const togglePlayback = () => {
        if (!playerRef.current) {
            return;
        }

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) {
            return;
        }

        if (isMuted) {
            playerRef.current.unMute();
        } else {
            playerRef.current.mute();
        }

        setIsMuted(!isMuted);
    };

    const seek = (event: ChangeEvent<HTMLInputElement>) => {
        const nextTime = Number(event.currentTarget.value);

        setCurrentTime(nextTime);
        playerRef.current?.seekTo(nextTime, true);
    };

    const safeCurrentTime = Math.min(currentTime, duration || currentTime);

    return (
        <div className="overflow-hidden rounded-xl bg-muted">
            <iframe
                ref={iframeRef}
                className="aspect-video w-full border-0"
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="flex flex-col gap-3 border-t bg-card p-3">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={
                            isPlaying ? 'Pause recording' : 'Play recording'
                        }
                        disabled={!isReady}
                        onClick={togglePlayback}
                    >
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <input
                        className="h-2 min-w-0 flex-1 accent-primary"
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={1}
                        value={safeCurrentTime}
                        aria-label="Seek recording"
                        disabled={!isReady || duration <= 0}
                        onChange={seek}
                    />
                    <span className="min-w-20 text-right text-xs text-muted-foreground">
                        {formatTime(safeCurrentTime)} / {formatTime(duration)}
                    </span>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={
                            isMuted ? 'Unmute recording' : 'Mute recording'
                        }
                        disabled={!isReady}
                        onClick={toggleMute}
                    >
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                </div>
                {!isReady && (
                    <p className="text-xs text-muted-foreground" role="status">
                        Loading playback controls...
                    </p>
                )}
            </div>
        </div>
    );
}
