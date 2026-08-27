import { useSyncExternalStore } from 'react';

type FullscreenSnapshot = {
    isFullscreen: boolean;
    isSupported: boolean;
};

type UseFullscreenReturn = FullscreenSnapshot & {
    toggleFullscreen: () => Promise<void>;
};

const serverSnapshot: FullscreenSnapshot = {
    isFullscreen: false,
    isSupported: false,
};

const listeners = new Set<() => void>();
let snapshot = serverSnapshot;
let stopListening: (() => void) | null = null;

function supportsFullscreen(currentDocument: Document): boolean {
    return (
        currentDocument.fullscreenEnabled &&
        typeof currentDocument.exitFullscreen === 'function' &&
        typeof currentDocument.documentElement.requestFullscreen === 'function'
    );
}

function notify(nextSnapshot: FullscreenSnapshot): void {
    if (
        snapshot.isFullscreen === nextSnapshot.isFullscreen &&
        snapshot.isSupported === nextSnapshot.isSupported
    ) {
        return;
    }

    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    if (typeof document !== 'undefined' && supportsFullscreen(document)) {
        if (stopListening === null) {
            const handleFullscreenChange = (): void => {
                notify({
                    isFullscreen: document.fullscreenElement !== null,
                    isSupported: true,
                });
            };

            snapshot = {
                isFullscreen: document.fullscreenElement !== null,
                isSupported: true,
            };
            document.addEventListener(
                'fullscreenchange',
                handleFullscreenChange,
            );
            stopListening = () => {
                document.removeEventListener(
                    'fullscreenchange',
                    handleFullscreenChange,
                );
            };
        }
    } else {
        snapshot = serverSnapshot;
    }

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && stopListening !== null) {
            stopListening();
            stopListening = null;
            snapshot = serverSnapshot;
        }
    };
}

export function useFullscreen(): UseFullscreenReturn {
    const { isFullscreen, isSupported } = useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => serverSnapshot,
    );

    const toggleFullscreen = async (): Promise<void> => {
        if (typeof document === 'undefined' || !supportsFullscreen(document)) {
            notify(serverSnapshot);

            return;
        }

        try {
            if (document.fullscreenElement !== null) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch {
            notify({ isFullscreen: false, isSupported: false });
        }
    };

    return { isFullscreen, isSupported, toggleFullscreen };
}
