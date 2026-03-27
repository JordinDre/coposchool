import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/use-can';
import { Link, router } from '@inertiajs/react';
import { BookOpen, Edit, Eye, MoreHorizontal, RotateCcw, Trash2, Users } from 'lucide-react';

interface ActionsProps {
    id: number;
    isDeleted?: boolean;
    align?: 'start' | 'center' | 'end';
}

export default function Actions({ id, isDeleted = false, align = 'end' }: ActionsProps) {
    const { can } = useCan();

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas desactivar esta sección?')) {
            router.delete(route('secciones.destroy', id));
        }
    };

    const handleRestore = () => {
        router.post(route('secciones.restore', id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {can('ver seccion') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('secciones.show', id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && can('editar seccion') && (
                    <DropdownMenuItem asChild>
                        <Link href={`/secciones/${id}/materias`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Asignar materias
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && can('editar seccion') && (
                    <DropdownMenuItem asChild>
                        <Link href={`/secciones/${id}/inscribir`}>
                            <Users className="mr-2 h-4 w-4" />
                            Inscribir estudiantes
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isDeleted && can('editar seccion') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('secciones.edit', id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </DropdownMenuItem>
                )}
                {isDeleted && can('editar seccion') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleRestore}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reactivar
                        </DropdownMenuItem>
                    </>
                )}
                {!isDeleted && can('eliminar seccion') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Desactivar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
