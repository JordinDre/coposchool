import { setGlobalSimboloMoneda } from '@/lib/utils';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Hook para actualizar el símbolo de moneda global basado en la configuración
 * Este hook debe ser usado en un componente que se monte en todas las páginas
 */
export function useCurrencySymbol(): void {
    const { configuracion } = usePage<PageProps>().props;

    useEffect(() => {
        if (configuracion?.simboloMoneda) {
            setGlobalSimboloMoneda(configuracion.simboloMoneda);
        } else {
            // Usar 'Q' como valor por defecto (Quetzal guatemalteco)
            setGlobalSimboloMoneda('Q');
        }
    }, [configuracion?.simboloMoneda]);
}
