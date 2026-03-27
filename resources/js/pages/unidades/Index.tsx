import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarRange } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

interface UnidadRow {
    id: number;
    nombre: string;
    descripcion?: string;
    orden: number;
    ciclo_escolar: number;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    deleted_at?: string;
    created_at: string;
}

interface UnidadesIndexProps {
    unidades: {
        data: UnidadRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Unidades', href: '/unidades' }];

const columns: ExtendedColumnDef<UnidadRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: UnidadRow } }) => (
            <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'orden',
        header: '#',
        accessorKey: 'orden',
        cell: ({ row }: { row: { original: UnidadRow } }) => (
            <Badge variant="outline" className="font-mono">{row.original.orden}</Badge>
        ),
    },
    {
        id: 'nombre',
        header: 'Nombre',
        accessorKey: 'nombre',
        cell: ({ row }: { row: { original: UnidadRow } }) => (
            <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                    <span className="font-medium">{row.original.nombre}</span>
                    {row.original.deleted_at && <Badge variant="destructive" className="ml-1.5 text-xs">Inactiva</Badge>}
                </div>
            </div>
        ),
    },
    {
        id: 'ciclo_escolar',
        header: 'Año',
        accessorKey: 'ciclo_escolar',
    },
    {
        id: 'fechas',
        header: 'Período',
        enableSorting: false,
        cell: ({ row }: { row: { original: UnidadRow } }) => {
            const { fecha_inicio, fecha_fin } = row.original;
            if (!fecha_inicio && !fecha_fin) return <span className="text-xs text-muted-foreground">—</span>;
            const fmt = (d: string) => new Date(d.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
                <span className="text-xs text-muted-foreground">
                    {fecha_inicio ? fmt(fecha_inicio) : '?'} – {fecha_fin ? fmt(fecha_fin) : '?'}
                </span>
            );
        },
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

export default function Index({ unidades }: UnidadesIndexProps) {
    const { can } = useCan();

    const meta = {
        page: unidades.current_page ?? 1,
        perPage: unidades.per_page ?? 10,
        total: unidades.total ?? 0,
        lastPage: unidades.last_page ?? 1,
        from: unidades.from ?? 1,
        to: unidades.to ?? 0,
    };

    return (
        <>
            <Head title="Unidades" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3">
                    <Filter />
                    <div className="flex gap-2 shrink-0">
                        {can('crear unidad') && (
                            <Link href={route('unidades.create')}>
                                <Button size="sm" color="blue">Crear Unidad</Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DataTableServer rows={unidades.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
