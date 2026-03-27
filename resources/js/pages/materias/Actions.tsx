import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/use-can';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';

interface ActionsProps {
    id: number;
    isDeleted?: boolean;
    align?: 'start' | 'center' | 'end';
}

export default function Actions({ id, isDeleted = false, align = 'end' }: ActionsProps) {
    const { can } = useCan();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {can('ver materia') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('materias.show', id)}><Eye className="mr-2 h-4 w-4" />Ver</Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && can('editar materia') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('materias.edit', id)}><Edit className="mr-2 h-4 w-4" />Editar</Link>
                    </DropdownMenuItem>
                )}
                {isDeleted && can('editar materia') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.post(route('materias.restore', id))}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reactivar
                        </DropdownMenuItem>
                    </>
                )}
                {!isDeleted && can('eliminar materia') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirm('¿Desactivar esta materia?') && router.delete(route('materias.destroy', id))}
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />Desactivar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
