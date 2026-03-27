// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout title="Verificar email" description="Por favor, verifica tu email haciendo clic en el enlace que te acabamos de enviar.">
            <Head title="Verificar email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Se ha enviado un nuevo enlace de verificación a la dirección de email que proporcionaste durante el registro.
                </div>
            )}

            <Form method="post" action={route('verification.send')} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Reenviar email de verificación
                        </Button>

                        <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                            Cerrar sesión
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
