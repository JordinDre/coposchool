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

interface Materia {
    id: number;
    nombre: string;
    codigo?: string;
}
interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}

interface CatedraticoRow {
    id: number;
    name: string;
    email: string;
    telefono?: string;
    deleted_at?: string;
    created_at: string;
    materias_como_docente?: Materia[];
}

interface IndexProps {
    catedraticos: {
        data: CatedraticoRow[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    secciones: Seccion[];
    materias: Materia[];
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Catedráticos', href: '/catedraticos' }];

const columns: ExtendedColumnDef<CatedraticoRow>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: CatedraticoRow } }) => <Actions id={row.original.id} isDeleted={!!row.original.deleted_at} />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'name',
        header: 'Catedrático',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: CatedraticoRow } }) => (
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.email}</div>
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
        id: 'materias',
        header: 'Materias que imparte',
        accessorKey: 'materias_como_docente',
        cell: ({ row }: { row: { original: CatedraticoRow } }) => {
            const mats = row.original.materias_como_docente ?? [];
            if (mats.length === 0) return <span className="text-xs text-muted-foreground">Sin materias asignadas</span>;
            // Build unique set by id to avoid duplicates across sections
            const unique = [...new Map(mats.map((m) => [m.id, m])).values()];
            return (
                <div className="flex flex-wrap gap-1">
                    {unique.slice(0, 4).map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                            {m.nombre}
                        </Badge>
                    ))}
                    {unique.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                            +{unique.length - 4}
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
        cell: ({ row }: { row: { original: CatedraticoRow } }) => <span className="text-sm">{row.original.telefono || '—'}</span>,
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

export default function Index({ catedraticos, secciones, materias }: IndexProps) {
    const { can } = useCan();

    const meta = {
        page: catedraticos.current_page ?? 1,
        perPage: catedraticos.per_page ?? 10,
        total: catedraticos.total ?? 0,
        lastPage: catedraticos.last_page ?? 1,
        from: catedraticos.from ?? 1,
        to: catedraticos.to ?? 0,
    };

    return (
        <>
            <Head title="Catedráticos" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter secciones={secciones} materias={materias} />
                    {can('crear usuarios') && (
                        <Link href={route('catedraticos.create')} className="shrink-0">
                            <Button size="sm" color="blue">
                                Crear Catedrático
                            </Button>
                        </Link>
                    )}
                </div>
                <DataTableServer rows={catedraticos.data} meta={meta} columns={columns} />
            </div>
        </>
    );
}
