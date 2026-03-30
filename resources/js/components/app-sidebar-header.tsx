import AppearanceToggleTab from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useState } from 'react';

function fmt(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { unidadActual } = usePage().props as {
        unidadActual?: { id: number; nombre: string; orden: number; ciclo_escolar?: number; fecha_inicio?: string; fecha_fin?: string } | null;
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 300);
    };

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:px-4 md:px-6">
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                {unidadActual && (
                    <div className="hidden items-center gap-1.5 rounded-md border bg-primary/5 px-2.5 py-1 sm:flex">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">
                            {unidadActual.ciclo_escolar && <span className="text-muted-foreground">{unidadActual.ciclo_escolar} · </span>}
                            {unidadActual.orden}. {unidadActual.nombre}
                        </span>
                        {(unidadActual.fecha_inicio || unidadActual.fecha_fin) && (
                            <span className="text-xs text-muted-foreground">
                                {fmt(unidadActual.fecha_inicio)}–{fmt(unidadActual.fecha_fin)}
                            </span>
                        )}
                        <Badge variant="default" className="h-4 px-1.5 text-[10px]">
                            Activa
                        </Badge>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
                    onClick={handleRefresh}
                    title="Recargar página"
                >
                    <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>
                <AppearanceToggleTab className="hidden h-8 origin-right scale-90 sm:inline-flex sm:h-9 sm:scale-100" />
            </div>
        </header>
    );
}
