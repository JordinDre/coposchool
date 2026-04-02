import AppearanceToggleTab from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSimpleMode } from '@/hooks/use-simple-mode';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { CalendarDays, Gauge, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { simpleMode, toggleSimpleMode } = useSimpleMode();
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
                    onClick={handleRefresh}
                    title="Recargar página"
                >
                    <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>

                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSimpleMode}
                                className={cn(
                                    'h-8 w-8 transition-colors sm:h-9 sm:w-9',
                                    simpleMode ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground',
                                )}
                                aria-label="Modo simple"
                            >
                                <Gauge className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{simpleMode ? 'Desactivar modo simple' : 'Activar modo simple'}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {unidadActual && (
                    <div className="hidden items-center gap-2 sm:flex">
                        <Badge
                            variant="outline"
                            className="h-8 gap-1.5 border-sidebar-border/50 bg-sidebar-accent/50 text-sidebar-foreground shadow-xs"
                        >
                            <CalendarDays className="size-3.5 text-muted-foreground" />
                            <span className="hidden text-muted-foreground lg:inline">Unidad:</span>
                            <span className="font-semibold">
                                {unidadActual.orden}. {unidadActual.nombre}
                            </span>
                            {unidadActual.ciclo_escolar && (
                                <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                    {unidadActual.ciclo_escolar}
                                </span>
                            )}
                        </Badge>
                    </div>
                )}

                <AppearanceToggleTab className="hidden h-8 origin-right scale-90 sm:inline-flex sm:h-9 sm:scale-100" />
            </div>
        </header>
    );
}
