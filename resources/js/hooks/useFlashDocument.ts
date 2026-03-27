import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Hook para abrir documentos PDF automáticamente desde flash messages
 * Los documentos se pasan como un array de URLs en el flash message 'documentos'
 *
 * @example
 * // En el backend:
 * ->with('documentos', [route('ventas.factura-pdf', $id)])
 * ->with('documentos', [route('ventas.factura-pdf', $id), route('ventas.comprobante', $id)])
 *
 * // En el frontend:
 * useFlashDocument(); // Abre todos los documentos disponibles
 */
export function useFlashDocument() {
    const { flash } = usePage<{ flash?: { documentos?: string[] } }>().props;
    const openedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!flash?.documentos || !Array.isArray(flash.documentos)) {
            return;
        }

        // Abrir cada documento en una nueva pestaña
        flash.documentos.forEach((url) => {
            if (url && !openedRef.current.has(url)) {
                openedRef.current.add(url);
                setTimeout(() => {
                    window.open(url, '_blank');
                }, 200);
            }
        });
    }, [flash?.documentos]);
}
