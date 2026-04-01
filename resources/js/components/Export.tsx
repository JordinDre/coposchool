import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCan } from '@/hooks/use-can';
import { Download } from 'lucide-react';
import { useCallback } from 'react';

interface ExportProps {
    /**
     * Ruta base para la exportación (ej: 'ventas', 'productos', 'compras')
     */
    routeBase: string;
    /**
     * Clave de la tabla para obtener columnas visibles del localStorage
     */
    tableKey?: string;
    /**
     * Tamaño del botón
     */
    size?: 'sm' | 'lg' | 'icon' | 'default';
    /**
     * Clase adicional para el botón
     */
    className?: string;
    /**
     * Nombre del permiso para exportar (ej: 'exportar venta', 'exportar producto')
     */
    permission: string;
}

/**
 * Componente genérico para exportar datos a Excel
 * Obtiene los filtros de la URL y las columnas visibles del localStorage
 * para exportar exactamente lo que se muestra en el index
 */
export default function Export({ routeBase, tableKey, size = 'sm', className = '', permission }: ExportProps) {
    const { can } = useCan();

    const handleExport = useCallback(() => {
        // Obtener todos los parámetros de la URL actual (filtros)
        const urlParams = new URLSearchParams(window.location.search);
        const filters: Record<string, string> = {};

        // Copiar todos los parámetros de la URL excepto los de paginación
        const excludeParams = ['page', 'perPage', 'per_page', 'sortBy', 'sortDir'];
        urlParams.forEach((value, key) => {
            if (!excludeParams.includes(key) && value) {
                filters[key] = value;
            }
        });

        // Obtener columnas visibles del localStorage si se proporciona tableKey
        let visibleColumns: string[] | null = null;
        if (tableKey && typeof window !== 'undefined') {
            try {
                // Construir la clave basada en la ruta actual
                const path = window.location.pathname.replace(/\//g, '_').replace(/^_/, '');
                const storageKey = `table_${path}_column_visibility`;
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const visibility = JSON.parse(stored);
                    // Convertir el objeto de visibilidad a array de columnas visibles
                    visibleColumns = Object.entries(visibility)
                        .filter(([, isVisible]) => isVisible !== false)
                        .map(([columnId]) => columnId);
                }
            } catch (error) {
                console.warn('Error loading column visibility for export:', error);
            }
        }

        // Construir la URL de exportación (manejar rutas con subdirectorios)
        const exportUrl = routeBase.startsWith('/') ? `${routeBase}/exportar` : `/${routeBase}/exportar`;
        const queryParams = new URLSearchParams();

        // Agregar filtros
        Object.entries(filters).forEach(([key, value]) => {
            queryParams.append(key, value);
        });

        // Agregar columnas visibles si están disponibles
        if (visibleColumns && visibleColumns.length > 0) {
            queryParams.append('columnas', visibleColumns.join(','));
        }

        // Redirigir a la URL de exportación
        const fullUrl = queryParams.toString() ? `${exportUrl}?${queryParams.toString()}` : exportUrl;

        window.location.href = fullUrl;
    }, [routeBase, tableKey]);

    // Si el usuario no tiene permiso, no mostrar el botón
    if (!can(permission)) {
        return null;
    }

    return (
        <Button size={size} className={cn('bg-green-600 hover:bg-green-700 text-white', className)} onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
        </Button>
    );
}
