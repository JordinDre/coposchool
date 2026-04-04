import { PdfSheet } from '@/components/PdfSheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCan } from '@/hooks/use-can';
import { usePdf } from '@/hooks/usePdf';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Clock, Download, FileText, MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
}
interface NotaCell {
    nota_id: number | null;
    nota: number | string | null;
    observaciones: string | null;
}
interface GrillaRow {
    estudiante_id: number;
    estudiante_name: string;
    notas: Record<string, NotaCell>;
}
interface ActivityLog {
    id: number;
    description: string;
    event: string;
    created_at: string;
    causer?: { id: number; name: string };
    properties?: { attributes?: Record<string, unknown>; old?: Record<string, unknown> };
}
interface Props {
    secciones: Seccion[];
    materias: Materia[];
    unidades: Unidad[];
    grilla: GrillaRow[] | null;
    contexto: { seccion: Seccion; materia: Materia } | null;
    filtros: { seccion_id?: string | null; materia_id?: string | null };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notas', href: '/notas' }];
Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function notaColor(nota: number | string | null): string {
    const n = nota === null || nota === '' ? null : Number(nota);
    if (n === null || isNaN(n)) return '';
    if (n >= 60) return 'text-green-700 dark:text-green-400';
    if (n >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

export default function Index({ secciones, materias, unidades, grilla, contexto, filtros }: Props) {
    const { can } = useCan();
    const { generatePdfUrl } = usePdf();
    const { unidadActual } = usePage().props as unknown as { unidadActual: Unidad | null };

    const [rows, setRows] = useState<GrillaRow[]>(grilla ?? []);
    // dirtyByUnit: unidadId → Set<estudianteId>
    const [dirtyByUnit, setDirtyByUnit] = useState<Map<number, Set<number>>>(new Map());
    const [saving, setSaving] = useState(false);

    const [fichaId, setFichaId] = useState<number | null>(null);
    const [fichaName, setFichaName] = useState('');

    const [historialOpen, setHistorialOpen] = useState(false);
    const [historialTitle, setHistorialTitle] = useState('');
    const [historialLogs, setHistorialLogs] = useState<ActivityLog[]>([]);
    const [historialLoading, setHistorialLoading] = useState(false);

    useEffect(() => {
        setRows(grilla ?? []);
        setDirtyByUnit(new Map());
    }, [grilla]);

    const updateCell = (estudianteId: number, unidadId: number, field: 'nota' | 'observaciones', value: string) => {
        const key = String(unidadId);
        setRows((prev) =>
            prev.map((r) => {
                if (r.estudiante_id !== estudianteId) return r;
                const prev_cell = r.notas[key] ?? { nota_id: null, nota: null, observaciones: null };
                return { ...r, notas: { ...r.notas, [key]: { ...prev_cell, [field]: value === '' ? null : value } } };
            }),
        );
        setDirtyByUnit((prev) => {
            const next = new Map(prev);
            const set = new Set(next.get(unidadId) ?? []);
            set.add(estudianteId);
            next.set(unidadId, set);
            return next;
        });
    };

    const handleSave = () => {
        if (!contexto || !unidadActual || dirtyByUnit.size === 0) return;
        const key = String(unidadActual.id);
        setSaving(true);
        router.post(
            route('notas.bulk-store'),
            {
                seccion_id: contexto.seccion.id,
                materia_id: contexto.materia.id,
                unidad_id: unidadActual.id,
                notas: rows.map((r) => ({
                    estudiante_id: r.estudiante_id,
                    nota: r.notas[key]?.nota !== null && r.notas[key]?.nota !== '' ? Number(r.notas[key]?.nota) : null,
                    observaciones: r.notas[key]?.observaciones ?? null,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setDirtyByUnit(new Map());
                },
                onError: () => setSaving(false),
            },
        );
    };

    const changeContext = (params: Record<string, string>) => {
        router.get(route('notas.index'), params, { replace: true, preserveState: false });
    };

    const openHistorial = async (notaId: number, studentName: string) => {
        setHistorialTitle(studentName);
        setHistorialOpen(true);
        setHistorialLoading(true);
        setHistorialLogs([]);
        try {
            const res = await fetch(route('notas.historial', notaId), {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            setHistorialLogs(Array.isArray(data) ? data : []);
        } catch {
            setHistorialLogs([]);
        } finally {
            setHistorialLoading(false);
        }
    };

    const fichaPdfUrl = fichaId ? generatePdfUrl(`reportes/ficha/${fichaId}`) : '';
    const fichaFileName = fichaName ? `ficha-${fichaName.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'ficha.pdf';
    const totalDirty = Array.from(dirtyByUnit.values()).reduce((acc, s) => acc + s.size, 0);
    const isDirty = dirtyByUnit.size > 0;
    const sid = filtros.seccion_id ?? '';
    const mid = filtros.materia_id ?? '';
    const canEdit = can('crear nota') && !!unidadActual;

    return (
        <>
            <Head title="Notas" />

            <div className="p-3">
                {/* Filters + Save */}
                <div className="mb-3 flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sección</label>
                        <Select value={sid} onValueChange={(v) => changeContext(v ? { seccion_id: v } : {})}>
                            <SelectTrigger className="h-8 w-44 text-sm">
                                <SelectValue placeholder="Seleccionar…" />
                            </SelectTrigger>
                            <SelectContent>
                                {secciones.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Materia</label>
                        <Select
                            value={mid}
                            disabled={!sid || materias.length === 0}
                            onValueChange={(v) => changeContext(v ? { seccion_id: sid, materia_id: v } : { seccion_id: sid })}
                        >
                            <SelectTrigger className="h-8 w-52 text-sm">
                                <SelectValue placeholder={!sid ? 'Primero sección' : 'Seleccionar…'} />
                            </SelectTrigger>
                            <SelectContent>
                                {materias.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.codigo ? `[${m.codigo}] ` : ''}
                                        {m.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {grilla !== null && contexto && (
                        <div className="self-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    window.location.href = route('notas.exportar', {
                                        seccion_id: contexto.seccion.id,
                                        materia_id: contexto.materia.id,
                                    });
                                }}
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Exportar Excel
                            </Button>
                        </div>
                    )}

                    {isDirty && grilla !== null && canEdit && (
                        <div className="self-end">
                            <Button size="sm" disabled={saving} onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                                {saving ? 'Guardando…' : `Guardar (${totalDirty})`}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Table */}
                {grilla === null ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-24 text-center">
                        <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">Selecciona una sección y materia para ver las notas</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-md border border-dashed py-16 text-center text-sm text-muted-foreground">
                        No hay estudiantes inscritos en esta sección
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-border">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-muted/50 dark:bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-16">Acciones</TableHead>
                                    <TableHead className="w-10 text-center">#</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    {unidades.map((u) => {
                                        const isActual = unidadActual?.id === u.id;
                                        return (
                                            <TableHead
                                                key={u.id}
                                                className={`text-center ${isActual ? 'border-b-2 border-b-blue-500 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : ''}`}
                                            >
                                                {u.nombre}
                                                {isActual && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-blue-500 align-middle" />}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => {
                                    const dirty = Array.from(dirtyByUnit.values()).some((s) => s.has(row.estudiante_id));
                                    const actualKey = unidadActual ? String(unidadActual.id) : null;
                                    const actualCell = actualKey ? (row.notas[actualKey] ?? null) : null;

                                    return (
                                        <TableRow
                                            key={row.estudiante_id}
                                            className={`${idx % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'} ${dirty ? 'border-l-2 border-l-amber-400' : ''}`}
                                        >
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        {actualCell?.nota_id != null && (
                                                            <DropdownMenuItem onClick={() => openHistorial(actualCell.nota_id!, row.estudiante_name)}>
                                                                <Clock className="mr-2 h-4 w-4" />
                                                                Historial
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('generar boleta individual') && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setFichaId(row.estudiante_id);
                                                                    setFichaName(row.estudiante_name);
                                                                }}
                                                            >
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Ficha
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                                            <TableCell className="font-medium">{row.estudiante_name}</TableCell>

                                            {unidades.map((u) => {
                                                const key = String(u.id);
                                                const cell = row.notas[key] ?? null;
                                                const isActual = unidadActual?.id === u.id;

                                                if (isActual && canEdit) {
                                                    return (
                                                        <TableCell key={u.id} className="bg-blue-50/40 px-2 py-1.5 dark:bg-blue-950/10">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="1"
                                                                value={cell?.nota ?? ''}
                                                                onChange={(e) => updateCell(row.estudiante_id, u.id, 'nota', e.target.value)}
                                                                className={`mb-1 h-9 w-full [appearance:textfield] text-center font-mono tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${notaColor(cell?.nota ?? null)}`}
                                                                placeholder="—"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={cell?.observaciones ?? ''}
                                                                onChange={(e) => updateCell(row.estudiante_id, u.id, 'observaciones', e.target.value)}
                                                                className="h-7 w-full text-xs"
                                                                placeholder="Observación…"
                                                                maxLength={500}
                                                            />
                                                        </TableCell>
                                                    );
                                                }

                                                const n = cell?.nota;
                                                const obs = cell?.observaciones;
                                                return (
                                                    <TableCell key={u.id} className="px-2 py-1.5 text-center">
                                                        {n !== null && n !== undefined ? (
                                                            <span className={`font-mono tabular-nums ${notaColor(n)}`}>{Number(n).toFixed(0)}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground/30">—</span>
                                                        )}
                                                        {obs && (
                                                            <p className="mt-0.5 truncate text-xs text-muted-foreground italic" title={obs}>
                                                                {obs}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Historial dialog */}
            <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Historial — {historialTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {historialLoading ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
                        ) : historialLogs.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No hay historial registrado.</p>
                        ) : (
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Evento</TableHead>
                                        <TableHead className="text-center">Nota</TableHead>
                                        <TableHead className="text-center">Anterior</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historialLogs.map((log) => {
                                        const attrs = log.properties?.attributes ?? {};
                                        const old = log.properties?.old ?? {};
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString('es-GT')}
                                                </TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{log.causer?.name ?? 'Sistema'}</TableCell>
                                                <TableCell className="text-muted-foreground capitalize">{log.event ?? log.description}</TableCell>
                                                <TableCell className="text-center font-mono">
                                                    {attrs.nota != null ? String(attrs.nota) : '—'}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-muted-foreground">
                                                    {old.nota != null ? String(old.nota) : '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {attrs.observaciones ? String(attrs.observaciones) : '—'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Ficha PDF */}
            <PdfSheet
                open={fichaId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setFichaId(null);
                        setFichaName('');
                    }
                }}
                title={fichaName ? `Ficha — ${fichaName}` : 'Ficha académica'}
                description="Vista previa de la ficha académica del estudiante"
                pdfUrl={fichaPdfUrl}
                fileName={fichaFileName}
            >
                {null}
            </PdfSheet>
        </>
    );
}
