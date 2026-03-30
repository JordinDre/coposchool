import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

interface MateriaRow {
    id: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    secciones_count: number;
    deleted_at?: string;
    created_at: string;
}

interface MateriasIndexProps {
    materias: {
        data: MateriaRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Materias', href: '/materias' }];

const columns: ExtendedColumnDef<MateriaRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: MateriaRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'nombre',
        header: 'Nombre',
        accessorKey: 'nombre',
        cell: ({ row }: { row: { original: MateriaRow } }) => (
            <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{row.original.nombre}</span>
                {row.original.deleted_at && (
                    <Badge variant="destructive" className="text-xs">
                        Inactiva
                    </Badge>
                )}
            </div>
        ),
    },
    {
        id: 'codigo',
        header: 'Código',
        accessorKey: 'codigo',
        cell: ({ row }: { row: { original: MateriaRow } }) => <span className="font-mono text-sm">{row.original.codigo || '—'}</span>,
    },
    {
        id: 'secciones_count',
        header: 'Secciones',
        accessorKey: 'secciones_count',
        cell: ({ row }: { row: { original: MateriaRow } }) => <Badge variant="secondary">{row.original.secciones_count}</Badge>,
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

export default function Index({ materias, filters }: MateriasIndexProps) {
    const { can } = useCan();

    const meta = {
        page: materias.current_page ?? 1,
        perPage: materias.per_page ?? 10,
        total: materias.total ?? 0,
        lastPage: materias.last_page ?? 1,
        from: materias.from ?? 1,
        to: materias.to ?? 0,
        sortBy: filters.sort_by ?? undefined,
        sortDir: filters.sort_direction ?? undefined,
    };

    return (
        <>
            <Head title="Materias" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3">
                    <Filter />
                    <div className="flex shrink-0 gap-2">
                        {can('crear materia') && (
                            <Link href={route('materias.create')}>
                                <Button size="sm" color="blue">
                                    Crear Materia
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DataTableServer rows={materias.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
