import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { groupPermissionsByModule } from '@/lib/permissionGroups';
import type { BreadcrumbItem, Permission, Role } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ChevronDown, ChevronRight, Search, Shield } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles y Permisos', href: '/roles-permisos' },
    { title: 'Editar Rol', href: '#' },
];

interface RolesPermisosEditProps {
    role: Role;
    permisos: Permission[];
}

export default function Edit({ role, permisos }: RolesPermisosEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions.map((p) => p.id),
    });

    const page = usePage();
    const configuracion = (
        page.props as {
            configuracion?: {
                clientes?: boolean;
                servicios?: boolean;
                creditos?: boolean;
                traslados?: boolean;
                gastos?: boolean;
                conversiones?: boolean;
                bodegas?: boolean;
                facturacionElectronica?: boolean;
            };
        }
    )?.configuracion;

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(() => role.permissions.map((p) => p.id));
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Agrupar permisos por módulo y filtrar según configuración
    const permissionGroups = useMemo(() => {
        let filtered = permisos.filter((permission) => permission.name.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtrar permisos según módulos activos
        filtered = filtered.filter((permission) => {
            const name = permission.name.toLowerCase();

            // Verificar módulo de clientes
            if (name.includes('cliente') && (!configuracion || !configuracion.clientes)) {
                return false;
            }

            // Verificar módulo de servicios
            if (name.includes('servicio') && (!configuracion || !configuracion.servicios)) {
                return false;
            }

            // Verificar módulo de créditos
            if (name.includes('credito') && (!configuracion || !configuracion.creditos)) {
                return false;
            }

            // Verificar módulo de traslados
            if (name.includes('traslado') && (!configuracion || !configuracion.traslados)) {
                return false;
            }

            // Verificar módulo de gastos
            if (name.includes('gasto') && (!configuracion || !configuracion.gastos)) {
                return false;
            }

            // Verificar módulo de conversiones
            if (name.includes('conversion') && (!configuracion || !configuracion.conversiones)) {
                return false;
            }

            // Verificar módulo de bodegas
            if (name.includes('bodega') && (!configuracion || !configuracion.bodegas)) {
                return false;
            }

            // Verificar módulo de facturación electrónica (facturas)
            if (name.includes('factura') && (!configuracion || !configuracion.facturacionElectronica)) {
                return false;
            }

            return true;
        });

        return groupPermissionsByModule(filtered);
    }, [permisos, searchTerm, configuracion]);

    // Expandir todos los grupos por defecto
    useEffect(() => {
        if (expandedGroups.size === 0 && permissionGroups.length > 0) {
            setExpandedGroups(new Set(permissionGroups.map((g) => g.name)));
        }
    }, [permissionGroups, expandedGroups.size]);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    };

    const toggleAllGroups = () => {
        if (expandedGroups.size === permissionGroups.length) {
            setExpandedGroups(new Set());
        } else {
            setExpandedGroups(new Set(permissionGroups.map((g) => g.name)));
        }
    };

    // Inicializar permisos seleccionados
    useEffect(() => {
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setData(
            'permissions',
            role.permissions.map((p) => p.id),
        );
    }, [role, setData]);

    // Actualizar permisos en el formulario cuando cambie la selección
    useEffect(() => {
        setData('permissions', selectedPermissions);
    }, [selectedPermissions, setData]);

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setSelectedPermissions((prev) => [...prev, permissionId]);
        } else {
            setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId));
        }
    };

    const handleSelectAll = () => {
        const allPermissionIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
        if (selectedPermissions.length === allPermissionIds.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(allPermissionIds);
        }
    };

    const handleSelectGroup = (groupName: string) => {
        const group = permissionGroups.find((g) => g.name === groupName);
        if (!group) return;

        const groupPermissionIds = group.permissions.map((p) => p.id);
        const allSelected = groupPermissionIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            // Deseleccionar todos los permisos del grupo
            setSelectedPermissions((prev) => prev.filter((id) => !groupPermissionIds.includes(id)));
        } else {
            // Seleccionar todos los permisos del grupo
            setSelectedPermissions((prev) => {
                const newSet = new Set(prev);
                groupPermissionIds.forEach((id) => newSet.add(id));
                return Array.from(newSet);
            });
        }
    };

    const allPermissionIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
    const isAllSelected = allPermissionIds.length > 0 && selectedPermissions.length === allPermissionIds.length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('roles-permisos.update', role.id), {
            onSuccess: () => {
                router.visit(route('roles-permisos.index'));
            },
        });
    };

    const handleClearFields = () => {
        setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.id),
        });
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setSearchTerm('');
    };

    return (
        <>
            <Head title={`Editar Rol: ${role.name}`} />
            <div className="md:p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre del rol */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Rol *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Supervisor, Cajero, etc."
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Permisos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <Label className="text-base font-medium">Permisos</Label>
                                <span className="text-sm text-muted-foreground">({selectedPermissions.length} seleccionados)</span>
                            </div>
                        </div>

                        {/* Buscador y controles */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder="Buscar permisos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={toggleAllGroups}>
                                    {expandedGroups.size === permissionGroups.length ? 'Colapsar Todo' : 'Expandir Todo'}
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                                    {isAllSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={handleClearFields} disabled={processing}>
                                    Limpiar
                                </Button>
                                <Button type="submit" size="sm" disabled={processing} color="green">
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </div>

                        {/* Grupos de permisos */}
                        <div className="space-y-3">
                            {permissionGroups.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    {searchTerm ? 'No se encontraron permisos que coincidan con la búsqueda.' : 'No hay permisos disponibles.'}
                                </div>
                            ) : (
                                permissionGroups.map((group) => {
                                    const isExpanded = expandedGroups.has(group.name);
                                    const groupPermissionIds = group.permissions.map((p) => p.id);
                                    const selectedInGroup = groupPermissionIds.filter((id) => selectedPermissions.includes(id)).length;
                                    const isGroupFullySelected = selectedInGroup === groupPermissionIds.length;
                                    const isGroupPartiallySelected = selectedInGroup > 0 && selectedInGroup < groupPermissionIds.length;

                                    return (
                                        <div key={group.name} className="rounded-lg border bg-card">
                                            {/* Header del grupo */}
                                            <div
                                                className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                                                onClick={() => toggleGroup(group.name)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {group.icon && <span className="text-lg">{group.icon}</span>}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold">{group.label}</h3>
                                                                {group.requiresActivation && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        Requiere activación
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {group.permissions.length} permiso{group.permissions.length !== 1 ? 's' : ''} •{' '}
                                                                {selectedInGroup} seleccionado{selectedInGroup !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isGroupFullySelected}
                                                        ref={(el) => {
                                                            if (el && 'indeterminate' in el) {
                                                                (el as HTMLInputElement).indeterminate = isGroupPartiallySelected;
                                                            }
                                                        }}
                                                        onCheckedChange={() => handleSelectGroup(group.name)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>

                                            {/* Permisos del grupo */}
                                            {isExpanded && (
                                                <div className="border-t bg-muted/30 p-3">
                                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                        {group.permissions.map((permission) => {
                                                            const isSelected = selectedPermissions.includes(permission.id);
                                                            const action = permission.name.split(' ')[0];

                                                            return (
                                                                <label
                                                                    key={permission.id}
                                                                    className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-2 hover:bg-muted/50"
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={(checked) =>
                                                                            handlePermissionChange(permission.id, checked as boolean)
                                                                        }
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-medium capitalize">{permission.name}</div>
                                                                        <div className="text-xs text-muted-foreground capitalize">
                                                                            {action === 'listar' && 'Ver lista'}
                                                                            {action === 'ver' && 'Ver detalles'}
                                                                            {action === 'crear' && 'Crear nuevo'}
                                                                            {action === 'editar' && 'Modificar'}
                                                                            {action === 'eliminar' && 'Eliminar'}
                                                                            {action === 'desactivar' && 'Desactivar'}
                                                                            {action === 'anular' && 'Anular'}
                                                                            {action === 'confirmar' && 'Confirmar'}
                                                                            {action === 'autorizar' && 'Autorizar'}
                                                                            {action === 'rechazar' && 'Rechazar'}
                                                                            {action === 'solicitar' && 'Solicitar'}
                                                                            {action === 'enviar' && 'Enviar'}
                                                                            {action === 'recibir' && 'Recibir'}
                                                                            {action === 'entregar' && 'Entregar'}
                                                                            {action === 'pagar' && 'Pagar'}
                                                                            {action === 'abrir' && 'Abrir'}
                                                                            {action === 'cerrar' && 'Cerrar'}
                                                                            {![
                                                                                'listar',
                                                                                'ver',
                                                                                'crear',
                                                                                'editar',
                                                                                'eliminar',
                                                                                'desactivar',
                                                                                'anular',
                                                                                'confirmar',
                                                                                'autorizar',
                                                                                'rechazar',
                                                                                'solicitar',
                                                                                'enviar',
                                                                                'recibir',
                                                                                'entregar',
                                                                                'pagar',
                                                                                'abrir',
                                                                                'cerrar',
                                                                            ].includes(action) && action}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
