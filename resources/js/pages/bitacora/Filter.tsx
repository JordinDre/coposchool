import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { Calendar, Filter as FilterIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface FilterState {
    search: string;
    searchField?: string;
    causer_id?: number;
    subject_type?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

interface FilterProps {
    filters: {
        log_names: string[];
        subject_types: string[];
        users: Array<{ id: number; name: string; email: string }>;
    };
}

export default function Filter({ filters: filterData }: FilterProps) {
    const { url } = usePage();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [searchField, setSearchField] = useState<string>('all');
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        searchField: 'all',
        causer_id: undefined,
        subject_type: undefined,
        fecha_desde: undefined,
        fecha_hasta: undefined,
    });
    const isInitialMount = useRef(true);

    // Sincronizar estado local con parámetros de URL
    useEffect(() => {
        // Extraer los parámetros de búsqueda de la URL
        const urlObj = new URL(url, window.location.origin);
        const urlParams = new URLSearchParams(urlObj.search);

        // Actualizar búsqueda
        const searchParam = urlParams.get('search') || '';
        setSearch(searchParam);

        const searchFieldParam = urlParams.get('search_field') || 'all';
        setSearchField(searchFieldParam);

        // Actualizar filtros
        const newFilters: FilterState = {
            search: searchParam,
            searchField: searchFieldParam,
            causer_id: urlParams.get('causer_id') ? Number(urlParams.get('causer_id')) : undefined,
            subject_type: urlParams.get('subject_type') || undefined,
            fecha_desde: urlParams.get('fecha_desde') || undefined,
            fecha_hasta: urlParams.get('fecha_hasta') || undefined,
        };
        setFilters(newFilters);
        isInitialMount.current = false;
    }, [url]);

    // Aplicar búsqueda automáticamente cuando cambia el campo de búsqueda si hay un término de búsqueda
    useEffect(() => {
        // No ejecutar en el montaje inicial
        if (isInitialMount.current) {
            return;
        }

        if (search && search.trim()) {
            const params = new URLSearchParams();

            params.set('search', search);
            if (searchField && searchField !== 'all') {
                params.set('search_field', searchField);
            }

            if (filters.causer_id) {
                params.set('causer_id', filters.causer_id.toString());
            }

            if (filters.subject_type && filters.subject_type !== 'all') {
                params.set('subject_type', filters.subject_type);
            }

            if (filters.fecha_desde) {
                params.set('fecha_desde', filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                params.set('fecha_hasta', filters.fecha_hasta);
            }

            router.get(route('actividades.index'), Object.fromEntries(params), {
                preserveState: true,
                replace: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchField]); // Solo se ejecuta cuando cambia searchField

    // Contar filtros activos
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'searchField') return false; // No contar searchField como un filtro separado
        return value !== undefined && value !== '' && value !== null && value !== 'all';
    }).length;

    // Función para manejar cambios en filtros
    const handleFilterChange = (key: string, value: number | string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearch('');
        setSearchField('all');
        setFilters({
            search: '',
            searchField: 'all',
            causer_id: undefined,
            subject_type: undefined,
            fecha_desde: undefined,
            fecha_hasta: undefined,
        });
        setIsFilterOpen(false);
        router.get(
            route('actividades.index'),
            { _clear: '1' },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Función para aplicar filtros
    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }
        if (searchField && searchField !== 'all') {
            params.set('search_field', searchField);
        }

        if (filters.causer_id && filters.causer_id !== 0) {
            params.set('causer_id', filters.causer_id.toString());
        }

        if (filters.subject_type && filters.subject_type !== 'all') {
            params.set('subject_type', filters.subject_type);
        }

        if (filters.fecha_desde) {
            params.set('fecha_desde', filters.fecha_desde);
        }

        if (filters.fecha_hasta) {
            params.set('fecha_hasta', filters.fecha_hasta);
        }

        router.get(route('actividades.index'), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    }, [search, searchField, filters]);

    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Si el campo está vacío, resetear el filtro de búsqueda
            if (!search.trim()) {
                removeFilter('search');
            } else {
                applyFilters();
            }
        }
    };

    // Función para remover un filtro específico
    const removeFilter = (filterKey: string) => {
        if (filterKey === 'search') {
            // Cuando se elimina el badge de search, resetear todos los filtros
            handleClearFilters();
            return;
        } else {
            // Actualizar el estado local primero
            setFilters((prev: FilterState) => ({
                ...prev,
                [filterKey]: undefined,
            }));

            // Construir parámetros de URL manteniendo search y search_field si existen
            const params = new URLSearchParams();

            if (search) {
                params.set('search', search);
            }
            if (searchField && searchField !== 'all') {
                params.set('search_field', searchField);
            }

            // Agregar otros filtros que no sean el que se está eliminando
            Object.entries(filters).forEach(([key, value]) => {
                if (
                    key !== filterKey &&
                    key !== 'search' &&
                    key !== 'search_field' &&
                    key !== 'searchField' &&
                    value !== undefined &&
                    value !== '' &&
                    value !== null &&
                    value !== 'all'
                ) {
                    if (typeof value === 'number') {
                        params.set(key, value.toString());
                    } else if (value) {
                        params.set(key, value.toString());
                    }
                }
            });

            router.get(route('actividades.index'), Object.fromEntries(params), {
                preserveState: true,
                replace: true,
            });
        }
    };

    // Función para obtener el texto del filtro
    const getFilterText = (key: string, value: string | number) => {
        if (key === 'search') {
            const fieldLabel = searchField !== 'all' ? getFieldLabel(searchField) : 'Todos los campos';
            return `Búsqueda (${fieldLabel}): "${value}"`;
        }

        const fieldLabels: Record<string, string> = {
            causer_id: 'Usuario',
            subject_type: 'Modelo Afectado',
            fecha_desde: 'Fecha Desde',
            fecha_hasta: 'Fecha Hasta',
        };

        if (key === 'causer_id') {
            const user = filterData.users?.find((u: { id: number; name: string; email: string }) => u.id === value);
            return `${fieldLabels[key]}: ${user?.name || `Usuario ${value}`}`;
        }

        if (key === 'subject_type') {
            return `${fieldLabels[key]}: ${(value as string).replace('App\\Models\\', '')}`;
        }

        return `${fieldLabels[key]}: ${value}`;
    };

    const getFieldLabel = (field: string): string => {
        const fieldLabels: Record<string, string> = {
            all: 'Todos los campos',
            id: 'ID',
            description: 'Descripción',
            causer: 'Usuario',
            subject_type: 'Modelo',
        };
        return fieldLabels[field] || field;
    };

    const getPlaceholder = (field: string): string => {
        const placeholders: Record<string, string> = {
            all: 'Buscar en todos los campos... (presiona Enter)',
            id: 'Buscar por ID... (presiona Enter)',
            description: 'Buscar por descripción... (presiona Enter)',
            causer: 'Buscar por usuario... (presiona Enter)',
            subject_type: 'Buscar por modelo... (presiona Enter)',
        };
        return placeholders[field] || 'Buscar... (presiona Enter)';
    };

    // Obtener filtros activos para mostrar
    const activeFilters = [
        ...(search ? [{ key: 'search', value: search }] : []),
        ...Object.entries(filters)
            .filter(
                ([key, value]) =>
                    key !== 'search' &&
                    key !== 'search_field' &&
                    key !== 'searchField' &&
                    value !== undefined &&
                    value !== '' &&
                    value !== null &&
                    value !== 'all',
            )
            .map(([key, value]) => ({ key, value: value as string | number })),
    ];

    return (
        <div className="w-full space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Búsqueda */}
                <div className="flex w-full gap-2 sm:flex-1">
                    <Select
                        value={searchField}
                        onValueChange={(value) => {
                            setSearchField(value);
                            // Actualizar también en filters para mantener sincronizado
                            setFilters((prev) => ({ ...prev, searchField: value }));
                        }}
                    >
                        <SelectTrigger className="w-[140px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los campos</SelectItem>
                            <SelectItem value="id">ID</SelectItem>
                            <SelectItem value="description">Descripción</SelectItem>
                            <SelectItem value="causer">Usuario</SelectItem>
                            <SelectItem value="subject_type">Modelo</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder={getPlaceholder(searchField)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Botones de filtros */}
                <div className="flex gap-2">
                    {/* Filtros */}
                    <Dialog
                        open={isFilterOpen}
                        onOpenChange={(open) => {
                            setIsFilterOpen(open);
                            if (!open) {
                                applyFilters();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                                <FilterIcon className="mr-2 size-4" />
                                <span className="hidden sm:inline">Filtros</span>
                                <span className="sm:hidden">Filtros</span>
                                {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
                            </Button>
                        </DialogTrigger>

                        {/* Botón Limpiar Filtros */}
                        {activeFiltersCount > 0 && (
                            <Button size="sm" onClick={handleClearFilters} color="red" className="flex-1 sm:flex-initial">
                                <X className="mr-2 size-4" />
                                <span className="hidden sm:inline">Limpiar Filtros</span>
                                <span className="sm:hidden">Limpiar Filtros</span>
                            </Button>
                        )}

                        <DialogContent className="max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Filtros Avanzados</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Usuario */}
                                    <div className="grid gap-2">
                                        <Label>Usuario</Label>
                                        <Select
                                            value={filters.causer_id?.toString() || ''}
                                            onValueChange={(val) => handleFilterChange('causer_id', val ? Number(val) : undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterData.users
                                                    ?.filter(
                                                        (user: { id: number; name: string; email: string }) =>
                                                            user && user.id && user.id.toString().trim() !== '',
                                                    )
                                                    .map((user: { id: number; name: string; email: string }) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Modelo Afectado */}
                                    <div className="grid gap-2">
                                        <Label>Modelo Afectado</Label>
                                        <Select
                                            value={filters.subject_type || ''}
                                            onValueChange={(val) => handleFilterChange('subject_type', val || undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterData.subject_types
                                                    ?.filter((type: string) => type && type.trim() !== '')
                                                    .map((type: string) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.replace('App\\Models\\', '')}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Fecha Desde */}
                                    <div className="grid gap-2">
                                        <Label>Fecha Desde</Label>
                                        <div className="relative">
                                            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground" />
                                            <Input
                                                type="date"
                                                value={filters.fecha_desde || ''}
                                                onChange={(e) => handleFilterChange('fecha_desde', e.target.value || undefined)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Fecha Hasta */}
                                    <div className="grid gap-2">
                                        <Label>Fecha Hasta</Label>
                                        <div className="relative">
                                            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground" />
                                            <Input
                                                type="date"
                                                value={filters.fecha_hasta || ''}
                                                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value || undefined)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                                    <Button onClick={handleClearFilters} disabled={activeFiltersCount === 0} color="red" className="w-full sm:w-auto">
                                        <X className="mr-2 size-4" />
                                        Limpiar Filtros
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            applyFilters();
                                            setIsFilterOpen(false);
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        Aplicar Filtros
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filtros aplicados */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="hidden text-sm text-muted-foreground sm:inline">Filtros aplicados:</span>
                    <span className="text-xs text-muted-foreground sm:hidden">Activos:</span>
                    {activeFilters.map((filter) => (
                        <div
                            key={filter.key}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                            <span className="truncate">{getFilterText(filter.key, filter.value)}</span>
                            <button
                                onClick={() => removeFilter(filter.key)}
                                className="ml-1 shrink-0 rounded-full p-0.5 hover:bg-blue-200"
                                title="Remover filtro"
                                aria-label="Remover filtro"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
