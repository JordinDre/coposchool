import { useEffect, useState } from 'react';

const STORAGE_KEY = 'copo-simple-mode';
const EVENT_NAME = 'copo:simple-mode-change';

function readFromStorage(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
}

function applyToDOM(enabled: boolean) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('simple-mode', enabled);
}

export function useSimpleMode() {
    const [simpleMode, setSimpleMode] = useState<boolean>(() => readFromStorage());

    const updateSimpleMode = (enabled: boolean) => {
        localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
        applyToDOM(enabled);
        setSimpleMode(enabled);
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enabled }));
    };

    const toggleSimpleMode = () => updateSimpleMode(!simpleMode);

    // Sincronizar con cambios externos
    useEffect(() => {
        const handler = (e: Event) => {
            setSimpleMode((e as CustomEvent<boolean>).detail);
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    // Aplicar clase al DOM al montar
    useEffect(() => {
        applyToDOM(simpleMode);
    }, [simpleMode]);

    return { simpleMode, toggleSimpleMode, updateSimpleMode };
}

export function initializeSimpleMode() {
    applyToDOM(readFromStorage());
}
