import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

const CICLOS = ['pre-primaria', 'kinder', 'primaria', 'basico', 'diversificado'] as const;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Crear Sección', href: '#' },
];

Create.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        ciclo: '' as (typeof CICLOS)[number] | '',
        descripcion: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('secciones.store'));
    };

    return (
        <>
            <Head title="Crear Sección" />
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                placeholder="Ej: 1ro Bachillerato A"
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
                            <Label htmlFor="ciclo">Ciclo *</Label>
                            <Select value={data.ciclo} onValueChange={(v) => setData('ciclo', v as (typeof CICLOS)[number])}>
                                <SelectTrigger className={errors.ciclo ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Seleccionar ciclo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CICLOS.map((c) => (
                                        <SelectItem key={c} value={c} className="capitalize">
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ciclo && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.ciclo}
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
                            placeholder="Descripción opcional de la sección..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} color="green">
                            {processing ? 'Guardando...' : 'Crear Sección'}
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
