import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface Role { id: number; name: string }

interface CreateProps {
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Crear Usuario', href: '#' },
];

Create.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Create({ roles }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        telefono: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const toggleRole = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter((id) => id !== roleId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('usuarios.store'));
    };

    return (
        <>
            <Head title="Crear Usuario" />
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nombre completo"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
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
                            <Label htmlFor="password">Contraseña *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirmar Contraseña *</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Roles *</Label>
                        {errors.roles && <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle className="h-3 w-3" />{errors.roles}</p>}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {roles.map((role) => (
                                <label key={role.id} className="flex cursor-pointer items-center gap-2 rounded-md border bg-card p-2 hover:bg-muted/50">
                                    <Checkbox
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={(c) => toggleRole(role.id, c as boolean)}
                                    />
                                    <span className="text-sm capitalize">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} color="green">
                            {processing ? 'Guardando...' : 'Crear Usuario'}
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
