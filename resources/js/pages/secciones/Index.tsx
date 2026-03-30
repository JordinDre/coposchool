import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

interface SeccionRow {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
    descripcion?: string;
    materias_count: number;
    estudiantes_count: number;
    deleted_at?: string;
    created_at: string;
}

interface SeccionesIndexProps {
    secciones: {
        data: SeccionRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    filters: Record<string, string>;
}

const CICLO_COLORS: Record<string, string> = {
    'pre-primaria': 'bg-pink-100 text-pink-800',
    kinder: 'bg-purple-100 text-purple-800',
    primaria: 'bg-blue-100 text-blue-800',
    basico: 'bg-green-100 text-green-800',
    diversificado: 'bg-orange-100 text-orange-800',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Secciones', href: '/secciones' }];

const columns: ExtendedColumnDef<SeccionRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: SeccionRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'nombre',
        header: 'Nombre',
        accessorKey: 'nombre',
        cell: ({ row }: { row: { original: SeccionRow } }) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
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
        id: 'ciclo',
        header: 'Ciclo',
        accessorKey: 'ciclo',
        cell: ({ row }: { row: { original: SeccionRow } }) => (
            <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CICLO_COLORS[row.original.ciclo] || ''}`}
            >
                {row.original.ciclo}
            </span>
        ),
    },
    {
        id: 'ciclo_escolar',
        header: 'Año',
        accessorKey: 'ciclo_escolar',
    },
    {
        id: 'materias_count',
        header: 'Materias',
        accessorKey: 'materias_count',
        cell: ({ row }: { row: { original: SeccionRow } }) => <Badge variant="secondary">{row.original.materias_count}</Badge>,
    },
    {
        id: 'estudiantes_count',
        header: 'Estudiantes',
        accessorKey: 'estudiantes_count',
        cell: ({ row }: { row: { original: SeccionRow } }) => <Badge variant="outline">{row.original.estudiantes_count}</Badge>,
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

export default function Index({ secciones, filters }: SeccionesIndexProps) {
    const { can } = useCan();

    const meta = {
        page: secciones.current_page ?? 1,
        perPage: secciones.per_page ?? 10,
        total: secciones.total ?? 0,
        lastPage: secciones.last_page ?? 1,
        from: secciones.from ?? 1,
        to: secciones.to ?? 0,
        sortBy: filters.sort_by ?? undefined,
        sortDir: filters.sort_direction ?? undefined,
    };

    return (
        <>
            <Head title="Secciones" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter />
                    <div className="flex gap-2">
                        {can('crear seccion') && (
                            <Link href={route('secciones.create')}>
                                <Button size="sm" color="blue">
                                    Crear Sección
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DataTableServer rows={secciones.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
