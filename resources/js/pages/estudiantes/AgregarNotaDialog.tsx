import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Activity, AlertCircle, CalendarDays, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Asignacion {
    seccion_id: number;
    seccion_nombre: string;
    materia_id: number;
    materia_nombre: string;
    materia_codigo?: string;
}

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
    materias?: { id: number; nombre: string; codigo?: string }[];
}

interface Unidad {
    id: number;
    nombre: string;
    orden: number;
    ciclo_escolar: number;
    fecha_inicio?: string;
    fecha_fin?: string;
}

interface EstudianteRow {
    id: number;
    name: string;
    email: string;
    secciones?: Seccion[];
    nota_id?: number;
    nota?: number;
    observaciones?: string;
}

interface NotaEntry {
    id: number;
    materia_id: number;
    unidad_id: number;
    nota: number | null;
    observaciones?: string;
}

interface HistoryActivity {
    created_at: string;
    description: string;
    event: string;
    causer?: { name: string };
    properties?: { attributes?: { nota?: number; observaciones?: string } };
}

interface Props {
    student: EstudianteRow | null;
    notas?: NotaEntry[];
    onClose: () => void;
    esCatedratico: boolean;
    misAsignaciones: Asignacion[];
}

function fmt(d?: string) {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

/**
 * Deduplicated list of seccion+materia combos available for this student.
 * For catedrático: filtered to their assignments.
 * For admin: from student's enrolled sections' materias.
 */
function resolveOpciones(student: EstudianteRow, esCatedratico: boolean, misAsignaciones: Asignacion[]): Asignacion[] {
    const studentSeccionIds = student.secciones?.map((s) => s.id) ?? [];

    if (esCatedratico) {
        return misAsignaciones.filter((a) => studentSeccionIds.includes(a.seccion_id));
    }

    // Admin: build from sections the student is enrolled in
    const opciones: Asignacion[] = [];
    for (const sec of student.secciones ?? []) {
        for (const mat of sec.materias ?? []) {
            opciones.push({
                seccion_id: sec.id,
                seccion_nombre: sec.nombre,
                materia_id: mat.id,
                materia_nombre: mat.nombre,
                materia_codigo: mat.codigo,
            });
        }
    }
    return opciones;
}

export default function AgregarNotaDialog({ student, notas = [], onClose, esCatedratico, misAsignaciones }: Props) {
    const { unidadActual } = usePage().props as unknown as { unidadActual: Unidad | null };

    const [asignacionKey, setAsignacionKey] = useState('');
    const [nota, setNota] = useState('');
    const [obs, setObs] = useState('');
    const [saving, setSaving] = useState(false);
    const [historial, setHistorial] = useState<HistoryActivity[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    const opciones = student ? resolveOpciones(student, esCatedratico, misAsignaciones) : [];

    const noActiveUnit = !unidadActual;
    const selected = opciones.find((o) => `${o.seccion_id}-${o.materia_id}` === asignacionKey) ?? null;
    const currentNoteObj =
        selected && unidadActual ? notas.find((n: NotaEntry) => n.materia_id === selected.materia_id && n.unidad_id === unidadActual.id) : null;

    useEffect(() => {
        if (!student) return;
        setHistorial([]);
        setLoadingHistorial(false);
        setSaving(false);

        // Auto-select if only one option
        if (opciones.length === 1 && !asignacionKey) {
            setAsignacionKey(`${opciones[0].seccion_id}-${opciones[0].materia_id}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student?.id, opciones.length]);

    useEffect(() => {
        // Formulario siempre limpio según requerimiento
        setNota('');
        setObs('');
        setHistorial([]);
        setLoadingHistorial(false);

        if (currentNoteObj?.id) {
            setLoadingHistorial(true);
            axios
                .get(`/notas/${currentNoteObj.id}/historial`)
                .then((res) => setHistorial(res.data))
                .catch((err) => console.error(err))
                .finally(() => setLoadingHistorial(false));
        }
    }, [currentNoteObj?.id, asignacionKey]);

    if (!student) return null;
    const canSave = !!(selected && unidadActual && nota !== '');

    const handleSave = () => {
        if (!canSave) return;
        setSaving(true);
        router.post(
            route('notas.bulk-store'),
            {
                seccion_id: selected!.seccion_id,
                materia_id: selected!.materia_id,
                unidad_id: unidadActual!.id,
                notas: [{ estudiante_id: student.id, nota: parseFloat(nota), observaciones: obs || null }],
            },
            {
                onSuccess: () => onClose(),
                onError: () => setSaving(false),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-base">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase">
                            {student.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="truncate">{student.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Active unit — read only, always shown */}
                    {unidadActual ? (
                        <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium">
                                    {unidadActual.orden}. {unidadActual.nombre}
                                </span>
                                {(unidadActual.fecha_inicio || unidadActual.fecha_fin) && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {fmt(unidadActual.fecha_inicio)}–{fmt(unidadActual.fecha_fin)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-sm">No hay unidad activa en este momento.</span>
                        </div>
                    )}

                    {!noActiveUnit && (
                        <>
                            {/* Materia selection */}
                            {opciones.length === 0 ? (
                                <p className="py-3 text-center text-sm text-muted-foreground">Este estudiante no tiene materias disponibles.</p>
                            ) : opciones.length === 1 ? (
                                /* Single option: show as read-only chip */
                                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                    {selected?.materia_codigo && (
                                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                                            {selected.materia_codigo}
                                        </span>
                                    )}
                                    <span className="font-medium">{selected?.materia_nombre}</span>
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{selected?.seccion_nombre}</span>
                                </div>
                            ) : (
                                /* Multiple options: picker */
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Materia</Label>
                                    <Select value={asignacionKey} onValueChange={setAsignacionKey}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar materia..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {opciones.map((o) => (
                                                <SelectItem key={`${o.seccion_id}-${o.materia_id}`} value={`${o.seccion_id}-${o.materia_id}`}>
                                                    {o.materia_nombre}
                                                    {o.materia_codigo ? ` (${o.materia_codigo})` : ''}
                                                    {' · '}
                                                    {o.seccion_nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Note input */}
                            {(selected || opciones.length === 0) && opciones.length > 0 && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="nota-dlg" className="text-xs">
                                                Nota (0–100)
                                            </Label>
                                            <Input
                                                id="nota-dlg"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={nota}
                                                onChange={(e) => setNota(e.target.value)}
                                                className="font-mono"
                                                placeholder="—"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="obs-dlg" className="text-xs">
                                                Observaciones
                                            </Label>
                                            <Textarea
                                                id="obs-dlg"
                                                value={obs}
                                                onChange={(e) => setObs(e.target.value)}
                                                className="min-h-9 resize-none text-xs"
                                                rows={1}
                                                placeholder="Opcional..."
                                            />
                                        </div>
                                    </div>

                                    {/* History Table */}
                                    {currentNoteObj?.id && (
                                        <div className="mt-5 border-t pt-4">
                                            <h4 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-foreground/80">
                                                <Activity className="h-3.5 w-3.5" /> Historial de Notas
                                            </h4>
                                            {loadingHistorial ? (
                                                <p className="animate-pulse text-xs text-muted-foreground">Cargando...</p>
                                            ) : historial.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">Sin historial registrado.</p>
                                            ) : (
                                                <div className="max-h-40 overflow-y-auto rounded-md border text-xs">
                                                    <Table>
                                                        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm hover:bg-background">
                                                            <TableRow>
                                                                <TableHead className="h-8 truncate py-1">Fecha</TableHead>
                                                                <TableHead className="h-8 truncate py-1">Usuario</TableHead>
                                                                <TableHead className="h-8 truncate py-1">Nota</TableHead>
                                                                <TableHead className="h-8 py-1">Obs.</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {historial.map((act, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell className="py-2 align-top text-muted-foreground">
                                                                        {new Date(act.created_at).toLocaleString('es-GT', {
                                                                            dateStyle: 'short',
                                                                            timeStyle: 'short',
                                                                        })}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className="max-w-[100px] truncate py-2 align-top font-medium"
                                                                        title={act.causer?.name || 'Sistema'}
                                                                    >
                                                                        {act.causer?.name || 'Sistema'}
                                                                    </TableCell>
                                                                    <TableCell className="py-2 align-top font-mono font-semibold whitespace-nowrap text-primary">
                                                                        {act.properties?.attributes?.nota || '0'} pts
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className="py-2 align-top text-xs leading-relaxed break-words whitespace-normal text-muted-foreground"
                                                                        title={act.properties?.attributes?.observaciones || ''}
                                                                    >
                                                                        {act.properties?.attributes?.observaciones || '—'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {opciones.length > 0 && (
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button type="button" size="sm" disabled={!canSave || saving} onClick={handleSave}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? 'Guardando...' : 'Guardar nota'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
