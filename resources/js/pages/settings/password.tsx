import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de contraseña',
        href: '/settings/password',
    },
];

Password.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
        logout_sessions: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
            onSuccess: () => {
                setData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                    logout_sessions: false,
                });
            },
        });
    };

    return (
        <>
            <Head title="Configuración de contraseña" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Actualizar contraseña"
                        description="Asegura que tu cuenta esté usando una contraseña larga y aleatoria para mantenerse segura"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Contraseña actual</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                name="current_password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Contraseña actual"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nueva contraseña</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Nueva contraseña"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar contraseña</Label>

                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Confirmar contraseña"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center space-x-2 rounded-md border p-4">
                            <Checkbox
                                id="logout_sessions"
                                name="logout_sessions"
                                checked={data.logout_sessions}
                                onCheckedChange={(checked) => setData('logout_sessions', checked as boolean)}
                                className="cursor-pointer"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="logout_sessions"
                                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Cerrar sesiones en todos los dispositivos
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Al marcar esta opción, se cerrarán todas tus sesiones activas en otros dispositivos. Deberás iniciar sesión
                                    nuevamente en todos los dispositivos.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Guardar contraseña</Button>

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
                </div>
            </SettingsLayout>
        </>
    );
}
