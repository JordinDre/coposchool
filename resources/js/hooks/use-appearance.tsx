import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const getMediaQuery = () => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)');
    }
    return null;
};

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', e.matches);
    }
};

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = (mode: Appearance) => {
        if (typeof window === 'undefined') return;

        setAppearance(mode);
        localStorage.setItem('copo-theme', mode);

        const mq = getMediaQuery();

        if (mode !== 'system') {
            document.documentElement.classList.toggle('dark', mode === 'dark');
            mq?.removeEventListener('change', handleSystemThemeChange);
            return;
        }

        if (mq) {
            document.documentElement.classList.toggle('dark', mq.matches);
            mq.addEventListener('change', handleSystemThemeChange);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedAppearance = localStorage.getItem('copo-theme') as Appearance;
        updateAppearance(savedAppearance || 'light');

        const mq = getMediaQuery();
        return () => mq?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}

export function initializeTheme() {
    if (typeof window === 'undefined') return;

    const savedAppearance = (localStorage.getItem('copo-theme') as Appearance) || 'light';
    const mq = getMediaQuery();

    if (savedAppearance === 'system') {
        if (mq) {
            document.documentElement.classList.toggle('dark', mq.matches);
            mq.addEventListener('change', handleSystemThemeChange);
        }
        return;
    }

    document.documentElement.classList.toggle('dark', savedAppearance === 'dark');
}
