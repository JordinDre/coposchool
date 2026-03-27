import { buildAbility } from '@/lib/permission';
import type { AuthData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

interface CajaInfo {
    id: number;
    codigo: string;
    bodega_id: number;
    bodega_nombre: string | null;
    saldo_inicial: number;
    apertura_at: string;
    user_id: number;
}

interface PageProps {
    auth: AuthData;
    caja?: {
        activa: CajaInfo | null;
        tiene_caja_abierta: boolean;
        es_propietario_caja: boolean;
    };
    [key: string]: unknown;
}

export function useCan() {
    const page = usePage<PageProps>();

    return useMemo(() => {
        const allPermissions = page.props.auth.permissions || [];
        return buildAbility(allPermissions);
    }, [page.props.auth.permissions]);
}

/**
 * Hook para obtener información de caja cuando esté disponible
 */
export function useCaja() {
    const page = usePage<PageProps>();

    return (
        page.props.caja || {
            activa: null,
            tiene_caja_abierta: false,
            es_propietario_caja: false,
        }
    );
}

/**
 * Hook para obtener todos los permisos del usuario
 */
export function usePermissions() {
    const page = usePage<PageProps>();

    return useMemo(() => {
        return page.props.auth.permissions || [];
    }, [page.props.auth.permissions]);
}

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export function useHasPermission(permission: string) {
    const permissions = usePermissions();

    return useMemo(() => {
        return permissions.includes(permission);
    }, [permissions, permission]);
}

/**
 * Hook para verificar si el usuario tiene alguno de los permisos especificados
 */
export function useHasAnyPermission(permissions: string[]) {
    const userPermissions = usePermissions();

    return useMemo(() => {
        return permissions.some((permission) => userPermissions.includes(permission));
    }, [userPermissions, permissions]);
}

/**
 * Hook para verificar si el usuario tiene todos los permisos especificados
 */
export function useHasAllPermissions(permissions: string[]) {
    const userPermissions = usePermissions();

    return useMemo(() => {
        return permissions.every((permission) => userPermissions.includes(permission));
    }, [userPermissions, permissions]);
}

/**
 * Hook para obtener todos los roles del usuario
 */
export function useRoles() {
    const page = usePage<PageProps>();

    return useMemo(() => {
        return page.props.auth.roles || [];
    }, [page.props.auth.roles]);
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export function useHasRole(role: string) {
    const roles = useRoles();

    return useMemo(() => {
        return roles.includes(role);
    }, [roles, role]);
}

/**
 * Hook para verificar si el usuario tiene alguno de los roles especificados
 */
export function useHasAnyRole(roles: string[]) {
    const userRoles = useRoles();

    return useMemo(() => {
        return roles.some((role) => userRoles.includes(role));
    }, [userRoles, roles]);
}

/**
 * Hook para verificar si el usuario tiene todos los roles especificados
 */
export function useHasAllRoles(roles: string[]) {
    const userRoles = useRoles();

    return useMemo(() => {
        return roles.every((role) => userRoles.includes(role));
    }, [userRoles, roles]);
}
