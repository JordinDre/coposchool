import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    roles?: Array<{
        id: number;
        name: string;
    }>;
}

interface PageProps {
    auth: {
        user: User | null;
        navigation_permissions: string[];
        roles?: string[];
    };
    permissions?: string[];
    [key: string]: unknown;
}

export function useRoles() {
    const page = usePage<PageProps>();

    return useMemo(() => {
        const userRoles = page.props.auth.roles || [];
        const user = page.props.auth.user;

        // Si el usuario tiene roles en la propiedad roles, usarlos también
        const userModelRoles = user?.roles?.map((role) => role.name) || [];

        // Combinar roles de ambas fuentes
        const allRoles = [...userRoles, ...userModelRoles];

        return {
            roles: allRoles,
            hasRole: (roleName: string | string[]) => {
                if (Array.isArray(roleName)) {
                    return roleName.some((role) => allRoles.includes(role));
                }
                return allRoles.includes(roleName);
            },
            hasAnyRole: (roles: string[]) => {
                return roles.some((role) => allRoles.includes(role));
            },
            hasAllRoles: (roles: string[]) => {
                return roles.every((role) => allRoles.includes(role));
            },
            isSuperAdmin: () => allRoles.includes('super-admin'),
            isAdmin: () => allRoles.includes('administrador'),
            isAdminOrSuperAdmin: () => allRoles.includes('administrador') || allRoles.includes('super-admin'),
        };
    }, [page.props.auth.roles, page.props.auth.user]);
}
