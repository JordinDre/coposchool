import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Materias', href: '/materias' },
    { title: 'Crear Materia', href: '#' },
];

Create.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        descripcion: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('materias.store'));
    };

    return (
        <>
            <Head title="Crear Materia" />
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                placeholder="Ej: Matemáticas"
                                className={errors.nombre ? 'border-red-500' : ''}
                            />
                            {errors.nombre && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.nombre}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código</Label>
                            <Input
                                id="codigo"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                placeholder="Ej: MAT-01"
                                className={errors.codigo ? 'border-red-500' : ''}
                            />
                            {errors.codigo && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.codigo}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                            placeholder="Descripción opcional..."
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} color="green">
                            {processing ? 'Guardando...' : 'Crear Materia'}
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
