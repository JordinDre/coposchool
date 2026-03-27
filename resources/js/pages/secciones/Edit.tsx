import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

const CICLOS = ['pre-primaria', 'kinder', 'primaria', 'basico', 'diversificado'] as const;

interface EditProps {
    seccion: { id: number; nombre: string; ciclo: string; ciclo_escolar: number | null; descripcion?: string | null };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Editar Sección', href: '#' },
];

Edit.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Edit({ seccion }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        nombre:        seccion.nombre ?? '',
        ciclo:         (seccion.ciclo ?? 'basico') as typeof CICLOS[number],
        ciclo_escolar: (seccion.ciclo_escolar ?? new Date().getFullYear()).toString(),
        descripcion:   seccion.descripcion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('secciones.update', seccion.id));
    };

    return (
        <>
            <Head title="Editar Sección" />
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos básicos */}
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
                            <Label>Ciclo *</Label>
                            <Select value={data.ciclo} onValueChange={(v) => setData('ciclo', v as typeof CICLOS[number])}>
                                <SelectTrigger className={errors.ciclo ? 'border-red-500' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CICLOS.map((c) => (
                                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Link href={`/secciones/${seccion.id}/materias`}>
                            <Button type="button" variant="outline">Asignar materias</Button>
                        </Link>
                        <Link href={`/secciones/${seccion.id}/inscribir`}>
                            <Button type="button" variant="outline">Inscribir estudiantes</Button>
                        </Link>
                        <Button type="button" variant="outline" onClick={() => history.back()}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
