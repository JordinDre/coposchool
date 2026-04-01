import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

import type { BreadcrumbItem, ExtendedColumnDef, User, UserIndexProps } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: '/usuarios' }];

const columns: ExtendedColumnDef<User>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: User } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'name',
        header: 'Nombre',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: User } }) => (
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    {row.original.deleted_at && (
                        <Badge variant="destructive" className="text-xs">
                            Inactivo
                        </Badge>
                    )}
                </div>
            </div>
        ),
    },
    {
        id: 'email',
        header: 'Correo',
        accessorKey: 'email',
        cell: ({ row }: { row: { original: User } }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
    },
    {
        id: 'roles',
        header: 'Roles',
        accessorKey: 'roles',
        cell: ({ row }: { row: { original: User } }) => (
            <div className="flex flex-wrap gap-1">
                {(row.original.roles || []).map((r) => (
                    <Badge key={r.id} variant="outline" className="text-xs capitalize">
                        {r.name}
                    </Badge>
                ))}
            </div>
        ),
        enableSorting: false,
    },
    {
        id: 'telefono',
        header: 'Teléfono',
        accessorKey: 'telefono',
        cell: ({ row }: { row: { original: User } }) => <span className="text-sm">{row.original.telefono || '—'}</span>,
    },
    {
        id: 'created_at',
        header: 'Creado',
        accessorKey: 'created_at',
        cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
            <span className="text-sm">{formatDate(row.getValue('created_at') as string)}</span>
        ),
    },
];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ users, roles, filters }: UserIndexProps) {
    const { can } = useCan();

    const meta = {
        page: users.meta.page ?? 1,
        perPage: users.meta.perPage ?? 10,
        total: users.meta.total ?? 0,
        lastPage: users.meta.lastPage ?? 1,
        sortBy: filters.sort_by ?? undefined,
        sortDir: filters.sort_direction ?? (undefined as "asc" | "desc" | undefined),
    };

    return (
        <>
            <Head title="Usuarios" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter roles={roles} />
                    <div className="flex shrink-0 gap-2">
                        {can('crear usuarios') && (
                            <Link href={route('usuarios.create')}>
                                <Button size="sm" color="blue">
                                    Crear Usuario
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DataTableServer rows={users.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
