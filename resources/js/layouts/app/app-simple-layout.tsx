import AppLogo from '@/components/app-logo';
import { filterByPermission, mainNavItems } from '@/components/app-sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCan, useRoles } from '@/hooks/use-can';
import { useSimpleMode } from '@/hooks/use-simple-mode';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    CalendarRange,
    ChevronRight,
    FileText,
    Gauge,
    GraduationCap,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    NotebookText,
    Printer,
    RefreshCw,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';
import React, { type PropsWithChildren, useState } from 'react';

const ROLE_NAMES = ['super-admin', 'administrador', 'director', 'subdirector', 'secretario', 'catedratico', 'estudiante'];

interface QuickAction {
    title: string;
    href: string;
    icon: React.ElementType;
    colorClass: string;
    required?: string[];
}

interface ActionGroup {
    label: string;
    actions: QuickAction[];
}

const ACTION_GROUPS: ActionGroup[] = [
    {
        label: 'Dashboard y Reportes',
        actions: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, colorClass: 'bg-blue-500 text-white' },
            {
                title: 'Reportes',
                href: '/reportes',
                icon: Printer,
                colorClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                required: ['generar boleta individual'],
            },
            {
                title: 'Bitácora',
                href: '/bitacora',
                icon: Activity,
                colorClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                required: ['gestionar roles'],
            },
        ],
    },
    {
        label: 'Académico',
        actions: [
            {
                title: 'Secciones',
                href: '/secciones',
                icon: BookOpen,
                colorClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
                required: ['listar secciones'],
            },
            {
                title: 'Materias',
                href: '/materias',
                icon: FileText,
                colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                required: ['listar materias'],
            },
            {
                title: 'Unidades',
                href: '/unidades',
                icon: CalendarRange,
                colorClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
                required: ['listar unidades'],
            },
        ],
    },
    {
        label: 'Personas y Notas',
        actions: [
            {
                title: 'Estudiantes',
                href: '/estudiantes',
                icon: GraduationCap,
                colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                required: ['ver usuarios'],
            },
            {
                title: 'Catedráticos',
                href: '/catedraticos',
                icon: Users,
                colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
                required: ['ver usuarios'],
            },
            {
                title: 'Notas',
                href: '/notas',
                icon: NotebookText,
                colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                required: ['listar notas'],
            },
        ],
    },
    {
        label: 'Administración',
        actions: [
            {
                title: 'Usuarios',
                href: '/usuarios',
                icon: Users,
                colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                required: ['ver usuarios'],
            },
            {
                title: 'Roles y Permisos',
                href: '/roles-permisos',
                icon: ShieldCheck,
                colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                required: ['gestionar roles'],
            },
        ],
    },
];

function isAllowed(action: QuickAction, can: (r: string | string[]) => boolean, hasRole: (r: string | string[]) => boolean): boolean {
    if (!action.required?.length) return true;
    const isRole = action.required.some((r) => ROLE_NAMES.includes(r));
    return isRole ? hasRole(action.required) : can(action.required);
}

