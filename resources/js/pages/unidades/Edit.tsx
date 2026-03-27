import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface EditProps {
    unidad: { id: number; nombre: string; descripcion?: string | null; orden: number | null; ciclo_escolar: number | null; fecha_inicio?: string | null; fecha_fin?: string | null };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unidades', href: '/unidades' },
    { title: 'Editar Unidad', href: '#' },
];

Edit.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Edit({ unidad }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: unidad.nombre ?? '',
        descripcion: unidad.descripcion ?? '',
        orden: (unidad.orden ?? 1).toString(),
        ciclo_escolar: (unidad.ciclo_escolar ?? new Date().getFullYear()).toString(),
        fecha_inicio: unidad.fecha_inicio ?? '',
        fecha_fin: unidad.fecha_fin ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('unidades.update', unidad.id));
    };

    return (
        <>
            <Head title="Editar Unidad" />
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                className={errors.nombre ? 'border-red-500' : ''}
                            />
                            {errors.nombre && <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle className="h-3 w-3" />{errors.nombre}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orden">Orden *</Label>
                            <Input
                                id="orden"
                                type="number"
                                min="1"
                                max="20"
                                value={data.orden}
                                onChange={(e) => setData('orden', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ciclo_escolar">Ciclo Escolar *</Label>
                            <Input
                                id="ciclo_escolar"
                                type="number"
                                value={data.ciclo_escolar}
                                onChange={(e) => setData('ciclo_escolar', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                            <Input
                                id="fecha_inicio"
                                type="date"
                                value={data.fecha_inicio}
                                onChange={(e) => setData('fecha_inicio', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_fin">Fecha fin</Label>
                            <Input
                                id="fecha_fin"
                                type="date"
                                value={data.fecha_fin}
                                onChange={(e) => setData('fecha_fin', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} color="green">
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
