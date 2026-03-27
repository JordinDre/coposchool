import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/use-can';
import { Link } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';

interface ActionsProps {
    id: number;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
}

export default function Actions({ id, routeBase = 'actividades', align = 'end', disabled = false }: ActionsProps) {
    const { can } = useCan();

    if (disabled) {
        return null;
    }

    // Verificar permisos
    const puedeVer = can('ver actividad');

    // Si no tiene permiso, no mostrar nada
    if (!puedeVer) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={align}>
                    {puedeVer && (
                        <DropdownMenuItem asChild>
                            <Link href={route(`${routeBase}.show`, id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
