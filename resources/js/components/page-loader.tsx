import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export function PageLoader() {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            const visit = (event as CustomEvent).detail?.visit;
            // usePoll/router.reload() stays on the same URL with preserveState — skip those
            const isSameUrl = visit?.url?.href === window.location.href;
            if (isSameUrl && visit?.preserveState) return;
            // Small delay so fast navigations don't flash the overlay
            timerRef.current = setTimeout(() => setVisible(true), 120);
        });

        const removeFinish = router.on('finish', () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(false);
        });

        return () => {
            removeStart();
            removeFinish();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            aria-label="Cargando..."
            role="status"
        >
            <div className="flex flex-col items-center gap-3">
                {/* Spinner */}
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
}
