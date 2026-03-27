import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Edit, GraduationCap } from 'lucide-react';
import React from 'react';

interface ShowProps {
    materia: {
        id: number;
        nombre: string;
        codigo?: string;
        descripcion?: string;
        deleted_at?: string;
        secciones_count: number;
        secciones?: Array<{ id: number; nombre: string; ciclo: string; ciclo_escolar: number }>;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Materias', href: '/materias' },
    { title: 'Ver Materia', href: '#' },
];

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ materia }: ShowProps) {
    const { can } = useCan();

    return (
        <>
            <Head title={materia.nombre} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-semibold">{materia.nombre}</h1>
                            {materia.deleted_at && <Badge variant="destructive">Inactiva</Badge>}
                        </div>
                        {materia.codigo && <p className="font-mono text-sm text-muted-foreground">Código: {materia.codigo}</p>}
                        {materia.descripcion && <p className="text-sm text-muted-foreground">{materia.descripcion}</p>}
                    </div>
                    {can('editar materia') && !materia.deleted_at && (
                        <Link href={route('materias.edit', materia.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    )}
                </div>

                {materia.secciones && materia.secciones.length > 0 && (
                    <div className="space-y-3 rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <h2 className="font-medium">Secciones donde se imparte ({materia.secciones.length})</h2>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {materia.secciones.map((s) => (
                                <div key={s.id} className="rounded-md border p-2">
                                    <div className="text-sm font-medium">{s.nombre}</div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {s.ciclo} — {s.ciclo_escolar}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