export default function AppSimpleLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: { title: string; href?: string }[] }>) {
    const { props } = usePage<{ auth: { user: { name: string; email: string } } }>();
    const auth = props.auth;
    const { updateSimpleMode } = useSimpleMode();
    const { can } = useCan();
    const { roles, hasRole } = useRoles();

    const [navOpen, setNavOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const isHome = currentUrl === '/dashboard' || currentUrl === '/';

    const isNavActive = (href?: string, exact = false) => {
        if (!href) return false;
        const target = href.replace(/\/+$/, '') || '/';
        if (exact) return currentUrl === target;
        return currentUrl === target || currentUrl.startsWith(`${target}/`);
    };

    const filteredNavItems = filterByPermission(mainNavItems, can, hasRole);

    const visibleGroups = ACTION_GROUPS.map((group) => ({
        ...group,
        actions: group.actions.filter((a) => isAllowed(a, can, hasRole)),
    })).filter((g) => g.actions.length > 0);

    const logout = () => router.post('/logout');

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => window.location.reload(), 300);
    };

    const initials = auth.user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-border bg-background">
                <div className="relative flex h-16 items-center px-4 sm:px-5">
                    {/* Izquierda: Logo + botón Menú (solo fuera del home) */}
                    <div className="flex shrink-0 items-center gap-3">
                        <Link href="/dashboard" className="flex shrink-0 cursor-pointer items-center gap-3">
                            <AppLogo />
                        </Link>
                        <button
                            data-size="icon"
                            onClick={() => setNavOpen(true)}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.97] active:opacity-80"
                        >
                            <Menu className="h-4 w-4 shrink-0" />
                            <span>Menú</span>
                        </button>
                    </div>

                    {/* Breadcrumbs — absolutamente centrados */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-24 sm:px-36">
                        <div className="pointer-events-auto flex min-w-0 items-center gap-2 overflow-hidden">
                            {!isHome ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                                    >
                                        <Home className="h-4 w-4" />
                                    </Link>
                                    {breadcrumbs.map((crumb, i) => (
                                        <span key={i} className="flex min-w-0 items-center gap-2">
                                            <span className="text-muted-foreground/30 select-none">/</span>
                                            {crumb.href ? (
                                                <Link
                                                    href={crumb.href}
                                                    className="cursor-pointer truncate text-base text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {crumb.title}
                                                </Link>
                                            ) : (
                                                <span className="truncate text-base font-semibold text-foreground">{crumb.title}</span>
                                            )}
                                        </span>
                                    ))}
                                </>
                            ) : (
                                <span className="text-base font-medium text-muted-foreground">Inicio</span>
                            )}
                        </div>
                    </div>

                    {/* Derecha: acciones */}
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        {/* Refresh */}
                        <button
                            data-size="icon"
                            onClick={handleRefresh}
                            title="Recargar página"
                            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                        </button>

                        <div className="mx-1 h-5 w-px bg-border" />

                        {/* Badge de iniciales + dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    data-size="icon"
                                    className="mr-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/20"
                                >
                                    {initials}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                {/* Identidad */}
                                <div className="px-3 py-3">
                                    <p className="truncate text-sm leading-tight font-semibold text-foreground">{auth.user.name}</p>
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{auth.user.email}</p>
                                    {roles.length > 0 && (
                                        <span className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                                            {roles[0]}
                                        </span>
                                    )}
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href="/settings/appearance" className="flex cursor-pointer items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Configuración
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => updateSimpleMode(false)} className="cursor-pointer gap-2">
                                    <Gauge className="h-4 w-4" />
                                    Salir del modo simple
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                                    <LogOut className="h-4 w-4 text-destructive" />
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Drawer lateral */}
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetContent
                    side="left"
                    className="w-[82vw] max-w-xs overflow-y-auto rounded-none border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:w-80 sm:max-w-sm"
                >
                    <SheetHeader className="border-b border-sidebar-border px-4 py-4">
                        <SheetTitle className="text-base font-bold text-sidebar-foreground">Navegación</SheetTitle>
                    </SheetHeader>
                    <div className="py-2">
                        {filteredNavItems.map((item, index) => {
                            const showDivider = item.divider && index > 0;
                            const hasChildren = !!item.items?.length;

                            if (!hasChildren) {
                                const active = isNavActive(item.href);
                                return (
                                    <React.Fragment key={item.title}>
                                        {showDivider && <div className="my-2 border-t border-sidebar-border/60" />}
                                        <Link
                                            href={item.href ?? '#'}
                                            onClick={() => setNavOpen(false)}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 border-l-[3px] py-3 pr-4 text-base transition-colors',
                                                active
                                                    ? 'border-primary bg-sidebar-accent/50 pl-[calc(1rem-3px)] font-semibold text-sidebar-accent-foreground'
                                                    : 'border-transparent pl-4 font-medium text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
                                            )}
                                        >
                                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </React.Fragment>
                                );
                            }

                            const parentActive = item.items!.some((c) => isNavActive(c.href));
                            return (
                                <React.Fragment key={item.title}>
                                    {showDivider && <div className="my-2 border-t border-sidebar-border/60" />}
                                    <Collapsible defaultOpen={parentActive} className="group/collapsible">
                                        <CollapsibleTrigger
                                            className={cn(
                                                'flex w-full cursor-pointer items-center gap-3 border-l-[3px] py-3 pr-4 text-base transition-colors',
                                                parentActive
                                                    ? 'border-primary/50 bg-sidebar-accent/30 pl-[calc(1rem-3px)] font-semibold text-sidebar-accent-foreground'
                                                    : 'border-transparent pl-4 font-medium text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
                                            )}
                                        >
                                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                            <span className="flex-1 text-left">{item.title}</span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="ml-4 flex flex-col border-l-[3px] border-primary/20">
                                                {item.items!.map((child) => {
                                                    const childActive = isNavActive(child.href, true);
                                                    return (
                                                        <Link
                                                            key={child.title}
                                                            href={child.href ?? '#'}
                                                            onClick={() => setNavOpen(false)}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2.5 border-l-[2px] py-2.5 pr-4 text-sm transition-colors',
                                                                childActive
                                                                    ? 'border-primary bg-sidebar-accent/50 pl-[calc(0.875rem-2px)] font-semibold text-sidebar-accent-foreground'
                                                                    : 'border-transparent pl-3.5 font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
                                                            )}
                                                        >
                                                            {child.icon && <child.icon className="h-4 w-4 shrink-0" />}
                                                            <span>{child.title}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── HOME: grid de acciones agrupadas ────────────────────── */}
            {isHome ? (
                <main className="flex-1 space-y-7 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
                    {visibleGroups.map((group) => (
                        <section key={group.label}>
                            {/* Divisor de sección */}
                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">{group.label}</span>
                                <div className="h-px flex-1 bg-border/60" />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {group.actions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-3 py-4 text-center transition-all duration-150 hover:border-primary/30 hover:bg-accent/40 active:scale-[0.97] sm:py-5"
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14',
                                                    action.colorClass,
                                                )}
                                            >
                                                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <span className="text-xs leading-tight font-semibold text-foreground sm:text-sm">{action.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </main>
            ) : (
                /* ── PÁGINAS INTERNAS ───────────────────────────────── */
                <main className="flex-1 overflow-x-hidden px-2 py-3 sm:px-3 sm:py-4">{children}</main>
            )}
        </div>
    );
}
