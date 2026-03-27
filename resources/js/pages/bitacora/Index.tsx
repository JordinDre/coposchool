import Export from '@/components/Export';
import { DataTableServer } from '@/components/ui/data-table-server';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { Actividad, ActividadIndexProps, BreadcrumbItem, ExtendedColumnDef } from '@/types';
import { Head } from '@inertiajs/react';
import { User } from 'lucide-react';
import React from 'react';
import Actions from './Actions';
import Filter from './Filter';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Bitácora', href: '/bitacora' }];

// Definir columnas fuera del componente para mejor organización
const columns: ExtendedColumnDef<Actividad>[] = [
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: { row: { original: Actividad } }) => <Actions id={row.original.id} routeBase="bitacora" align="start" />,
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
        id: 'log_name',
        header: 'Tipo',
        accessorKey: 'log_name',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const logName = row.getValue('log_name') as string;
            return logName ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {logName}
                </span>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        id: 'description',
        header: 'Descripción',
        accessorKey: 'description',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const description = row.getValue('description') as string;
            // Traducir "created" y "updated" en la descripción
            const translatedDescription =
                description
                    ?.replace(/\bcreated\b/gi, 'creado')
                    ?.replace(/\bupdated\b/gi, 'actualizado')
                    ?.replace(/\bdeleted\b/gi, 'eliminado') || description;
            return (
                <div className="max-w-xs">
                    <p className="truncate text-sm font-medium">{translatedDescription}</p>
                </div>
            );
        },
    },
    {
        id: 'causer',
        header: 'Usuario',
        accessorKey: 'causer.name',
        cell: ({ row }: { row: { original: Actividad } }) => {
            const causer = row.original.causer;
            return causer ? (
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{causer.name}</p>
                        <p className="text-xs text-muted-foreground">{causer.email}</p>
                    </div>
                </div>
            ) : (
                <span className="text-muted-foreground">Sistema</span>
            );
        },
    },
    {
        id: 'subject_type',
        header: 'Modelo',
        accessorKey: 'subject_type',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const subjectType = row.getValue('subject_type') as string;
            return subjectType ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    {subjectType.replace('App\\Models\\', '')}
                </span>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        id: 'subject_id',
        header: 'ID Modelo',
        accessorKey: 'subject_id',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const subjectId = row.getValue('subject_id') as number;
            return subjectId ? <span className="font-mono text-sm">#{subjectId}</span> : <span className="text-muted-foreground">-</span>;
        },
    },
    {
        id: 'created_at',
        header: 'Fecha',
        accessorKey: 'created_at',
        cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const fecha = row.getValue('created_at') as string;
            return (
                <div className="space-y-1">
                    <div className="text-sm">{formatDate(fecha)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(fecha).toLocaleTimeString('es-GT')}</div>
                </div>
            );
        },
    },
];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ activities, filters }: ActividadIndexProps) {
    return (
        <>
            <Head title="Bitácora" />
            <div className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <div className="w-full sm:flex-1">
                        <Filter filters={filters} />
                    </div>
                    <Export
                        routeBase="bitacora"
                        tableKey="bitacora"
                        permission="exportar bitacora"
                        size="sm"
                        className="w-full sm:w-auto sm:shrink-0"
                    />
                </div>

                <DataTableServer rows={activities.data} meta={activities.meta} columns={columns} persistFiltersInSession={true} />
            </div>
        </>
    );
}
