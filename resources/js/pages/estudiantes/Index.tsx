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

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}

interface EstudianteRow {
    id: number;
    name: string;
    email: string;
    telefono?: string;
    deleted_at?: string;
    created_at: string;
    secciones?: Seccion[];
}

interface IndexProps {
    estudiantes: {
        data: EstudianteRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    secciones: Seccion[];
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estudiantes', href: '/estudiantes' }];

const columns: ExtendedColumnDef<EstudianteRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: EstudianteRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'name',
        header: 'Estudiante',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: EstudianteRow } }) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    {row.original.deleted_at && (
                        <Badge variant="destructive" className="mt-0.5 text-xs">
                            Inactivo
                        </Badge>
                    )}
                </div>
            </div>
        ),
    },
    {
        id: 'secciones',
        header: 'Secciones inscritas',
        accessorKey: 'secciones',
        cell: ({ row }: { row: { original: EstudianteRow } }) => {
            const secs = row.original.secciones ?? [];
            if (secs.length === 0) return <span className="text-xs text-muted-foreground">Sin secciones</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {secs.slice(0, 3).map((s) => (
                        <Badge key={s.id} variant="outline" className="text-xs">
                            {s.nombre}
                        </Badge>
                    ))}
                    {secs.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                            +{secs.length - 3}
                        </Badge>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: 'telefono',
        header: 'Teléfono',
        accessorKey: 'telefono',
        cell: ({ row }: { row: { original: EstudianteRow } }) => <span className="text-sm">{row.original.telefono || '—'}</span>,
    },
    {
        id: 'created_at',
        header: 'Registrado',
        accessorKey: 'created_at',
        cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
            <span className="text-sm text-muted-foreground">{formatDate(row.getValue('created_at') as string)}</span>
        ),
    },
];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ estudiantes, secciones, filters }: IndexProps) {
    const { can } = useCan();

    const meta = {
        page: estudiantes.current_page ?? 1,
        perPage: estudiantes.per_page ?? 10,
        total: estudiantes.total ?? 0,
        lastPage: estudiantes.last_page ?? 1,
        from: estudiantes.from ?? 1,
        to: estudiantes.to ?? 0,
        sortBy: filters.sort_by ?? undefined,
        sortDir: filters.sort_direction ?? undefined,
    };

    return (
        <>
            <Head title="Estudiantes" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter secciones={secciones} />
                    {can('crear usuarios') && (
                        <Link href={route('estudiantes.create')} className="shrink-0">
                            <Button size="sm" color="blue">
                                Crear Estudiante
                            </Button>
                        </Link>
                    )}
                </div>
                <DataTableServer rows={estudiantes.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
