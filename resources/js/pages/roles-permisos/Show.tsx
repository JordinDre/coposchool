import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { groupPermissionsByModule } from '@/lib/permissionGroups';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles y Permisos', href: '/roles-permisos' },
    { title: 'Detalle de Rol', href: '/roles-permisos/show' },
];

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Array<{
        id: number;
        name: string;
    }>;
    users_count?: number;
    created_at: string;
    updated_at: string;
}

interface RolesPermisosShowProps {
    role: Role;
    permisos: Permission[];
}

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ role, permisos }: RolesPermisosShowProps) {
    const page = usePage();
    const configuracion = (
        page.props as {
            configuracion?: {
                clientes?: boolean;
                servicios?: boolean;
                creditos?: boolean;
                traslados?: boolean;
                gastos?: boolean;
                conversiones?: boolean;
                bodegas?: boolean;
                facturacionElectronica?: boolean;
            };
        }
    )?.configuracion;

    const rolePermissionIds = role.permissions.map((p) => p.id);

    // Filtrar permisos según módulos activos
    const rolePermissions = useMemo(() => {
        let filtered = permisos.filter((p) => rolePermissionIds.includes(p.id));

        filtered = filtered.filter((permission) => {
            const name = permission.name.toLowerCase();

            // Verificar módulo de clientes
            if (name.includes('cliente') && (!configuracion || !configuracion.clientes)) {
                return false;
            }

            // Verificar módulo de servicios
            if (name.includes('servicio') && (!configuracion || !configuracion.servicios)) {
                return false;
            }

            // Verificar módulo de créditos
            if (name.includes('credito') && (!configuracion || !configuracion.creditos)) {
                return false;
            }

            // Verificar módulo de traslados
            if (name.includes('traslado') && (!configuracion || !configuracion.traslados)) {
                return false;
            }

            // Verificar módulo de gastos
            if (name.includes('gasto') && (!configuracion || !configuracion.gastos)) {
                return false;
            }

            // Verificar módulo de conversiones
            if (name.includes('conversion') && (!configuracion || !configuracion.conversiones)) {
                return false;
            }

            // Verificar módulo de bodegas
            if (name.includes('bodega') && (!configuracion || !configuracion.bodegas)) {
                return false;
            }

            // Verificar módulo de facturación electrónica (facturas)
            if (name.includes('factura') && (!configuracion || !configuracion.facturacionElectronica)) {
                return false;
            }

            return true;
        });

        return filtered;
    }, [permisos, rolePermissionIds, configuracion]);

    const groupedPermissions = groupPermissionsByModule(rolePermissions);

    return (
        <>
            <Head title={`Rol #${role.id}`} />
            <div className="md:p-4">
                <div className="space-y-6">
                    {/* Información General */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Información General</h2>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">ID</TableCell>
                                        <TableCell className="w-1/4">#{role.id}</TableCell>
                                        <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">Nombre</TableCell>
                                        <TableCell className="w-1/4 font-medium">{role.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Usuarios</TableCell>
                                        <TableCell>{role.users_count || 0}</TableCell>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Permisos</TableCell>
                                        <TableCell>{role.permissions.length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Fecha de creación</TableCell>
                                        <TableCell>{formatDate(role.created_at)}</TableCell>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Última actualización</TableCell>
                                        <TableCell>{formatDate(role.updated_at)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Permisos agrupados por módulo */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Permisos Asignados ({role.permissions.length})</h2>
                        {groupedPermissions.length === 0 ? (
                            <div className="overflow-x-auto rounded-md border">
                                <div className="p-8 text-center text-muted-foreground">No hay permisos asignados a este rol.</div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedPermissions.map((group) => (
                                    <div key={group.name}>
                                        <h3 className="mb-2 text-base font-semibold">
                                            {group.icon && <span className="mr-2">{group.icon}</span>}
                                            {group.label} ({group.permissions.length})
                                        </h3>
                                        <div className="overflow-x-auto rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                        <TableHead>Permiso</TableHead>
                                                        <TableHead>Acción</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.permissions.map((permission) => {
                                                        const action = permission.name.split(' ')[0];
                                                        return (
                                                            <TableRow key={permission.id}>
                                                                <TableCell className="font-medium capitalize">{permission.name}</TableCell>
                                                                <TableCell className="text-sm text-muted-foreground capitalize">
                                                                    {action === 'listar' && 'Ver lista'}
                                                                    {action === 'ver' && 'Ver detalles'}
                                                                    {action === 'crear' && 'Crear nuevo'}
                                                                    {action === 'editar' && 'Modificar'}
                                                                    {action === 'eliminar' && 'Eliminar'}
                                                                    {action === 'desactivar' && 'Desactivar'}
                                                                    {action === 'anular' && 'Anular'}
                                                                    {action === 'confirmar' && 'Confirmar'}
                                                                    {action === 'autorizar' && 'Autorizar'}
                                                                    {action === 'rechazar' && 'Rechazar'}
                                                                    {action === 'solicitar' && 'Solicitar'}
                                                                    {action === 'enviar' && 'Enviar'}
                                                                    {action === 'recibir' && 'Recibir'}
                                                                    {action === 'entregar' && 'Entregar'}
                                                                    {action === 'pagar' && 'Pagar'}
                                                                    {action === 'abrir' && 'Abrir'}
                                                                    {action === 'cerrar' && 'Cerrar'}
                                                                    {![
                                                                        'listar',
                                                                        'ver',
                                                                        'crear',
                                                                        'editar',
                                                                        'eliminar',
                                                                        'desactivar',
                                                                        'anular',
                                                                        'confirmar',
                                                                        'autorizar',
                                                                        'rechazar',
                                                                        'solicitar',
                                                                        'enviar',
                                                                        'recibir',
                                                                        'entregar',
                                                                        'pagar',
                                                                        'abrir',
                                                                        'cerrar',
                                                                    ].includes(action) && action}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resumen por Módulo */}
                    {groupedPermissions.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-lg font-semibold">Resumen por Módulo</h2>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                                            <TableHead>Módulo</TableHead>
                                            <TableHead className="text-right">Permisos</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedPermissions.map((group) => (
                                            <TableRow key={group.name}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {group.icon && <span>{group.icon}</span>}
                                                        <span className="font-medium">{group.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="secondary">{group.permissions.length}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell className="font-bold">Total</TableCell>
                                            <TableCell className="text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {role.permissions.length}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
