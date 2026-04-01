import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCaja, useRoles } from '@/hooks/use-can';
import { Info } from 'lucide-react';

export function UserRolesIndicator() {
    const { roles } = useRoles();
    const caja = useCaja();

    const hasAny = roles.length > 0 || !!caja.activa;
    if (!hasAny) return null;

    return (
        <div className="flex items-center gap-1">
            {/* Badges en pantallas medianas y grandes */}
            <div className="hidden flex-wrap items-center gap-1 md:flex">
                {roles.map((role) => (
                    <Badge key={role} variant="default" className="h-5 rounded-md px-2.5 py-0.5 text-[11px] leading-none font-medium">
                        {role}
                    </Badge>
                ))}

                {caja.activa && (
                    <>
                        <Badge className="h-5 rounded-md border-transparent bg-blue-500 px-2.5 py-0.5 text-[11px] leading-none font-medium text-white">
                            Bodega: {caja.activa.bodega_nombre ?? caja.activa.bodega_id}
                        </Badge>
                        <Badge className="h-5 rounded-md border-transparent bg-emerald-500 px-2.5 py-0.5 text-[11px] leading-none font-medium text-white">
                            Caja: {caja.activa.codigo}
                        </Badge>
                    </>
                )}
            </div>

            {/* Dropdown compacto en móvil */}
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2">
                            <Info className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                        {roles.map((role) => (
                            <DropdownMenuItem key={role} className="text-xs">
                                Rol: {role}
                            </DropdownMenuItem>
                        ))}
                        {caja.activa && (
                            <>
                                <DropdownMenuItem className="text-xs">Bodega: {caja.activa.bodega_nombre ?? caja.activa.bodega_id}</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">Caja: {caja.activa.codigo}</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
