import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, BookOpen, CalendarDays, GraduationCap, Save } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}
interface Materia {
    id: number;
    nombre: string;
    codigo?: string;
}
interface Unidad {
    id: number;
    nombre: string;
    orden: number;
    ciclo_escolar: number;
    fecha_inicio?: string;
    fecha_fin?: string;
}
interface NotaRow {
    id?: number;
    nota?: number | null;
    observaciones?: string | null;
}
interface HistorialItem {
    id: number;
    nota?: number | null;
    observaciones?: string | null;
    materia: Materia;
    unidad: Unidad;
    seccion: { id: number; nombre: string };
}

interface Props {
    estudiante: { id: number; name: string; email: string };
    secciones: Seccion[];
    materias: Materia[];
    unidades: Unidad[];
    unidadActual: { id: number; nombre: string; orden: number; fecha_inicio?: string; fecha_fin?: string } | null;
    esCatedratico: boolean;
    notaActual: NotaRow | null;
    historial: HistorialItem[];
    filtros: { seccion_id: string; materia_id: string; unidad_id: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Notas', href: '#' },
];

Notas.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function fmt(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Notas({ estudiante, secciones, materias, unidades, unidadActual, esCatedratico, notaActual, historial, filtros }: Props) {
    const [seccionId, setSeccionId] = useState(filtros.seccion_id ?? '');
    const [materiaId, setMateriaId] = useState(filtros.materia_id ?? '');
    const [unidadId, setUnidadId] = useState(filtros.unidad_id ?? '');
    const [nota, setNota] = useState<string>(notaActual?.nota != null ? String(notaActual.nota) : '');
    const [observaciones, setObs] = useState(notaActual?.observaciones ?? '');
    const [saving, setSaving] = useState(false);

    const navigate = useCallback(
        (sec: string, mat: string, uni: string) => {
            const params: Record<string, string> = {};
            if (sec) params.seccion_id = sec;
            if (mat) params.materia_id = mat;
            if (uni) params.unidad_id = uni;
            router.get(`/estudiantes/${estudiante.id}/notas`, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['materias', 'notaActual', 'filtros'],
            });
        },
        [estudiante.id],
    );

    const handleSeccion = (v: string) => {
        setSeccionId(v);
        setMateriaId('');
        navigate(v, '', unidadId);
    };
    const handleMateria = (v: string) => {
        setMateriaId(v);
        navigate(seccionId, v, unidadId);
    };
    const handleUnidad = (v: string) => {
        setUnidadId(v);
        navigate(seccionId, materiaId, v);
    };

    // Sync nota/obs when notaActual changes after partial reload
    const [prevNotaId, setPrevNotaId] = useState(notaActual?.id);
    if (notaActual?.id !== prevNotaId) {
        setPrevNotaId(notaActual?.id);
        setNota(notaActual?.nota != null ? String(notaActual.nota) : '');
        setObs(notaActual?.observaciones ?? '');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.post(
            route('notas.bulk-store'),
            {
                seccion_id: parseInt(seccionId),
                materia_id: parseInt(materiaId),
                unidad_id: parseInt(unidadId),
                notas: [
                    {
                        estudiante_id: estudiante.id,
                        nota: nota === '' ? null : parseFloat(nota),
                        observaciones: observaciones || null,
                    },
                ],
            },
            {
                preserveScroll: true,
                only: ['notaActual', 'historial'],
                onFinish: () => setSaving(false),
            },
        );
    };

    const hasContext = !!(seccionId && materiaId && unidadId);

    return (
        <>
            <Head title={`Notas — ${estudiante.name}`} />

            <div className="space-y-5 p-4">
                {/* Estudiante header */}
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                        {estudiante.name.charAt(0)}
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold">{estudiante.name}</h2>
                        <p className="text-sm text-muted-foreground">{estudiante.email}</p>
                    </div>
                </div>

                {/* Banner unidad activa */}
                {unidadActual ? (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium">Unidad activa: </span>
                            <span className="text-sm">
                                {unidadActual.orden}. {unidadActual.nombre}
                            </span>
                            {(unidadActual.fecha_inicio || unidadActual.fecha_fin) && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {fmt(unidadActual.fecha_inicio)} — {fmt(unidadActual.fecha_fin)}
                                </span>
                            )}
                        </div>
                        <Badge variant="default" className="shrink-0 text-xs">
                            Activa
                        </Badge>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="text-sm">No hay ninguna unidad activa en este momento.</p>
                    </div>
                )}

                {/* Formulario */}
                {(!esCatedratico || unidadActual) && (
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            Asignar calificación
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Sección</Label>
                                <Select value={seccionId} onValueChange={handleSeccion}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {secciones.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.nombre} · {s.ciclo_escolar}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Materia</Label>
                                <Select value={materiaId} onValueChange={handleMateria} disabled={!seccionId}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materias.map((m) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                {m.nombre}
                                                {m.codigo ? ` (${m.codigo})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Unidad</Label>
                                {esCatedratico ? (
                                    /* Catedrático: unidad bloqueada a la activa */
                                    <div className="flex h-8 items-center rounded-md border bg-muted px-3 text-xs text-muted-foreground">
                                        <BookOpen className="mr-1.5 h-3 w-3" />
                                        {unidadActual ? `${unidadActual.orden}. ${unidadActual.nombre}` : '—'}
                                    </div>
                                ) : (
                                    <Select value={unidadId} onValueChange={handleUnidad} disabled={!seccionId}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.orden}. {u.nombre} ({u.ciclo_escolar})
                                                    {u.fecha_inicio && u.fecha_fin ? ` · ${fmt(u.fecha_inicio)} – ${fmt(u.fecha_fin)}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        {hasContext && (
                            <div className="grid gap-3 pt-1 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label htmlFor="nota" className="text-xs">
                                        Nota (0–100)
                                    </Label>
                                    <Input
                                        id="nota"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={nota}
                                        onChange={(e) => setNota(e.target.value)}
                                        className="h-8 font-mono"
                                        placeholder="—"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="obs" className="text-xs">
                                        Observaciones
                                    </Label>
                                    <Textarea
                                        id="obs"
                                        value={observaciones}
                                        onChange={(e) => setObs(e.target.value)}
                                        className="h-8 min-h-8 resize-none text-xs"
                                        rows={1}
                                        placeholder="Opcional..."
                                    />
                                </div>
                            </div>
                        )}

                        {hasContext && (
                            <Button type="submit" size="sm" disabled={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Guardando...' : notaActual ? 'Actualizar nota' : 'Guardar nota'}
                            </Button>
                        )}
                    </form>
                )}

                {/* Historial */}
                {historial.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Historial de calificaciones</h3>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left font-medium">Sección</th>
                                        <th className="p-3 text-left font-medium">Materia</th>
                                        <th className="p-3 text-left font-medium">Unidad</th>
                                        <th className="w-24 p-3 text-center font-medium">Nota</th>
                                        <th className="p-3 text-left font-medium">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((n) => (
                                        <tr key={n.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="p-3 text-xs text-muted-foreground">{n.seccion.nombre}</td>
                                            <td className="p-3 font-medium">
                                                {n.materia.nombre}
                                                {n.materia.codigo && <span className="ml-1 text-xs text-muted-foreground">({n.materia.codigo})</span>}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {n.unidad.orden}. {n.unidad.nombre}
                                            </td>
                                            <td className="p-3 text-center">
                                                {n.nota != null ? (
                                                    <Badge variant={Number(n.nota) >= 60 ? 'default' : 'destructive'} className="font-mono">
                                                        {Number(n.nota).toFixed(2)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{n.observaciones || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
