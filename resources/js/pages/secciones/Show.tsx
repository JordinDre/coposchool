import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Edit, GraduationCap, Users } from 'lucide-react';
import React from 'react';

const CICLO_COLORS: Record<string, string> = {
    'pre-primaria': 'bg-pink-100 text-pink-800',
    kinder: 'bg-purple-100 text-purple-800',
    primaria: 'bg-blue-100 text-blue-800',
    basico: 'bg-green-100 text-green-800',
    diversificado: 'bg-orange-100 text-orange-800',
};

interface ShowProps {
    seccion: {
        id: number;
        nombre: string;
        ciclo: string;
        ciclo_escolar: number;
        descripcion?: string;
        deleted_at?: string;
        materias_count: number;
        estudiantes_count: number;
    };
    materias: Array<{ id: number; nombre: string; codigo?: string; catedratico?: { id: number; name: string; email: string } | null }>;
    estudiantes: Array<{ id: number; name: string; email: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Ver Sección', href: '#' },
];

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ seccion, materias, estudiantes }: ShowProps) {
    const { can } = useCan();

    return (
        <>
            <Head title={seccion.nombre} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-semibold">{seccion.nombre}</h1>
                            {seccion.deleted_at && <Badge variant="destructive">Inactiva</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CICLO_COLORS[seccion.ciclo] || ''}`}
                            >
                                {seccion.ciclo}
                            </span>
                            <span className="text-sm text-muted-foreground">Ciclo {seccion.ciclo_escolar}</span>
                        </div>
                        {seccion.descripcion && <p className="text-sm text-muted-foreground">{seccion.descripcion}</p>}
                    </div>
                    {can('editar seccion') && !seccion.deleted_at && (
                        <Link href={route('secciones.edit', seccion.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Materias */}
                    <div className="space-y-3 rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <h2 className="font-medium">Materias ({materias.length})</h2>
                        </div>
                        {materias.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay materias asignadas.</p>
                        ) : (
                            <div className="space-y-2">
                                {materias.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between rounded-md border p-2">
                                        <div>
                                            <div className="text-sm font-medium">{m.nombre}</div>
                                            {m.codigo && <div className="text-xs text-muted-foreground">{m.codigo}</div>}
                                        </div>
                                        {m.catedratico ? (
                                            <div className="text-right">
                                                <div className="text-xs font-medium">{m.catedratico.name}</div>
                                                <div className="text-xs text-muted-foreground">Catedrático</div>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                Sin asignar
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Estudiantes */}
                    <div className="space-y-3 rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <h2 className="font-medium">Estudiantes ({estudiantes.length})</h2>
                        </div>
                        {estudiantes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay estudiantes inscritos.</p>
                        ) : (
                            <div className="max-h-64 space-y-1 overflow-y-auto">
                                {estudiantes.map((e) => (
                                    <div key={e.id} className="rounded-md border p-2">
                                        <div className="text-sm font-medium">{e.name}</div>
                                        <div className="text-xs text-muted-foreground">{e.email}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
