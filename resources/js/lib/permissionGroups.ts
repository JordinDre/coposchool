import type { Permission } from '@/types';

export interface PermissionGroup {
    name: string;
    label: string;
    icon?: string;
    permissions: Permission[];
    requiresActivation?: boolean;
}

/**
 * Agrupa permisos por la segunda palabra (y siguientes) del nombre del permiso
 * Ejemplo: "ver compra" → grupo "compra", "listar caja movimientos" → grupo "caja movimientos"
 */
export const groupPermissionsByModule = (permissions: Permission[]): PermissionGroup[] => {
    const groups: Record<string, Permission[]> = {};

    // Mapeo de grupos con sus etiquetas e iconos (usando la segunda palabra como clave)
    const groupMap: Record<string, { label: string; icon?: string; requiresActivation?: boolean }> = {
        grafica: { label: 'Gráficas', icon: '📊' },
        stat: { label: 'Stats', icon: '📈' },
        exportar: { label: 'Exportar', icon: '📤' },
        reporte: { label: 'Reportes', icon: '📋' },
        venta: { label: 'Ventas', icon: '💰' },
        ventas: { label: 'Ventas', icon: '💰' },
        compra: { label: 'Compras', icon: '🛒' },
        compras: { label: 'Compras', icon: '🛒' },
        producto: { label: 'Productos', icon: '📦' },
        productos: { label: 'Productos', icon: '📦' },
        inventario: { label: 'Inventario', icon: '📊' },
        caja: { label: 'Cajas', icon: '💵' },
        cajas: { label: 'Cajas', icon: '💵' },
        'caja movimientos': { label: 'Cajas Movimientos', icon: '💵' },
        'cajas movimientos': { label: 'Cajas Movimientos', icon: '💵' },
        pago: { label: 'Pagos', icon: '💳' },
        pagos: { label: 'Pagos', icon: '💳' },
        gasto: { label: 'Gastos', icon: '💸', requiresActivation: true },
        gastos: { label: 'Gastos', icon: '💸', requiresActivation: true },
        usuario: { label: 'Usuarios', icon: '👥' },
        usuarios: { label: 'Usuarios', icon: '👥' },
        bodega: { label: 'Bodegas', icon: '🏢', requiresActivation: true },
        bodegas: { label: 'Bodegas', icon: '🏢', requiresActivation: true },
        traslado: { label: 'Traslados', icon: '🚚', requiresActivation: true },
        traslados: { label: 'Traslados', icon: '🚚', requiresActivation: true },
        ajuste: { label: 'Ajustes', icon: '⚖️' },
        ajustes: { label: 'Ajustes', icon: '⚖️' },
        conversion: { label: 'Conversiones', icon: '🔄', requiresActivation: true },
        conversiones: { label: 'Conversiones', icon: '🔄', requiresActivation: true },
        kardex: { label: 'Kardex', icon: '📋' },
        actividad: { label: 'Bitácora', icon: '📝' },
        tarea: { label: 'Tareas', icon: '📋' },
        tareas: { label: 'Tareas', icon: '📋' },
        'caja fondo': { label: 'Cajas Fondo', icon: '💵' },
        'cajas fondo': { label: 'Cajas Fondo', icon: '💵' },
        préstamo: { label: 'Préstamos', icon: '🤝' },
        prestamos: { label: 'Préstamos', icon: '🤝' },
        comprobante: { label: 'Comprobantes', icon: '🧾' },
        comprobantes: { label: 'Comprobantes', icon: '🧾' },
        categoria: { label: 'Categorías', icon: '🏷️' },
        categorias: { label: 'Categorías', icon: '🏷️' },
        marca: { label: 'Marcas', icon: '🏅' },
        marcas: { label: 'Marcas', icon: '🏅' },
        presentacion: { label: 'Presentaciones', icon: '📏' },
        presentaciones: { label: 'Presentaciones', icon: '📏' },
        proveedor: { label: 'Proveedores', icon: '🏭' },
        proveedores: { label: 'Proveedores', icon: '🏭' },
        banco: { label: 'Bancos', icon: '🏦' },
        bancos: { label: 'Bancos', icon: '🏦' },
        cliente: { label: 'Clientes', icon: '👤', requiresActivation: true },
        clientes: { label: 'Clientes', icon: '👤', requiresActivation: true },
        servicio: { label: 'Servicios', icon: '🔧', requiresActivation: true },
        servicios: { label: 'Servicios', icon: '🔧', requiresActivation: true },
        factura: { label: 'Facturas', icon: '🧾', requiresActivation: true },
        facturas: { label: 'Facturas', icon: '🧾', requiresActivation: true },
    };

    // Función para normalizar la clave del grupo (buscar variación singular/plural en el mapa)
    const normalizeGroupKey = (key: string): string => {
        // Si ya existe en el mapa, usarlo tal cual
        if (groupMap[key]) {
            return key;
        }

        // Si tiene múltiples palabras, intentar normalizar la primera palabra
        const keyParts = key.split(' ');
        const firstPart = keyParts[0];

        // Buscar en el mapa por variaciones de la primera palabra
        for (const [mapKey] of Object.entries(groupMap)) {
            const mapKeyParts = mapKey.split(' ');
            const mapFirstPart = mapKeyParts[0];

            // Si la primera palabra coincide exactamente o es variación singular/plural
            if (
                mapFirstPart === firstPart ||
                mapFirstPart === firstPart + 's' ||
                firstPart === mapFirstPart + 's' ||
                (firstPart.endsWith('s') && firstPart.slice(0, -1) === mapFirstPart) ||
                (mapFirstPart.endsWith('s') && mapFirstPart.slice(0, -1) === firstPart)
            ) {
                // Si hay más palabras, mantenerlas
                if (keyParts.length > 1) {
                    return mapFirstPart + ' ' + keyParts.slice(1).join(' ');
                }
                return mapKey;
            }
        }

        return key;
    };

    permissions.forEach((permission) => {
        const name = permission.name.toLowerCase();
        const parts = name.split(' ');

        // Agrupar todos los permisos de exportar juntos
        if (name.startsWith('exportar ')) {
            const exportarKey = 'exportar';
            if (!groups[exportarKey]) {
                groups[exportarKey] = [];
            }
            groups[exportarKey].push(permission);
            return;
        }

        // Agrupar todos los permisos de reportes juntos
        if (name.includes('reporte')) {
            const reporteKey = 'reporte';
            if (!groups[reporteKey]) {
                groups[reporteKey] = [];
            }
            groups[reporteKey].push(permission);
            return;
        }

        // Agrupar todos los permisos de gráficas juntos
        if (name.startsWith('grafica ')) {
            const graficaKey = 'grafica';
            if (!groups[graficaKey]) {
                groups[graficaKey] = [];
            }
            groups[graficaKey].push(permission);
            return;
        }

        // Agrupar todos los permisos de stats juntos
        if (name.startsWith('stat ')) {
            const statKey = 'stat';
            if (!groups[statKey]) {
                groups[statKey] = [];
            }
            groups[statKey].push(permission);
            return;
        }

        // Agrupar "autorizar cierre caja" con los permisos de caja
        // Mantener "caja fondo" y "caja movimiento" en sus grupos separados
        if (name === 'autorizar cierre caja') {
            const cajaKey = 'caja';
            if (!groups[cajaKey]) {
                groups[cajaKey] = [];
            }
            groups[cajaKey].push(permission);
            return;
        }

        // Obtener la segunda palabra y siguientes como grupo
        let groupKey = 'otros';
        if (parts.length > 1) {
            // Tomar desde la segunda palabra hasta el final
            groupKey = parts.slice(1).join(' ');
        }

        // Normalizar la clave del grupo para unificar singular/plural
        const normalizedKey = normalizeGroupKey(groupKey);

        if (!groups[normalizedKey]) {
            groups[normalizedKey] = [];
        }
        groups[normalizedKey].push(permission);
    });

    // Convertir a array y ordenar
    const result: PermissionGroup[] = Object.entries(groups)
        .map(([key, perms]) => {
            // Buscar etiqueta e icono en el mapa
            const groupInfo = groupMap[key];
            let label = key;
            let icon: string | undefined;
            let requiresActivation: boolean | undefined;

            if (groupInfo) {
                label = groupInfo.label;
                icon = groupInfo.icon;
                requiresActivation = groupInfo.requiresActivation;
            } else {
                // Capitalizar primera letra de cada palabra
                label = key
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }

            return {
                name: key,
                label,
                icon,
                requiresActivation,
                permissions: perms.sort((a, b) => a.name.localeCompare(b.name)),
            };
        })
        .sort((a, b) => {
            // Ordenar alfabéticamente por el label, excepto "otros" que va al final
            if (a.name === 'otros') return 1;
            if (b.name === 'otros') return -1;
            return a.label.localeCompare(b.label);
        });

    return result;
};

/**
 * Obtiene el nombre de la acción de un permiso
 */
export const getPermissionAction = (permissionName: string): string => {
    const parts = permissionName.toLowerCase().split(' ');
    return parts[0] || permissionName;
};

/**
 * Obtiene el nombre del módulo de un permiso
 */
export const getPermissionModule = (permissionName: string): string => {
    const parts = permissionName.toLowerCase().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : 'otros';
};
