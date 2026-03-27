import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/use-can';
import { Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, RotateCcw, UserX } from 'lucide-react';

interface ActionsProps {
    id: number;
    isDeleted?: boolean;
}

export default function Actions({ id, isDeleted = false }: ActionsProps) {
    const { can } = useCan();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {!isDeleted && can('editar usuarios') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('estudiantes.edit', id)}><Edit className="mr-2 h-4 w-4" />Editar</Link>
                    </DropdownMenuItem>
                )}
                {isDeleted && can('editar usuarios') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.post(route('estudiantes.restore', id))}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reactivar
                        </DropdownMenuItem>
                    </>
                )}
                {!isDeleted && can('desactivar usuarios') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirm('¿Desactivar este estudiante?') && router.delete(route('estudiantes.destroy', id))}
                        >
                            <UserX className="mr-2 h-4 w-4 text-red-600" />Desactivar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
