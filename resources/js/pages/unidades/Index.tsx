import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableServer } from '@/components/ui/data-table-server';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, CalendarRange, CheckCircle2 } from 'lucide-react';
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

interface UnidadActual {
    id: number;
    nombre: string;
    orden: number;
    ciclo_escolar: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
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
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Unidades', href: '/unidades' }];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ unidades, filters }: UnidadesIndexProps) {
    const { can } = useCan();
    const { unidadActual } = usePage().props as unknown as { unidadActual: UnidadActual | null };

    const meta = {
        page: unidades.current_page ?? 1,
        perPage: unidades.per_page ?? 10,
        total: unidades.total ?? 0,
        lastPage: unidades.last_page ?? 1,
        sortBy: filters.sort_by ?? undefined,
        sortDir: (filters.sort_direction as 'asc' | 'desc' | undefined) ?? undefined,
    };

    const columns: ExtendedColumnDef<UnidadRow>[] = [
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }: { row: { original: UnidadRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} align="start" />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'orden',
            header: '#',
            accessorKey: 'orden',
            cell: ({ row }: { row: { original: UnidadRow } }) => (
                <Badge variant="outline" className="font-mono">
                    {row.original.orden}
                </Badge>
            ),
        },
        {
            id: 'nombre',
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ row }: { row: { original: UnidadRow } }) => {
                const isActual = unidadActual?.id === row.original.id;
                return (
                    <div className="flex items-center gap-2">
                        <CalendarRange className={`h-4 w-4 shrink-0 ${isActual ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                        <div>
                            <span className="font-medium">{row.original.nombre}</span>
                            {isActual && (
                                <Badge className="ml-1.5 border-green-200 bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Activa
                                </Badge>
                            )}
                            {row.original.deleted_at && (
                                <Badge variant="destructive" className="ml-1.5 text-xs">
                                    Inactiva
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            },
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
                const fmt = (d: string) =>
                    new Date(d.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });
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

    return (
        <>
            <Head title="Unidades" />
            <div className="p-3">
                {unidadActual ? (
                    <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                            Unidad activa: <strong>{unidadActual.nombre}</strong> ({unidadActual.fecha_inicio} → {unidadActual.fecha_fin})
                        </span>
                    </div>
                ) : (
                    <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>No hay una unidad activa actualmente. Edita una unidad y establece las fechas de inicio y fin.</span>
                    </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3">
                    <Filter />
                    <div className="flex shrink-0 gap-2">
                        {can('crear unidad') && (
                            <Link href={route('unidades.create')}>
                                <Button size="sm" color="blue">
                                    Crear Unidad
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DataTableServer rows={unidades.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
