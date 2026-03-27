import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, FileEdit, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Filter from './Filter';

interface Tarea {
    id: number;
    nombre: string;
    descripcion?: string;
    valor: number;
    seccion_id: number;
    materia_id: number;
    unidad_id: number;
}

interface Estudiante {
    id: number;
    name: string;
    email: string;
}

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

interface IndexProps {
    secciones: Seccion[];
    materias: Materia[];
    unidades: Unidad[];
    tareas: Tarea[];
    estudiantes: Estudiante[];
    notasGrid: Record<number, Record<number, { nota: number | null; observaciones: string | null }>>;
    contexto?: {
        seccion: Seccion;
        materia: Materia;
        unidad: Unidad;
    };
    filtros: { seccion_id: string; materia_id: string; unidad_id: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tareas', href: '/tareas' }];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Index({ secciones, materias, unidades, tareas, estudiantes, notasGrid, contexto, filtros }: IndexProps) {
    const { can } = useCan();
    const [tareaDialog, setTareaDialog] = useState<{ open: boolean; tarea: Tarea | null }>({ open: false, tarea: null });
    const [isSaving, setIsSaving] = useState(false);
    
    // Form fields for Tarea
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [valor, setValor] = useState('');

    // Calificar Dialog
    const [calificarDialog, setCalificarDialog] = useState<{ open: boolean; tarea: Tarea | null }>({ open: false, tarea: null });
    const [formNotas, setFormNotas] = useState<Record<number, { nota: string; observaciones: string }>>({});

    const sumaActual = tareas.reduce((acc, t) => acc + Number(t.valor), 0);

    const openCreate = () => {
        setNombre('');
        setDescripcion('');
        setValor('');
        setTareaDialog({ open: true, tarea: null });
    };

    const openEdit = (t: Tarea) => {
        setNombre(t.nombre);
        setDescripcion(t.descripcion || '');
        setValor(String(t.valor));
        setTareaDialog({ open: true, tarea: t });
    };

    const saveTarea = () => {
        if (!nombre || !valor) return;
        setIsSaving(true);
        const data = {
            seccion_id: filtros.seccion_id,
            materia_id: filtros.materia_id,
            unidad_id: filtros.unidad_id,
            nombre,
            descripcion,
            valor: parseFloat(valor)
        };

        if (tareaDialog.tarea) {
            router.put(route('tareas.update', tareaDialog.tarea.id), data, {
                onSuccess: () => setTareaDialog({ open: false, tarea: null }),
                onFinish: () => setIsSaving(false)
            });
        } else {
            router.post(route('tareas.store'), data, {
                onSuccess: () => setTareaDialog({ open: false, tarea: null }),
                onError: (e) => {
                    toast.error(e.valor || 'Error al guardar la tarea');
                },
                onFinish: () => setIsSaving(false)
            });
        }
    };

    const deleteTarea = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta tarea? Se eliminarán también las calificaciones de los estudiantes y se recalculará la nota.')) {
            router.delete(route('tareas.destroy', id));
        }
    };

    const openCalificar = (t: Tarea) => {
        const initialForm: Record<number, { nota: string; observaciones: string }> = {};
        estudiantes.forEach(est => {
            const grade = notasGrid[t.id]?.[est.id];
            initialForm[est.id] = {
                nota: grade?.nota !== null && grade?.nota !== undefined ? String(grade.nota) : '',
                observaciones: grade?.observaciones || ''
            };
        });
        setFormNotas(initialForm);
        setCalificarDialog({ open: true, tarea: t });
    };

    const saveCalificaciones = () => {
        if (!calificarDialog.tarea) return;
        setIsSaving(true);

        const payload = Object.entries(formNotas).map(([estudiante_id, data]) => ({
            estudiante_id: parseInt(estudiante_id),
            nota: data.nota !== '' ? parseFloat(data.nota) : null,
            observaciones: data.observaciones || null
        }));

        router.post(route('tareas.bulk-notas'), {
            tarea_id: calificarDialog.tarea.id,
            notas: payload
        }, {
            onSuccess: () => setCalificarDialog({ open: false, tarea: null }),
            onError: () => toast.error('Error al guardar calificaciones (Verifique que no excedan el valor de la tarea)'),
            onFinish: () => setIsSaving(false)
        });
    };

    const handleGradeChange = (estId: number, field: 'nota' | 'observaciones', value: string) => {
        setFormNotas(prev => ({
            ...prev,
            [estId]: {
                ...prev[estId],
                [field]: value
            }
        }));
    };

    const allSelected = filtros.seccion_id && filtros.materia_id && filtros.unidad_id;

    return (
        <>
            <Head title="Tareas y Actividades" />

            <div className="p-3">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                    <Filter secciones={secciones} materias={materias} unidades={unidades} filtros={filtros} />
                    {can('crear tareas') && (
                        <Button
                            onClick={(e) => {
                                if (!allSelected) {
                                    e.preventDefault();
                                    alert('Debes seleccionar una Sección, Materia y Unidad en la barra superior para poder crearles una tarea.');
                                    return;
                                }
                                if (sumaActual >= 100) {
                                    e.preventDefault();
                                    alert('Ya se alcanzó el límite de 100 puntos para esta unidad.');
                                    return;
                                }
                                openCreate();
                            }}
                            className="shrink-0"
                            size="sm"
                            color="blue"
                        >
                            Crear Tarea
                        </Button>
                    )}
                </div>

                {!allSelected ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                        <p>Seleccione una sección, materia y unidad para ver y gestionar tareas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-3 mb-2 border">
                            <div className="space-y-1">
                                <h2 className="text-base font-medium tracking-tight">
                                    {contexto?.materia.nombre}
                                    <span className="text-muted-foreground font-normal ml-2">({contexto?.seccion.nombre})</span>
                                </h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="font-normal">{contexto?.unidad.nombre}</Badge>
                                    <span>Valor total acumulado: <span className={sumaActual >= 100 ? "text-destructive font-semibold" : "font-semibold text-foreground"}>{sumaActual}/100 pts</span></span>
                                </p>
                            </div>
                        </div>

                        {tareas.length === 0 ? (
                            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                                No se encontraron tareas para esta unidad.
                            </div>
                        ) : (
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead className="w-24 text-right">Valor</TableHead>
                                            <TableHead className="w-[180px] text-center">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tareas.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium">{t.nombre}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">{t.descripcion || '—'}</TableCell>
                                                <TableCell className="text-right tabular-nums">{t.valor} pts</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {can('calificar tareas') && (
                                                            <Button variant="secondary" size="sm" onClick={() => openCalificar(t)}>
                                                                Calificar
                                                            </Button>
                                                        )}
                                                        {can('editar tareas') && (
                                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => openEdit(t)}>
                                                                <FileEdit className="h-4 w-4 mr-1" /> Editar
                                                            </Button>
                                                        )}
                                                        {can('eliminar tareas') && (
                                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => deleteTarea(t.id)}>
                                                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                                            </Button>
                                                        )}
                                                    </div>
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

            {/* Dialogo crear/editar tarea */}
            <Dialog open={tareaDialog.open} onOpenChange={(o) => !o && setTareaDialog({ open: false, tarea: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{tareaDialog.tarea ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                        <DialogDescription>
                            Configure los detalles de la actividad. El valor máximo no puede hacer que el total de la unidad exceda 100 puntos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nombre">Nombre de la tarea</Label>
                            <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Laboratorio 1" autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="descripcion">Descripción (opcional)</Label>
                            <Textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="valor">Valor en puntos</Label>
                            <Input id="valor" type="number" step="0.01" min="0" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ej. 10" />
                            {!tareaDialog.tarea && (
                                <p className="text-xs text-muted-foreground mt-1">Puntos disponibles para asignar: {100 - sumaActual}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTareaDialog({ open: false, tarea: null })}>Cancelar</Button>
                        <Button onClick={saveTarea} disabled={isSaving || !nombre || !valor}>Guardar Tarea</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialogo calificar tarea */}
            <Dialog open={calificarDialog.open} onOpenChange={(o) => !o && setCalificarDialog({ open: false, tarea: null })}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>Calificar — {calificarDialog.tarea?.nombre}</DialogTitle>
                        <DialogDescription>
                            Valor máximo: {calificarDialog.tarea?.valor} pts. Guarde los cambios al terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4 border-y">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>Estudiante</TableHead>
                                    <TableHead className="w-32">Nota (/{calificarDialog.tarea?.valor})</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estudiantes.map(est => (
                                    <TableRow key={est.id}>
                                        <TableCell className="py-2">
                                            <div className="font-medium text-sm">{est.name}</div>
                                            <div className="text-xs text-muted-foreground">{est.email}</div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={calificarDialog.tarea?.valor}
                                                className="h-8 font-mono text-center"
                                                value={formNotas[est.id]?.nota ?? ''}
                                                onChange={e => handleGradeChange(est.id, 'nota', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Input
                                                type="text"
                                                className="h-8 text-xs"
                                                placeholder="Comentario opcional..."
                                                value={formNotas[est.id]?.observaciones ?? ''}
                                                onChange={e => handleGradeChange(est.id, 'observaciones', e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="shrink-0 pt-4">
                        <Button variant="outline" onClick={() => setCalificarDialog({ open: false, tarea: null })}>Cerrar</Button>
                        <Button onClick={saveCalificaciones} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Guardando...' : 'Guardar Notas'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
