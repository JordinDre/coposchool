import { PdfSheet } from '@/components/PdfSheet';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import { usePdf } from '@/hooks/usePdf';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FileText, NotebookPen } from 'lucide-react';
import React, { useState } from 'react';
import AgregarNotaDialog from '../estudiantes/AgregarNotaDialog';
import Filter from './Filter';

interface Materia { id: number; nombre: string; codigo?: string }
interface Seccion { id: number; nombre: string; ciclo: string; ciclo_escolar: number; materias?: Materia[] }
interface Asignacion {
    seccion_id: number; seccion_nombre: string;
    materia_id: number; materia_nombre: string; materia_codigo?: string;
}
interface Unidad { id: number; nombre: string; orden: number; ciclo_escolar: number; fecha_inicio?: string; fecha_fin?: string }
interface NotaEntry { id: number; materia_id: number; unidad_id: number; nota: number | null; observaciones?: string; }

interface EstudianteRow {
    id: number;
    name: string;
    email: string;
    deleted_at?: string;
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
    misAsignaciones: Asignacion[];
    unidades: Unidad[];
    notasGrid: Record<string, NotaEntry[]>;
    esCatedratico: boolean;

    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notas', href: '/notas' }];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function notaColor(nota: number | null) {
    if (nota === null || nota === undefined) return 'text-muted-foreground';
    if (nota >= 60) return 'text-green-700 dark:text-green-400 font-semibold';
    if (nota >= 50) return 'text-amber-700 dark:text-amber-400 font-semibold';
    return 'text-red-700 dark:text-red-400 font-semibold';
}

function fmt(d?: string) {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

function initials(name: string) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
}

function getMaterias(
    student: EstudianteRow,
    esCatedratico: boolean,
    misAsignaciones: Asignacion[],
): { id: number; nombre: string; codigo?: string }[] {
    if (esCatedratico) {
        const studentSeccionIds = student.secciones?.map((s) => s.id) ?? [];
        const seen = new Set<number>();
        return misAsignaciones
            .filter((a) => studentSeccionIds.includes(a.seccion_id))
            .filter((a) => !seen.has(a.materia_id) && seen.add(a.materia_id))
            .map((a) => ({ id: a.materia_id, nombre: a.materia_nombre, codigo: a.materia_codigo }));
    }
    const seen = new Set<number>();
    return (student.secciones ?? [])
        .flatMap((s) => s.materias ?? [])
        .filter((m) => !seen.has(m.id) && seen.add(m.id));
}

