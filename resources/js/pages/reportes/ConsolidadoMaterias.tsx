import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
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
}
interface Estudiante {
    id: number;
    name: string;
    deleted_at: string | null;
}
interface NotaRow {
    estudiante_id: number;
    materia_id: number;
    unidad_id: number;
    nota: number | null;
}
interface Props {
    secciones: Seccion[];
    seccion: Seccion | null;
    materias: Materia[];
    unidades: Unidad[];
    estudiantes: Estudiante[];
    notas: NotaRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reportes' },
    { title: 'Consolidado por Materia', href: '#' },
];

ConsolidadoMaterias.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function notaColor(n: number | undefined): string {
    if (n === undefined) return '';
    if (n >= 60) return 'text-green-700 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
}

function avg(vals: number[]): number | undefined {
    const valid = vals.filter((v) => !isNaN(v));
    if (valid.length === 0) return undefined;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default function ConsolidadoMaterias({ secciones, seccion, materias, unidades, estudiantes, notas }: Props) {
    // Build lookup: [estudianteId][unidadId][materiaId] = nota
    const lookup: Record<number, Record<number, Record<number, number>>> = {};
    notas.forEach((n) => {
        if (n.nota === null) return;
        lookup[n.estudiante_id] ??= {};
        lookup[n.estudiante_id][n.unidad_id] ??= {};
        lookup[n.estudiante_id][n.unidad_id][n.materia_id] = Number(n.nota);
    });

    const handleSeccionChange = (v: string) => {
        router.get(route('reportes.consolidado-materias'), { seccion_id: v }, { preserveState: false });
    };

    const hasData = seccion && estudiantes.length > 0;

    return (
        <>
            <Head title="Consolidado por Materia" />
            <div className="p-3">
                {/* Filters */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Select value={seccion?.id?.toString()} onValueChange={handleSeccionChange}>
                        <SelectTrigger className="w-56">
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
                </div>

                {!hasData ? (
                    <div className="flex items-center justify-center rounded-md border py-20 text-sm text-muted-foreground">
                        {seccion ? 'No hay estudiantes o datos en esta sección.' : 'Selecciona una sección para ver el consolidado.'}
                    </div>
                ) : (
                    <div className="overflow-auto rounded-md border">
                        <table className="w-full border-collapse text-xs">
                            {/* ── HEADER NIVEL 1: grupos por unidad + FINALES ── */}
                            <thead>
                                <tr className="bg-muted/60">
                                    <th rowSpan={2} className="sticky left-0 z-20 w-8 border bg-muted/60 px-2 py-1.5 text-center font-semibold">
                                        #
                                    </th>
                                    <th
                                        rowSpan={2}
                                        className="sticky left-8 z-20 min-w-[180px] border bg-muted/60 px-3 py-1.5 text-left font-semibold"
                                    >
                                        Estudiante
                                    </th>
                                    {unidades.map((u) => (
                                        <th key={u.id} colSpan={materias.length + 1} className="border px-2 py-1.5 text-center font-semibold">
                                            {u.nombre}
                                        </th>
                                    ))}
                                    <th
                                        colSpan={materias.length + 1}
                                        className="border bg-slate-100 px-2 py-1.5 text-center font-bold dark:bg-slate-800"
                                    >
                                        Notas Finales
                                    </th>
                                </tr>

                                {/* ── HEADER NIVEL 2: materias por cada grupo ── */}
                                <tr className="bg-muted/40">
                                    {/* Materias de cada unidad */}
                                    {unidades.map((u) => (
                                        <React.Fragment key={u.id}>
                                            {materias.map((m) => (
                                                <th
                                                    key={m.id}
                                                    className="max-w-[60px] border px-1 py-1 text-center font-medium"
                                                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: '120px' }}
                                                >
                                                    {m.nombre}
                                                </th>
                                            ))}
                                            <th
                                                className="min-w-[52px] border px-1 py-1 text-center font-bold"
                                                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: '120px' }}
                                            >
                                                Promedio
                                            </th>
                                        </React.Fragment>
                                    ))}
                                    {/* Materias de FINALES */}
                                    {materias.map((m) => (
                                        <th
                                            key={`final-${m.id}`}
                                            className="max-w-[60px] border bg-slate-100 px-1 py-1 text-center font-medium dark:bg-slate-800"
                                            style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: '120px' }}
                                        >
                                            {m.nombre}
                                        </th>
                                    ))}
                                    <th
                                        className="min-w-[52px] border bg-slate-100 px-1 py-1 text-center font-bold dark:bg-slate-800"
                                        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: '120px' }}
                                    >
                                        Final
                                    </th>
                                </tr>
                            </thead>

                            {/* ── BODY ── */}
                            <tbody>
                                {estudiantes.map((est, idx) => {
                                    const estNotas = lookup[est.id] ?? {};

                                    // Per-materia averages across all unidades (for FINALES)
                                    const finalesPorMateria: Record<number, number | undefined> = {};
                                    materias.forEach((m) => {
                                        const vals = unidades.map((u) => estNotas[u.id]?.[m.id]).filter((v): v is number => v !== undefined);
                                        finalesPorMateria[m.id] = avg(vals);
                                    });

                                    const promedioFinal = avg(Object.values(finalesPorMateria).filter((v): v is number => v !== undefined));

                                    return (
                                        <tr key={est.id} className={idx % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'}>
                                            <td className="sticky left-0 z-10 border bg-inherit px-2 py-1 text-center text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="sticky left-8 z-10 border bg-inherit px-3 py-1 font-medium whitespace-nowrap">
                                                {est.name}
                                                {est.deleted_at && <span className="ml-1 text-muted-foreground">(inactivo)</span>}
                                            </td>

                                            {/* Notas por unidad */}
                                            {unidades.map((u) => {
                                                const unidadNotas = estNotas[u.id] ?? {};
                                                const materiaVals = materias
                                                    .map((m) => unidadNotas[m.id])
                                                    .filter((v): v is number => v !== undefined);
                                                const promedioUnidad = avg(materiaVals);

                                                return (
                                                    <React.Fragment key={u.id}>
                                                        {materias.map((m) => {
                                                            const n = unidadNotas[m.id];
                                                            return (
                                                                <td
                                                                    key={m.id}
                                                                    className={cn('border px-1.5 py-1 text-center tabular-nums', notaColor(n))}
                                                                >
                                                                    {n !== undefined ? Math.round(n) : '—'}
                                                                </td>
                                                            );
                                                        })}
                                                        <td
                                                            className={cn(
                                                                'border px-1.5 py-1 text-center font-semibold tabular-nums',
                                                                notaColor(promedioUnidad),
                                                            )}
                                                        >
                                                            {promedioUnidad !== undefined ? promedioUnidad.toFixed(1) : '—'}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}

                                            {/* FINALES */}
                                            {materias.map((m) => {
                                                const n = finalesPorMateria[m.id];
                                                return (
                                                    <td
                                                        key={`final-${m.id}`}
                                                        className={cn(
                                                            'border bg-slate-50 px-1.5 py-1 text-center font-semibold tabular-nums dark:bg-slate-900',
                                                            notaColor(n),
                                                        )}
                                                    >
                                                        {n !== undefined ? n.toFixed(1) : '—'}
                                                    </td>
                                                );
                                            })}
                                            <td
                                                className={cn(
                                                    'border bg-slate-100 px-1.5 py-1 text-center font-bold tabular-nums dark:bg-slate-800',
                                                    notaColor(promedioFinal),
                                                )}
                                            >
                                                {promedioFinal !== undefined ? promedioFinal.toFixed(1) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
