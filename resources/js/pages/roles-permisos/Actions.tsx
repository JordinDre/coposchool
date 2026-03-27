import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRoles } from '@/hooks/use-roles';
import { Link } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';

interface ActionsProps {
    id: number;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
}

export default function Actions({ id, routeBase = 'roles-permisos', align = 'end', disabled = false }: ActionsProps) {
    const { isAdminOrSuperAdmin } = useRoles();

    if (disabled) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                <DropdownMenuItem asChild>
                    <Link href={route(`${routeBase}.show`, id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                    </Link>
                </DropdownMenuItem>
                {isAdminOrSuperAdmin() && (
                    <DropdownMenuItem asChild>
                        <Link href={route(`${routeBase}.edit`, id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