export default function Index({
    estudiantes, secciones, misAsignaciones, unidades, notasGrid, esCatedratico,
}: IndexProps) {
    const { can } = useCan();
    const { unidadActual } = usePage().props as unknown as { unidadActual: Unidad | null };
    const { generatePdfUrl } = usePdf();

    const [dialogStudent, setDialogStudent] = useState<EstudianteRow | null>(null);
    const [fichaStudent, setFichaStudent] = useState<EstudianteRow | null>(null);

    const { data, from, to, total, current_page, last_page } = estudiantes;

    const goToPage = (page: number) =>
        router.get(route('notas.index'), { page }, { preserveState: true, preserveScroll: false });

    const gridCols =
        unidades.length <= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        unidades.length <= 6 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1';

    const fichaPdfUrl = fichaStudent
        ? generatePdfUrl(`reportes/ficha/${fichaStudent.id}`)
        : '';
    const fichaFileName = fichaStudent
        ? `ficha-${fichaStudent.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
        : 'ficha.pdf';

    return (
        <>
            <Head title="Notas" />

            <div className="space-y-4 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Filter secciones={secciones} />
                </div>

                {data.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                        No se encontraron estudiantes
                    </div>
                ) : (
                    <div className={`grid gap-3 ${gridCols}`}>
                        {data.map((estudiante) => {
                            const isInactive = !!estudiante.deleted_at;
                            const notas: NotaEntry[] = notasGrid[String(estudiante.id)] ?? [];
                            const materias = getMaterias(estudiante, esCatedratico, misAsignaciones);

                            const lookup: Record<number, Record<number, number | null>> = {};
                            for (const n of notas) {
                                if (!lookup[n.materia_id]) lookup[n.materia_id] = {};
                                lookup[n.materia_id][n.unidad_id] = n.nota;
                            }

                            return (
                                <div
                                    key={estudiante.id}
                                    className={[
                                        'flex flex-col rounded-lg border transition-colors',
                                        isInactive ? 'opacity-55' : '',
                                    ].join(' ')}
                                >
                                    {/* Card body */}
                                    <div className="flex gap-3 px-4 pt-3 pb-2">
                                        <div className={[
                                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                            isInactive ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
                                        ].join(' ')}>
                                            {initials(estudiante.name)}
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className="font-medium leading-tight">{estudiante.name}</span>
                                                {isInactive && (
                                                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-tight">{estudiante.email}</p>

                                            {(estudiante.secciones ?? []).length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {(estudiante.secciones ?? []).map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="inline-flex items-center rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-xs text-muted-foreground"
                                                        >
                                                            {s.nombre} · {s.ciclo_escolar}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {materias.length > 0 && unidades.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <table className="border-collapse text-xs">
                                                        <thead>
                                                            <tr>
                                                                <th className="w-20 pb-1 pr-3 text-left font-normal text-muted-foreground/60" />
                                                                {unidades.map((u) => (
                                                                    <th
                                                                        key={u.id}
                                                                        className="w-16 pb-1 px-1 text-center font-medium text-muted-foreground"
                                                                        title={u.fecha_inicio ? fmt(u.fecha_inicio) + '–' + fmt(u.fecha_fin) : undefined}
                                                                    >
                                                                        <div className="text-[10px] leading-tight">{u.nombre}</div>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {materias.map((m) => (
                                                                <tr key={m.id}>
                                                                    <td className="pr-3 py-0.5 text-left text-muted-foreground whitespace-nowrap">
                                                                        {m.codigo
                                                                            ? <><span className="text-[9px] text-muted-foreground/60 mr-1">{m.codigo}</span>{m.nombre}</>
                                                                            : m.nombre}
                                                                    </td>
                                                                    {unidades.map((u) => {
                                                                        const nota = lookup[m.id]?.[u.id] ?? null;
                                                                        const isActive = unidadActual?.id === u.id;
                                                                        return (
                                                                            <td
                                                                                key={u.id}
                                                                                className={[
                                                                                    'py-0.5 text-center font-mono tabular-nums',
                                                                                    isActive ? 'rounded bg-primary/5' : '',
                                                                                ].join(' ')}
                                                                            >
                                                                                <span className={notaColor(nota)}>
                                                                                    {nota != null ? Number(nota).toFixed(0) : '0'}
                                                                                </span>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex items-center gap-1.5 border-t border-border/40 px-4 py-2">
                                        {!isInactive && can('crear nota') && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1.5 px-2 text-xs"
                                                onClick={() => setDialogStudent(estudiante)}
                                            >
                                                <NotebookPen className="h-3 w-3" />
                                                Agregar nota
                                            </Button>
                                        )}
                                        {can('generar boleta individual') && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1.5 px-2 text-xs"
                                                onClick={() => setFichaStudent(estudiante)}
                                            >
                                                <FileText className="h-3 w-3" />
                                                Ver ficha
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {total > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{from}–{to} de {total} estudiantes</span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={current_page === 1}
                                onClick={() => goToPage(current_page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-2 tabular-nums">{current_page} / {last_page}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={current_page === last_page}
                                onClick={() => goToPage(current_page + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AgregarNotaDialog
                student={dialogStudent}
                notas={dialogStudent ? (notasGrid[String(dialogStudent.id)] ?? []) : []}
                onClose={() => setDialogStudent(null)}
                esCatedratico={esCatedratico}
                misAsignaciones={misAsignaciones}
            />

            <PdfSheet
                open={fichaStudent !== null}
                onOpenChange={(open) => { if (!open) setFichaStudent(null); }}
                title={fichaStudent ? `Ficha — ${fichaStudent.name}` : 'Ficha académica'}
                description="Vista previa de la ficha académica del estudiante"
                pdfUrl={fichaPdfUrl}
                fileName={fichaFileName}
            >
                {null}
            </PdfSheet>
        </>
    );
}
