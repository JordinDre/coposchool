import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type SharedData, type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ExternalLink, LogOut, Monitor, Moon, Settings, Sun, UserX } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { auth } = usePage<SharedData>().props;
    const { configuracion } = usePage().props as { configuracion?: { catalogoPublico?: boolean; ecommercePublico?: boolean } };
    const { appearance: currentAppearance, updateAppearance } = useAppearance();
    const catalogEnabled = configuracion?.catalogoPublico ?? false;
    const ecommerceEnabled = configuracion?.ecommercePublico ?? false;
    const isEcommerce = ecommerceEnabled;

    const catalogUrl =
        typeof window !== 'undefined' ? `${window.location.origin}${isEcommerce ? '/' : '/catalogo'}` : isEcommerce ? '/' : '/catalogo';

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        cleanup();

        // Prevenir que se pueda navegar hacia atrás después del logout
        // Reemplazar el estado del historial actual antes del logout
        window.history.replaceState(null, '', window.location.href);

        router.post(
            route('logout'),
            {},
            {
                onSuccess: () => {
                    // Después del logout exitoso, limpiar el historial completamente
                    window.history.replaceState(null, '', window.location.href);
                    // Agregar un nuevo estado para prevenir navegación hacia atrás
                    window.history.pushState(null, '', window.location.href);
                },
                onFinish: () => {
                    router.flushAll();
                },
            },
        );
    };

    const isImpersonating = auth.impersonating ?? false;

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                    {isImpersonating && auth.impersonator && (
                        <div className="mt-1 text-xs text-muted-foreground">Impersonando como {auth.impersonator.name}</div>
                    )}
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isImpersonating && (
                <>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link className="block w-full" href={route('impersonate.leave')} as="button" onClick={cleanup}>
                                <UserX className="mr-2" />
                                Salir de Suplantación
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Configuración
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            {catalogEnabled && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {isEcommerce ? 'Ver tienda en línea' : 'Ver catálogo'}
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Monitor className="mr-2 h-4 w-4" />
                        Tema
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => updateAppearance('light')}>
                                <Sun className="mr-2 h-4 w-4" />
                                Claro
                                {currentAppearance === 'light' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('dark')}>
                                <Moon className="mr-2 h-4 w-4" />
                                Oscuro
                                {currentAppearance === 'dark' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('system')}>
                                <Monitor className="mr-2 h-4 w-4" />
                                Sistema
                                {currentAppearance === 'system' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button type="button" className="flex w-full items-center" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                </button>
            </DropdownMenuItem>
        </>
    );
}
