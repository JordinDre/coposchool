import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Don't show if already installed or dismissed
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (localStorage.getItem('pwa-install-dismissed')) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setVisible(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6" style={{ pointerEvents: 'none' }}>
            <div
                className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                style={{ pointerEvents: 'auto' }}
            >
                {/* App icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                        />
                    </svg>
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Instalar aplicación</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Acceso rápido desde tu pantalla de inicio</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                    <button
                        onClick={handleDismiss}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        Ahora no
                    </button>
                    <button
                        onClick={handleInstall}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
}
