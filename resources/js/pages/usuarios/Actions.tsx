import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/use-can';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, LogOut, MoreHorizontal, RotateCcw, UserX, UserCog } from 'lucide-react';
import { useRoles } from '@/hooks/use-roles';
import type { SharedData } from '@/types';

interface ActionsProps {
    id: number;
    isDeleted?: boolean;
    canLogout?: boolean;
    align?: 'start' | 'center' | 'end';
}

export default function Actions({ id, isDeleted = false, canLogout = false, align = 'end' }: ActionsProps) {
    const { can } = useCan();
    const { isAdminOrSuperAdmin } = useRoles();
    const { auth } = usePage<SharedData>().props;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {can('ver usuarios') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('usuarios.show', id)}><Eye className="mr-2 h-4 w-4" />Ver</Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && can('editar usuarios') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('usuarios.edit', id)}><Edit className="mr-2 h-4 w-4" />Editar</Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && isAdminOrSuperAdmin() && auth?.user?.id !== id && (
                    <DropdownMenuItem asChild>
                        <Link href={route('impersonate', id)}><UserCog className="mr-2 h-4 w-4" />Suplantar</Link>
                    </DropdownMenuItem>
                )}
                {canLogout && can('cerrar sesiones') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.post(route('usuarios.logout', id))}>
                            <LogOut className="mr-2 h-4 w-4" />Cerrar sesiones
                        </DropdownMenuItem>
                    </>
                )}
                {isDeleted && can('editar usuarios') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.post(route('usuarios.restore', id))}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reactivar
                        </DropdownMenuItem>
                    </>
                )}
                {!isDeleted && can('desactivar usuarios') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirm('¿Desactivar este usuario?') && router.delete(route('usuarios.destroy', id))}
                        >
                            <UserX className="mr-2 h-4 w-4 text-red-600" />Desactivar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
