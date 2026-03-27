import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

function normalizePath(path?: string): string {
    if (!path) return '';
    try {
        // Asegura que siempre obtengamos pathname sin query/hash
        const url = new URL(path, window.location.origin);
        const pathname = url.pathname;
        // quita slash final excepto en raíz
        return pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    } catch {
        // fallback si fuese ruta relativa rara
        const cleaned = path.split('#')[0].split('?')[0];
        return cleaned !== '/' ? cleaned.replace(/\/+$/, '') : '/';
    }
}

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    // Inertia entrega algo tipo "/usuarios?page=2"
    const currentUrl = usePage().url as string;
    const currentPath = normalizePath(currentUrl);
    const { isMobile, setOpenMobile } = useSidebar();

    const isActive = (href?: string) => {
        const target = normalizePath(href);
        if (!target) return false;
        // activo si coincide exacto o si el current está dentro como subruta
        return currentPath === target || currentPath.startsWith(`${target}/`);
    };

    const handleLinkClick = () => {
        // Cerrar el sidebar en móviles cuando se hace clic en un enlace
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup {...props} className={`px-2 py-0 pl-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pl-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={{ children: item.title }}
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                >
                                    <Link href={item.href} onClick={handleLinkClick} aria-current={active ? 'page' : undefined}>
                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5 shrink-0" />}
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
