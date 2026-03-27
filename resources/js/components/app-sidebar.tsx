import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useCan } from '@/hooks/use-can';
import { useRoles } from '@/hooks/use-roles';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Activity, BookOpen, CalendarRange, GraduationCap, LayoutGrid, NotebookText, Printer, ShieldCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },

    // ===== Académico =====
    {
        title: 'Secciones',
        href: '/secciones',
        icon: GraduationCap,
        divider: true,
        required: ['listar secciones'],
    },
    {
        title: 'Materias',
        href: '/materias',
        icon: BookOpen,
        required: ['listar materias'],
    },
    {
        title: 'Unidades',
        href: '/unidades',
        icon: CalendarRange,
        required: ['listar unidades'],
    },
    // ===== Personas =====
    {
        title: 'Estudiantes',
        href: '/estudiantes',
        icon: GraduationCap,
        divider: true,
        required: ['ver usuarios'],
    },
    {
        title: 'Catedráticos',
        href: '/catedraticos',
        icon: Users,
        required: ['ver usuarios'],
    },
    {
        title: 'Notas',
        href: '/notas',
        icon: NotebookText,
        required: ['listar notas'],
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: Printer,
        required: ['generar boleta individual'],
    },

    // ===== Administración =====
    {
        title: 'Usuarios',
        href: '/usuarios',
        icon: Users,
        divider: true,
        required: ['ver usuarios'],
    },
    {
        title: 'Roles y Permisos',
        href: '/roles-permisos',
        icon: ShieldCheck,
        required: ['gestionar roles'],
    },
    {
        title: 'Bitácora',
        href: '/bitacora',
        icon: Activity,
        required: ['gestionar roles'],
    },
];

function filterByPermission(
    items: NavItem[],
    can: (r: string | string[]) => boolean,
    hasRole: (r: string | string[]) => boolean,
): NavItem[] {
    return items
        .map((item) => {
            if (!item.required) {
                if (item.items) {
                    return {
                        ...item,
                        items: filterByPermission(item.items, can, hasRole),
                    };
                }
                return item;
            }

            const isRole = item.required.some((req) =>
                ['super-admin', 'administrador', 'director', 'subdirector', 'secretario', 'catedratico', 'estudiante'].includes(req),
            );

            const allowed = isRole ? hasRole(item.required) : can(item.required);
            if (!allowed) return null;

            if (item.items) {
                return {
                    ...item,
                    items: filterByPermission(item.items, can, hasRole),
                };
            }

            return item;
        })
        .filter(Boolean) as NavItem[];
}

export function AppSidebar() {
    const { can } = useCan();
    const { hasRole } = useRoles();

    const filteredItems = filterByPermission(mainNavItems, can, hasRole);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredItems} footerItems={[]} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
