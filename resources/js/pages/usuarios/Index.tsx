import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

interface UserRow {
    id: number;
    name: string;
    email: string;
    telefono?: string;
    deleted_at?: string;
    created_at: string;
    roles?: Array<{ id: number; name: string }>;
}

interface UsuariosIndexProps {
    users: {
        data: UserRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    roles: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: '/usuarios' }];

const columns: ExtendedColumnDef<UserRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: UserRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'name',
        header: 'Nombre',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: UserRow } }) => (
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
        cell: ({ row }: { row: { original: UserRow } }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
    },
    {
        id: 'roles',
        header: 'Roles',
        accessorKey: 'roles',
        cell: ({ row }: { row: { original: UserRow } }) => (
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
        cell: ({ row }: { row: { original: UserRow } }) => <span className="text-sm">{row.original.telefono || '—'}</span>,
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

export default function Index({ users, roles }: UsuariosIndexProps) {
    const { can } = useCan();

    const meta = {
        page: users.current_page ?? 1,
        perPage: users.per_page ?? 10,
        total: users.total ?? 0,
        lastPage: users.last_page ?? 1,
        from: users.from ?? 1,
        to: users.to ?? 0,
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
