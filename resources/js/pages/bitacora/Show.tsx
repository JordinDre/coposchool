import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { ActividadShowProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';

interface ActivityProperties {
    old?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Bitácora', href: '/bitacora' },
    { title: 'Detalle de Actividad', href: '/bitacora/show' },
];

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ activity }: ActividadShowProps) {
    // Validar que activity existe
    if (!activity) {
        return (
            <>
                <Head title="Actividad no encontrada" />
                <div className="md:p-4">
                    <p className="text-muted-foreground">No se pudo cargar la información de la bitacora.</p>
                </div>
            </>
        );
    }

    const formatJson = (obj: Record<string, unknown> | null | undefined) => {
        if (!obj) return 'null';
        return JSON.stringify(obj, null, 2);
    };

    const getEventLabel = (event: string | null): string => {
        if (!event) return 'Sin evento';
        const lowerEvent = event.toLowerCase();
        if (lowerEvent.includes('created')) return 'Creado';
        if (lowerEvent.includes('updated')) return 'Actualizado';
        if (lowerEvent.includes('deleted')) return 'Eliminado';
        return event;
    };

    const getEventColor = (event: string | null) => {
        if (!event) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
        const lowerEvent = event.toLowerCase();
        if (lowerEvent.includes('created')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        if (lowerEvent.includes('updated')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        if (lowerEvent.includes('deleted')) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    };

    return (
        <>
            <Head title={`Actividad #${activity.id}`} />
            <div className="md:p-4">
                <div className="space-y-6">
                    {/* Información General */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Información General</h2>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">ID</TableCell>
                                        <TableCell className="w-1/4 font-mono">#{activity?.id ?? '-'}</TableCell>
                                        <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">Evento</TableCell>
                                        <TableCell className="w-1/4">
                                            <Badge className={getEventColor(activity?.event ?? null)}>{getEventLabel(activity?.event ?? null)}</Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Descripción</TableCell>
                                        <TableCell colSpan={3}>{activity?.description ?? '-'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Log Name</TableCell>
                                        <TableCell>{activity?.log_name || '-'}</TableCell>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Fecha</TableCell>
                                        <TableCell>{activity?.created_at ? formatDate(activity.created_at) : '-'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Información del Usuario */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Usuario</h2>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableBody>
                                    {activity.causer ? (
                                        <>
                                            <TableRow>
                                                <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">Nombre</TableCell>
                                                <TableCell className="w-1/4 font-medium">{activity.causer.name}</TableCell>
                                                <TableCell className="w-1/4 bg-gray-50 font-medium dark:bg-gray-800">Email</TableCell>
                                                <TableCell className="w-1/4">{activity.causer.email}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Tipo</TableCell>
                                                <TableCell>{activity.causer_type || '-'}</TableCell>
                                                <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">ID</TableCell>
                                                <TableCell className="font-mono">{activity.causer_id || '-'}</TableCell>
                                            </TableRow>
                                        </>
                                    ) : (
                                        <TableRow>
                                            <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Tipo</TableCell>
                                            <TableCell colSpan={3}>Sistema (Acción automática)</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Modelo Afectado */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Modelo Afectado</h2>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2 bg-gray-50 font-medium dark:bg-gray-800">Tipo</TableCell>
                                        <TableCell className="w-1/2">
                                            {activity?.subject_type ? activity.subject_type.replace('App\\Models\\', '') : '-'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">ID</TableCell>
                                        <TableCell className="font-mono">{activity?.subject_id ? `#${activity.subject_id}` : '-'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Propiedades */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Propiedades</h2>
                        {activity?.properties && typeof activity.properties === 'object' && Object.keys(activity.properties).length > 0 ? (
                            (activity.properties as ActivityProperties).old && (activity.properties as ActivityProperties).attributes ? (
                                <div className="space-y-4">
                                    {/* Resumen de cambios */}
                                    <div>
                                        <h3 className="mb-2 text-base font-semibold">Resumen de Cambios</h3>
                                        <div className="overflow-x-auto rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                        <TableHead>Campo</TableHead>
                                                        <TableHead>Antes</TableHead>
                                                        <TableHead>Después</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(() => {
                                                        const props = activity.properties as ActivityProperties;
                                                        const oldProps = props.old || {};
                                                        const newProps = props.attributes || {};
                                                        // Obtener todos los campos únicos de ambos objetos
                                                        const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

                                                        return Array.from(allKeys).map((key) => {
                                                            const oldValue = oldProps[key];
                                                            const newValue = newProps[key];
                                                            const hasChanged = oldValue !== newValue;

                                                            // Mostrar todos los campos, incluso si no han cambiado
                                                            return (
                                                                <TableRow key={key}>
                                                                    <TableCell className="font-medium">{key}</TableCell>
                                                                    <TableCell
                                                                        className={`font-mono text-xs ${hasChanged ? 'text-red-600 dark:text-red-400' : ''}`}
                                                                    >
                                                                        {oldValue !== null && oldValue !== undefined ? (
                                                                            typeof oldValue === 'object' ? (
                                                                                <pre className="text-[10px] whitespace-pre-wrap">
                                                                                    {JSON.stringify(oldValue, null, 2)}
                                                                                </pre>
                                                                            ) : (
                                                                                String(oldValue)
                                                                            )
                                                                        ) : (
                                                                            <span className="text-muted-foreground">null</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className={`font-mono text-xs ${hasChanged ? 'text-green-600 dark:text-green-400' : ''}`}
                                                                    >
                                                                        {newValue !== null && newValue !== undefined ? (
                                                                            typeof newValue === 'object' ? (
                                                                                <pre className="text-[10px] whitespace-pre-wrap">
                                                                                    {JSON.stringify(newValue, null, 2)}
                                                                                </pre>
                                                                            ) : (
                                                                                String(newValue)
                                                                            )
                                                                        ) : (
                                                                            <span className="text-muted-foreground">null</span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        });
                                                    })()}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Estado anterior y posterior */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-2 text-base font-semibold">Estado Anterior</h3>
                                            <div className="overflow-x-auto rounded-md border">
                                                <div className="p-3">
                                                    <pre className="overflow-x-auto font-mono text-xs">
                                                        {formatJson((activity.properties as ActivityProperties).old)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 text-base font-semibold">Estado Posterior</h3>
                                            <div className="overflow-x-auto rounded-md border">
                                                <div className="p-3">
                                                    <pre className="overflow-x-auto font-mono text-xs">
                                                        {formatJson((activity.properties as ActivityProperties).attributes)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (activity.properties as ActivityProperties).attributes ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-base font-semibold">Atributos</h3>
                                        <div className="overflow-x-auto rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                        <TableHead className="w-1/3">Campo</TableHead>
                                                        <TableHead className="w-2/3">Valor</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries((activity.properties as ActivityProperties).attributes || {}).map(
                                                        ([key, value]) => (
                                                            <TableRow key={key}>
                                                                <TableCell className="font-medium">{key}</TableCell>
                                                                <TableCell className="font-mono text-xs break-all">
                                                                    {value !== null && value !== undefined ? (
                                                                        typeof value === 'object' ? (
                                                                            <pre className="whitespace-pre-wrap">
                                                                                {JSON.stringify(value, null, 2)}
                                                                            </pre>
                                                                        ) : (
                                                                            String(value)
                                                                        )
                                                                    ) : (
                                                                        <span className="text-muted-foreground">null</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-base font-semibold">JSON Completo</h3>
                                        <div className="overflow-x-auto rounded-md border">
                                            <div className="p-3">
                                                <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">
                                                    {formatJson((activity.properties as ActivityProperties).attributes)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <div className="p-3">
                                        <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">
                                            {formatJson(activity.properties as ActivityProperties)}
                                        </pre>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <div className="p-3">
                                    <p className="text-sm text-muted-foreground">No hay propiedades disponibles para esta bitacora.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información del Sistema */}
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Información del Sistema</h2>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2 bg-gray-50 font-medium dark:bg-gray-800">Creado</TableCell>
                                        <TableCell className="w-1/2">
                                            {activity?.created_at ? (
                                                <>
                                                    {formatDate(activity.created_at)}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(activity.created_at).toLocaleTimeString('es-GT')}
                                                    </div>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="bg-gray-50 font-medium dark:bg-gray-800">Actualizado</TableCell>
                                        <TableCell>
                                            {activity?.updated_at ? (
                                                <>
                                                    {formatDate(activity.updated_at)}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(activity.updated_at).toLocaleTimeString('es-GT')}
                                                    </div>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
