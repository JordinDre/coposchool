import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        // Detectar si el usuario regresó mediante el historial (bfcache)
        // y forzar una recarga para que el servidor valide la sesión actual.
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            reset('password');
        };
    }, [reset]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            replace: true,
        });
    };

    const { branding } = usePage().props as unknown as { branding?: { icon?: { favicon?: string }; company?: { name?: string } } };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Head title="Iniciar Sesión" />

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/" className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-4 flex items-center justify-center">
                                <img src="/images/logoDark.png" alt="COPO POS" className="h-12 w-auto dark:hidden" />
                                <img src="/images/logoLigth.png" alt="COPO POS" className="hidden h-12 w-auto dark:block" />
                            </div>
                            <span className="sr-only">COPO POS</span>
                        </Link>

                        <div className="space-y-1 text-center">
                            <div className="flex justify-center">
                                {branding?.icon?.favicon && !branding.icon.favicon.includes('icon.png') ? (
                                    <img src={branding.icon.favicon} alt={branding.company?.name} className="h-8 w-auto" />
                                ) : (
                                    <h1 className="text-xl font-bold tracking-tight">POS</h1>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    placeholder="nombre@empresa.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="ml-auto text-sm underline-offset-4 hover:underline">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', !!checked)}
                                />
                                <Label htmlFor="remember">Recordar</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Iniciar Sesión
                            </Button>
                        </div>
                    </form>

                    {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                </div>
            </div>
        </div>
    );
}
