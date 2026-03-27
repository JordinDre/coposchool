import type { VisibilityState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

/**
 * Hook para persistir la visibilidad de columnas en localStorage
 * Similar a Filament's persistFiltersInSession
 */
export function useTablePersistence(tableKey: string, initialVisibility?: VisibilityState, enable: boolean = true) {
    const storageKey = `table_${tableKey}_column_visibility`;

    // Obtener el estado inicial desde localStorage o usar el inicial
    const [columnVisibility, setColumnVisibilityInternal] = useState<VisibilityState>(() => {
        if (typeof window === 'undefined') return initialVisibility || {};

        // Si no está habilitada la persistencia, retornar el estado inicial
        if (!enable) {
            return initialVisibility || {};
        }

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Mezclar con initialVisibility para asegurar que columnas con permisos estén correctas
                return { ...(initialVisibility || {}), ...parsed };
            }
            return initialVisibility || {};
        } catch (error) {
            console.warn('Error loading column visibility from localStorage:', error);
            return initialVisibility || {};
        }
    });

    // Wrapper para setColumnVisibility que también guarda en localStorage
    const setColumnVisibility = useCallback(
        (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
            setColumnVisibilityInternal((prev) => {
                const newVisibility = typeof updater === 'function' ? updater(prev) : updater;

                // Guardar en localStorage solo si está habilitada la persistencia
                if (enable && typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(storageKey, JSON.stringify(newVisibility));
                    } catch (error) {
                        console.warn('Error saving column visibility to localStorage:', error);
                    }
                }

                return newVisibility;
            });
        },
        [storageKey, enable],
    );

    return {
        columnVisibility,
        setColumnVisibility,
    };
}
