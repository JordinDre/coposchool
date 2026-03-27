import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

interface Configuracion {
    nombre_empresa: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    codigo_establecimiento: string | null;
    nivel_educativo: string | null;
    director_nombre: string | null;
    firma_cargo: string | null;
    encabezado_impresion: string | null;
    pie_impresion: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración de escuela', href: '/settings/company' },
];

Company.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Company({ configuracion }: { configuracion: Configuracion }) {
    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        nombre_empresa:         configuracion.nombre_empresa ?? '',
        email:                  configuracion.email ?? '',
        telefono:               configuracion.telefono ?? '',
        direccion:              configuracion.direccion ?? '',
        logo_url:               configuracion.logo_url ?? '',
        favicon_url:            configuracion.favicon_url ?? '',
        codigo_establecimiento: configuracion.codigo_establecimiento ?? '',
        nivel_educativo:        configuracion.nivel_educativo ?? '',
        director_nombre:        configuracion.director_nombre ?? '',
        firma_cargo:            configuracion.firma_cargo ?? '',
        encabezado_impresion:   configuracion.encabezado_impresion ?? '',
        pie_impresion:          configuracion.pie_impresion ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('configuracion.update'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Configuración de escuela" />

            <SettingsLayout>
                <form onSubmit={submit} className="space-y-10">
                    {/* ── Identidad ── */}
                    <div className="space-y-5">
                        <HeadingSmall
                            title="Identidad de la escuela"
                            description="Nombre, logo y datos que aparecen en el sistema y en los documentos"
                        />

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre_empresa">Nombre de la institución *</Label>
                                <Input
                                    id="nombre_empresa"
                                    value={data.nombre_empresa}
                                    onChange={(e) => setData('nombre_empresa', e.target.value)}
                                    placeholder="Ej. Instituto Nacional de Educación Básica"
                                />
                                <InputError message={errors.nombre_empresa} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="codigo_establecimiento">Código de establecimiento</Label>
                                    <Input
                                        id="codigo_establecimiento"
                                        value={data.codigo_establecimiento}
                                        onChange={(e) => setData('codigo_establecimiento', e.target.value)}
                                        placeholder="Ej. 01-01-0001"
                                    />
                                    <InputError message={errors.codigo_establecimiento} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nivel_educativo">Nivel educativo</Label>
                                    <Select
                                        value={data.nivel_educativo}
                                        onValueChange={(v) => setData('nivel_educativo', v)}
                                    >
                                        <SelectTrigger id="nivel_educativo">
                                            <SelectValue placeholder="Seleccionar nivel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="primaria">Primaria</SelectItem>
                                            <SelectItem value="basicos">Básicos</SelectItem>
                                            <SelectItem value="diversificado">Diversificado</SelectItem>
                                            <SelectItem value="mixto">Mixto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.nivel_educativo} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="logo_url">URL del logo</Label>
                                    <Input
                                        id="logo_url"
                                        value={data.logo_url}
                                        onChange={(e) => setData('logo_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-muted-foreground">PNG transparente recomendado</p>
                                    <InputError message={errors.logo_url} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="favicon_url">URL del favicon</Label>
                                    <Input
                                        id="favicon_url"
                                        value={data.favicon_url}
                                        onChange={(e) => setData('favicon_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-muted-foreground">PNG 32×32 recomendado</p>
                                    <InputError message={errors.favicon_url} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Contacto ── */}
                    <div className="space-y-5">
                        <HeadingSmall
                            title="Contacto"
                            description="Datos de contacto visibles en documentos e información institucional"
                        />

                        <div className="grid gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contacto@institucion.edu.gt"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono"
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        placeholder="Ej. 2222-3333"
                                    />
                                    <InputError message={errors.telefono} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input
                                    id="direccion"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    placeholder="Ej. 6a Calle 0-60, Zona 10, Guatemala"
                                />
                                <InputError message={errors.direccion} />
                            </div>
                        </div>
                    </div>

                    {/* ── Impresión ── */}
                    <div className="space-y-5">
                        <HeadingSmall
                            title="Impresión y documentos"
                            description="Información que aparece en reportes, boletas y constancias impresas"
                        />

                        <div className="grid gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="director_nombre">Nombre del director(a)</Label>
                                    <Input
                                        id="director_nombre"
                                        value={data.director_nombre}
                                        onChange={(e) => setData('director_nombre', e.target.value)}
                                        placeholder="Ej. Lic. Juan Pérez"
                                    />
                                    <InputError message={errors.director_nombre} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="firma_cargo">Cargo en firma</Label>
                                    <Input
                                        id="firma_cargo"
                                        value={data.firma_cargo}
                                        onChange={(e) => setData('firma_cargo', e.target.value)}
                                        placeholder="Ej. Director(a)"
                                    />
                                    <InputError message={errors.firma_cargo} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="encabezado_impresion">Encabezado de impresión</Label>
                                <Textarea
                                    id="encabezado_impresion"
                                    value={data.encabezado_impresion}
                                    onChange={(e) => setData('encabezado_impresion', e.target.value)}
                                    placeholder="Texto que aparecerá en la parte superior de documentos impresos"
                                    rows={3}
                                />
                                <InputError message={errors.encabezado_impresion} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pie_impresion">Pie de página de impresión</Label>
                                <Textarea
                                    id="pie_impresion"
                                    value={data.pie_impresion}
                                    onChange={(e) => setData('pie_impresion', e.target.value)}
                                    placeholder="Texto que aparecerá en la parte inferior de documentos impresos"
                                    rows={2}
                                />
                                <InputError message={errors.pie_impresion} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>Guardar</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Guardado</p>
                        </Transition>
                    </div>
                </form>
            </SettingsLayout>
        </>
    );
}
