import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import React from 'react';

interface Seccion {
    id: number;
    nombre: string;
    ciclo_escolar: number;
}

interface Unidad {
    id: number;
    nombre: string;
    orden: number;
    ciclo_escolar: number;
}

interface Materia {
    id: number;
    nombre: string;
    codigo: string | null;
}

interface Estudiante {
    id: number;
    name: string;
    deleted_at: string | null;
}

interface Nota {
    estudiante_id: number;
    materia_id: number;
    nota: number;
}

interface Props {
    secciones: Seccion[];
    unidades: Unidad[];
    seccion: Seccion | null;
    unidad: Unidad | null;
    materias: Materia[];
    estudiantes: Estudiante[];
    notas: Nota[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reportes' },
    { title: 'Consolidado', href: '#' },
];

Consolidado.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Consolidado({ secciones, unidades, seccion, unidad, materias, estudiantes, notas }: Props) {
    const lookup: Record<string, number> = {};
    notas.forEach((n) => {
        lookup[`${n.estudiante_id}-${n.materia_id}`] = Number(n.nota);
    });

    const handleExport = () => {
        if (!seccion || !unidad) return;
        window.location.href = route('reportes.consolidado', {
            seccion_id: seccion.id,
            unidad_id: unidad.id,
        });
    };

    const handleFilterChange = (type: 'seccion' | 'unidad', value: string) => {
        router.get(
            route('reportes.consolidado-view'),
            {
                seccion_id: type === 'seccion' ? value : seccion?.id,
                unidad_id: type === 'unidad' ? value : unidad?.id,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Consolidado de Calificaciones" />

            <div className="p-3">
                {/* Top bar */}
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={seccion?.id?.toString()} onValueChange={(v) => handleFilterChange('seccion', v)}>
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder="Seleccionar sección..." />
                            </SelectTrigger>
                            <SelectContent>
                                {secciones.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={unidad?.id?.toString()} onValueChange={(v) => handleFilterChange('unidad', v)}>
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder="Seleccionar unidad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {unidades.map((u) => (
                                    <SelectItem key={u.id} value={u.id.toString()}>
                                        {u.orden}. {u.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {seccion && unidad && (
                        <Button size="sm" color="green" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Exportar Excel
                        </Button>
                    )}
                </div>

                {/* Table */}
                {seccion && unidad ? (
                    <div className="overflow-auto rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-10 text-center">#</TableHead>
                                    <TableHead className="min-w-[220px]">Estudiante</TableHead>
                                    {materias.map((m) => (
                                        <TableHead key={m.id} className="w-10 min-w-10 bg-muted/50 p-2 align-bottom">
                                            <span
                                                className="text-xs font-medium"
                                                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', display: 'block' }}
                                            >
                                                {m.nombre}
                                            </span>
                                        </TableHead>
                                    ))}
                                    <TableHead className="w-16 min-w-16 text-center">Promedio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estudiantes.map((est, idx) => {
                                    let sum = 0;
                                    let count = 0;

                                    return (
                                        <TableRow key={est.id}>
                                            <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {est.name}
                                                {est.deleted_at && <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>}
                                            </TableCell>
                                            {materias.map((m) => {
                                                const rawNota = lookup[`${est.id}-${m.id}`];
                                                const nota = rawNota !== undefined ? Number(rawNota) : undefined;

                                                if (nota !== undefined && !isNaN(nota)) {
                                                    sum += nota;
                                                    count++;
                                                }

                                                return (
                                                    <TableCell
                                                        key={m.id}
                                                        className={cn(
                                                            'text-center text-sm font-medium',
                                                            nota !== undefined && nota < 60 ? 'text-red-600' : '',
                                                        )}
                                                    >
                                                        {nota !== undefined ? Math.round(nota) : '—'}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center text-sm font-semibold">
                                                {count > 0 ? (sum / count).toFixed(1) : '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center rounded-md border py-20 text-sm text-muted-foreground">
                        Selecciona una sección y unidad para ver el consolidado.
                    </div>
                )}
            </div>
        </>
    );
}
