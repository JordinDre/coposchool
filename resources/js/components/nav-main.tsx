// components/nav-main.tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

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

export function NavMain({ items = [], footerItems = [] }: { items: NavItem[]; footerItems?: NavItem[] }) {
    // Inertia entrega algo tipo "/productos?page=2"
    const currentUrl = usePage().url as string;
    const currentPath = normalizePath(currentUrl);
    const { isMobile, setOpenMobile, state, setOpen } = useSidebar();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const isActive = (href?: string, exact = false) => {
        const target = normalizePath(href);
        if (!target) return false;

        // Si exact es true, solo coincidencia exacta
        if (exact) {
            return currentPath === target;
        }

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
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => {
                    const hasChildren = !!item.items?.length;
                    const showDivider = item.divider && index > 0;

                    if (!hasChildren) {
                        const active = isActive(item.href);
                        return (
                            <React.Fragment key={item.title}>
                                {showDivider && <div className="my-2 border-t border-sidebar-border" />}
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={active} tooltip={{ children: item.title }}>
                                        <Link href={item.href ?? '#'} onClick={handleLinkClick} prefetch aria-current={active ? 'page' : undefined}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </React.Fragment>
                        );
                    }

                    // Para el padre: activo si él o alguno de sus hijos está activo
                    const parentActive = isActive(item.href) || item.items!.some((c) => isActive(c.href));
                    const defaultOpen = parentActive || item.items!.some((c) => isActive(c.href));
                    const itemKey = item.title;

                    // Expandir sidebar temporalmente cuando se abre un collapsible en modo colapsado
                    const handleCollapsibleChange = (open: boolean) => {
                        if (state === 'collapsed' && !isMobile) {
                            if (open) {
                                setExpandedItems((prev) => new Set(prev).add(itemKey));
                                setOpen(true);
                            } else {
                                setExpandedItems((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(itemKey);
                                    return newSet;
                                });
                                // Solo colapsar si no hay otros items expandidos
                                setTimeout(() => {
                                    setExpandedItems((current) => {
                                        if (current.size === 0) {
                                            setOpen(false);
                                        }
                                        return current;
                                    });
                                }, 100);
                            }
                        }
                    };

                    return (
                        <React.Fragment key={item.title}>
                            {showDivider && <div className="my-2 border-t border-sidebar-border" />}
                            <SidebarMenuItem>
                                <Collapsible defaultOpen={defaultOpen} className="group/collapsible" onOpenChange={handleCollapsibleChange}>
                                    <CollapsibleTrigger asChild>
                                        {/* Marcamos el botón del grupo como activo si algún hijo está activo */}
                                        <SidebarMenuButton isActive={parentActive} tooltip={{ children: item.title }}>
                                            {item.icon && <item.icon />}
                                            <span className="flex-1 truncate text-left">{item.title}</span>
                                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="data-[state=closed]:hidden">
                                        <div className="mt-1 ml-6 flex flex-col gap-0.5 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:ml-0 sm:ml-4">
                                            {item.items!.map((child) => {
                                                const childActive = isActive(child.href, true);
                                                const ChildIcon = child.icon;
                                                return (
                                                    <Tooltip key={child.title}>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={child.href ?? '#'}
                                                                onClick={() => {
                                                                    handleLinkClick();
                                                                    // Cerrar el sidebar después de hacer clic en un hijo cuando está colapsado
                                                                    if (state === 'collapsed' && !isMobile) {
                                                                        setTimeout(() => {
                                                                            setExpandedItems(new Set());
                                                                            setOpen(false);
                                                                        }, 200);
                                                                    }
                                                                }}
                                                                prefetch
                                                                aria-current={childActive ? 'page' : undefined}
                                                                className={`flex items-center gap-2 truncate rounded px-2 py-1.5 text-sm transition-colors group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-1.5 ${
                                                                    childActive ? 'bg-muted font-medium' : 'hover:bg-muted/60'
                                                                }`}
                                                            >
                                                                {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                                                                <span className="group-data-[collapsible=icon]:hidden">{child.title}</span>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile}>
                                                            {child.title}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        </React.Fragment>
                    );
                })}

                {/* Footer items integrados */}
                {footerItems.length > 0 && (
                    <>
                        <div className="my-2 border-t border-sidebar-border" />
                        {footerItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={active} tooltip={{ children: item.title }}>
                                        <Link href={item.href ?? '#'} onClick={handleLinkClick} prefetch aria-current={active ? 'page' : undefined}>
                                            {item.icon && <item.icon />}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
