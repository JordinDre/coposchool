import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}

interface Estudiante {
    id: number;
    name: string;
    telefono?: string;
}

interface EditProps {
    estudiante: Estudiante;
    secciones: Seccion[];
    seccionesInscritas: number[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Editar Estudiante', href: '#' },
];

Edit.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Edit({ estudiante, secciones, seccionesInscritas }: EditProps) {
    const currentSeccion = seccionesInscritas[0] ?? null;

    const {
        data,
        setData,
        put,
        processing,
        errors: fieldErrors,
    } = useForm({
        name: estudiante.name,
        telefono: estudiante.telefono || '',
        seccion_id: currentSeccion ? String(currentSeccion) : ('' as string),
    });

    return (
        <>
            <Head title="Editar Estudiante" />
            <div className="p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        put(route('estudiantes.update', estudiante.id));
                    }}
                    className="space-y-6"
                >
                    {(fieldErrors as Record<string, string>).error && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {(fieldErrors as Record<string, string>).error}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={fieldErrors.name ? 'border-red-500' : ''}
                            />
                            {fieldErrors.name && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                placeholder="Número de teléfono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sección *</Label>
                            <Select value={data.seccion_id} onValueChange={(v) => setData('seccion_id', v)}>
                                <SelectTrigger className={fieldErrors.seccion_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona una sección" />
                                </SelectTrigger>
                                <SelectContent>
                                    {secciones.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.nombre} · {s.ciclo} {s.ciclo_escolar}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldErrors.seccion_id && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.seccion_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => history.back()}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
