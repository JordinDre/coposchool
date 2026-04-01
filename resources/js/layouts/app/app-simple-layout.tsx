import AppLogo from '@/components/app-logo';
import { filterByPermission, mainNavItems } from '@/components/app-sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCan, useRoles } from '@/hooks/use-can';
import { useSimpleMode } from '@/hooks/use-simple-mode';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    CalendarRange,
    ChevronDown,
    ChevronRight,
    GraduationCap,
    Home,
    LayoutGrid,
    LogOut,
    NotebookText,
    Printer,
    Settings,
    ShieldCheck,
    Users,
    X,
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
        label: 'Académico',
        actions: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, colorClass: 'bg-blue-500 text-white' },
            { title: 'Secciones', href: '/secciones', icon: GraduationCap, colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', required: ['listar secciones'] },
            { title: 'Materias', href: '/materias', icon: BookOpen, colorClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', required: ['listar materias'] },
            { title: 'Unidades', href: '/unidades', icon: CalendarRange, colorClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', required: ['listar unidades'] },
        ],
    },
    {
        label: 'Personas y Notas',
        actions: [
            { title: 'Estudiantes', href: '/estudiantes', icon: GraduationCap, colorClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', required: ['ver usuarios'] },
            { title: 'Catedráticos', href: '/catedraticos', icon: Users, colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', required: ['ver usuarios'] },
            { title: 'Notas', href: '/notas', icon: NotebookText, colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', required: ['listar notas'] },
            { title: 'Reportes', href: '/reportes', icon: Printer, colorClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', required: ['generar boleta individual'] },
        ],
    },
    {
        label: 'Administración',
        actions: [
            { title: 'Usuarios', href: '/usuarios', icon: Users, colorClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', required: ['ver usuarios'] },
            { title: 'Roles y Permisos', href: '/roles-permisos', icon: ShieldCheck, colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', required: ['gestionar roles'] },
            { title: 'Bitácora', href: '/bitacora', icon: Activity, colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', required: ['gestionar roles'] },
        ],
    },
];

function isAllowed(
    action: QuickAction,
    can: (r: string | string[]) => boolean,
    hasRole: (r: string | string[]) => boolean,
): boolean {
    if (!action.required?.length) return true;
    const isRole = action.required.some((r) => ROLE_NAMES.includes(r));
    return isRole ? hasRole(action.required) : can(action.required);
}

export default function AppSimpleLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: { title: string; href?: string }[] }>) {
    const { props } = usePage<any>();
    const auth = props.auth;
    const { updateSimpleMode } = useSimpleMode();
    const { can } = useCan();
    const { hasRole } = useRoles();

    const [navOpen, setNavOpen] = useState(false);
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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 shrink-0 cursor-pointer">
                        <AppLogo />
                    </Link>
                    <div className="flex-1 min-w-0" />
                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[140px] lg:max-w-[220px]">
                            {auth.user.name}
                        </span>
                        <Link
                            href="/settings/appearance"
                            title="Configuración"
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => updateSimpleMode(false)}
                            title="Salir del modo simple"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 sm:px-3 h-9 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Modo simple</span>
                        </button>
                        <button
                            onClick={logout}
                            title="Cerrar sesión"
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            {isHome ? (
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
                    {visibleGroups.map((group) => (
                        <section key={group.label}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {group.label}
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {group.actions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:gap-3 sm:p-5"
                                        >
                                            <div className={cn(
                                                'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl',
                                                action.colorClass,
                                            )}>
                                                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
                                                {action.title}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </main>
            ) : (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="border-b border-border bg-muted/30">
                        <div className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6">
                            <div className="flex flex-1 flex-wrap items-center gap-1.5">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <Home className="h-3.5 w-3.5 shrink-0" />
                                    <span>Inicio</span>
                                </Link>
                                {breadcrumbs.map((crumb, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <span className="select-none text-muted-foreground/40">/</span>
                                        {crumb.href ? (
                                            <Link
                                                href={crumb.href}
                                                className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {crumb.title}
                                            </Link>
                                        ) : (
                                            <span className="max-w-[160px] truncate text-sm font-medium text-foreground sm:max-w-none">
                                                {crumb.title}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => setNavOpen(true)}
                                className="inline-flex cursor-pointer shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Navegación</span>
                            </button>
                        </div>
                    </div>

                    <Sheet open={navOpen} onOpenChange={setNavOpen}>
                        <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-72 sm:max-w-xs overflow-y-auto p-0 border-r border-sidebar-border">
                            <SheetHeader className="px-4 py-3 border-b border-sidebar-border">
                                <SheetTitle className="text-sidebar-foreground font-semibold">Navegación</SheetTitle>
                            </SheetHeader>
                            <div className="px-2 py-2">
                                <p className="mb-1 px-2 py-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">
                                    Menú
                                </p>
                                {filteredNavItems.map((item, index) => {
                                    const showDivider = item.divider && index > 0;
                                    const hasChildren = !!item.items?.length;

                                    if (!hasChildren) {
                                        const active = isNavActive(item.href);
                                        return (
                                            <React.Fragment key={item.title}>
                                                {showDivider && <div className="my-2 border-t border-sidebar-border" />}
                                                <Link
                                                    href={item.href ?? '#'}
                                                    onClick={() => setNavOpen(false)}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                        active
                                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                                    )}
                                                >
                                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </React.Fragment>
                                        );
                                    }

                                    const parentActive = item.items!.some((c) => isNavActive(c.href));
                                    return (
                                        <React.Fragment key={item.title}>
                                            {showDivider && <div className="my-2 border-t border-sidebar-border" />}
                                            <Collapsible defaultOpen={parentActive} className="group/collapsible">
                                                <CollapsibleTrigger className={cn(
                                                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                    parentActive
                                                        ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
                                                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                                )}>
                                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                    <span className="flex-1 text-left">{item.title}</span>
                                                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="ml-6 mt-1 flex flex-col gap-0.5 sm:ml-4">
                                                        {item.items!.map((child) => {
                                                            const childActive = isNavActive(child.href, true);
                                                            return (
                                                                <Link
                                                                    key={child.title}
                                                                    href={child.href ?? '#'}
                                                                    onClick={() => setNavOpen(false)}
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                                                                        childActive
                                                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
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

                    <main className="flex-1 overflow-x-hidden px-2 py-3 sm:px-3 sm:py-4">
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}
