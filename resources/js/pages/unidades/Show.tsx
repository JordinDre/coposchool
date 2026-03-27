import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import React from 'react';

interface ShowProps {
    unidad: {
        id: number;
        nombre: string;
        descripcion?: string;
        orden: number;
        ciclo_escolar: number;
        deleted_at?: string;
        notas_count?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unidades', href: '/unidades' },
    { title: 'Ver Unidad', href: '#' },
];

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ unidad }: ShowProps) {
    const { can } = useCan();

    return (
        <>
            <Head title={unidad.nombre} />
            <div className="space-y-4 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-3 py-1 font-mono text-base">
                                {unidad.orden}
                            </Badge>
                            <h1 className="text-xl font-semibold">{unidad.nombre}</h1>
                            {unidad.deleted_at && <Badge variant="destructive">Inactiva</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">Ciclo Escolar {unidad.ciclo_escolar}</p>
                        {unidad.descripcion && <p className="text-sm text-muted-foreground">{unidad.descripcion}</p>}
                        {typeof unidad.notas_count === 'number' && (
                            <p className="text-sm">
                                <span className="font-medium">{unidad.notas_count}</span> notas registradas
                            </p>
                        )}
                    </div>
                    {can('editar unidad') && !unidad.deleted_at && (
                        <Link href={route('unidades.edit', unidad.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
