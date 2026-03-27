import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useRoles } from '@/hooks/use-roles';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef, RolesPermisosIndexProps, RolesPermisosRow } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles y Permisos', href: '/roles-permisos' }];

// Definir columnas fuera del componente para mejor organización
const columns: ExtendedColumnDef<RolesPermisosRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: RolesPermisosRow } }) => <Actions id={row.original.id} routeBase="roles-permisos" align="start" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
            <span className="font-mono text-sm">#{row.getValue('id') as string}</span>
        ),
    },
    {
        id: 'name',
        header: 'Nombre del Rol',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: RolesPermisosRow } }) => (
            <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        id: 'permissions_count',
        header: 'Permisos',
        accessorKey: 'permissions_count',
        cell: ({ row }: { row: { original: RolesPermisosRow } }) => {
            const count = row.original.permissions_count;
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{count} permisos</span>
                    {count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {count}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: 'users_count',
        header: 'Usuarios',
        accessorKey: 'users_count',
        cell: ({ row }: { row: { original: RolesPermisosRow } }) => {
            const count = row.original.users_count || 0;
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{count} usuarios</span>
                    {count > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {count}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: 'created_at',
        header: 'Fecha de Creación',
        accessorKey: 'created_at',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const fecha = row.getValue('created_at') as string;
            return <span className="text-sm">{formatDate(fecha)}</span>;
        },
    },
];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ roles, permisos, filters }: RolesPermisosIndexProps) {
    const { isAdminOrSuperAdmin } = useRoles();

    // Transformar roles para el DataTableServer
    const rows: RolesPermisosRow[] = roles.map((role: { id: number; name: string; permissions?: Array<{ id: number }>; users_count?: number }) => ({
        id: role.id,
        name: role.name,
        permissions_count: role.permissions?.length || 0,
        users_count: role.users_count || 0,
        created_at: role.created_at,
    }));

    // Meta object para DataTableServer (simulado ya que no tenemos paginación real)
    const meta = {
        page: 1,
        perPage: 15,
        total: roles.length,
        lastPage: 1,
        from: 1,
        to: roles.length,
    };

    return (
        <>
            <Head title="Roles y Permisos" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter filters={filters} permissions={permisos.map((p: { name: string }) => p.name)} />
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {isAdminOrSuperAdmin() && (
                            <Link href={route('roles-permisos.create')}>
                                <Button size="sm" className="w-full sm:w-auto sm:shrink-0" color="blue">
                                    Crear Rol
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <DataTableServer rows={rows} meta={meta} columns={columns} />
            </div>
        </>
    );
}
