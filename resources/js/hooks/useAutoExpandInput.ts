import { useEffect, useRef } from 'react';

/**
 * Hook para hacer que un input o textarea se expanda automáticamente
 * según su contenido
 */
export function useAutoExpandInput<T extends HTMLInputElement | HTMLTextAreaElement>(value: string, minHeight: number = 40, maxHeight: number = 200) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            const element = ref.current;

            // Solo aplicar a textarea
            if (element instanceof HTMLTextAreaElement) {
                element.style.height = 'auto';
                const scrollHeight = element.scrollHeight;
                const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
                element.style.height = `${newHeight}px`;
                element.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
            }
        }
    }, [value, minHeight, maxHeight]);

    return ref;
}
