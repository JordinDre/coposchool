import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, UserX } from 'lucide-react';

export function ImpersonationBanner() {
    const { auth } = usePage<SharedData>().props;

    const isImpersonating = auth.impersonating ?? false;
    const impersonator = auth.impersonator;

    if (!isImpersonating || !impersonator) {
        return null;
    }

    return (
        <div className="m-0 w-full border-x-0 border-t-0 border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/50">
            <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-medium whitespace-nowrap text-amber-900 dark:text-amber-100">Estás suplantando a otro usuario</span>
                        <div className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                            <span className="whitespace-nowrap">Viendo como:</span>
                            <strong className="font-semibold text-amber-900 dark:text-amber-100">{auth.user?.name}</strong>
                            <span className="mx-1 text-amber-400 dark:text-amber-600">|</span>
                            <span className="whitespace-nowrap">Eres:</span>
                            <strong className="font-semibold text-amber-900 dark:text-amber-100">{impersonator.name}</strong>
                        </div>
                    </div>
                </div>
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-amber-300 bg-white font-medium hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:hover:bg-amber-900"
                >
                    <Link href={route('impersonate.leave')} className="flex items-center">
                        <UserX className="mr-2 h-4 w-4" />
                        Salir de Suplantación
                    </Link>
                </Button>
            </div>
        </div>
    );
}
