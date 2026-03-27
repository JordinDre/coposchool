import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role, User } from '@/types';
import axios from 'axios';
import { AlertCircle, Search, User as UserIcon, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UserSearchSelectorProps {
    selectedUsers: number[]; // IDs de usuarios seleccionados
    onSelectionChange: (userIds: number[]) => void; // Callback cuando cambia la selección
    roles?: Role[]; // Roles disponibles para filtrar (opcional)
    filterByRoles?: string[]; // Roles por defecto para filtrar
    title?: string; // Título personalizado
    error?: string; // Error de validación
    initialUsersData?: SearchedUser[]; // Datos iniciales de usuarios seleccionados
}

interface SearchedUser extends Pick<User, 'id' | 'name' | 'email' | 'telefono'> {
    roles?: Role[];
}

const EMPTY_ROLES: Role[] = [];
const EMPTY_ROLE_FILTERS: string[] = [];
const EMPTY_USERS: SearchedUser[] = [];

export default function UserSearchSelector({
    selectedUsers,
    onSelectionChange,
    roles = EMPTY_ROLES,
    filterByRoles = EMPTY_ROLE_FILTERS,
    title = 'Usuarios Asignados',
    error,
    initialUsersData = EMPTY_USERS,
}: UserSearchSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(filterByRoles);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUsersData, setSelectedUsersData] = useState<SearchedUser[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Función de búsqueda con debounce
    const searchUsers = useCallback(
        async (term: string, roleFilters: string[]) => {
            if (term.length < 2 && roleFilters.length === 0) {
                setSearchResults([]);
                setShowDropdown(false);

                return;
            }

            setIsSearching(true);
            setShowDropdown(true);

            try {
                const response = await axios.get<SearchedUser[]>(route('usuarios.buscar'), {
                    params: {
                        q: term,
                        roles: roleFilters,
                    },
                });

                // Filtrar usuarios que ya están seleccionados
                const filteredResults = response.data.filter((user) => !selectedUsers.includes(user.id));
                setSearchResults(filteredResults);
            } catch (error) {
                console.error('Error al buscar usuarios:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        [selectedUsers],
    );

    // Debounce effect para la búsqueda
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchUsers(searchTerm, selectedRoles);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedRoles, searchUsers]);

    // Cargar datos iniciales de usuarios seleccionados solo al montar
    useEffect(() => {
        if (initialUsersData && initialUsersData.length > 0) {
            setSelectedUsersData(initialUsersData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo al montar - initialUsersData solo se usa una vez al inicio

    // Mantener sincronizado cuando cambian los usuarios seleccionados desde fuera
    useEffect(() => {
        const currentIds = selectedUsersData
            .filter((u) => u && u.id)
            .map((u) => u.id)
            .sort();
        const selectedIds = [...selectedUsers].sort();

        // Si no hay usuarios seleccionados, limpiar datos
        if (selectedUsers.length === 0) {
            if (selectedUsersData.length > 0) {
                setSelectedUsersData([]);
            }
            return;
        }

        // Si los arrays son diferentes, necesitamos sincronizar
        const idsMatch = currentIds.length === selectedIds.length && currentIds.every((id, i) => id === selectedIds[i]);

        if (!idsMatch) {
            // Si hay menos IDs seleccionados que datos locales, eliminar los que faltan
            if (selectedIds.length < currentIds.length) {
                setSelectedUsersData((prev) => prev.filter((u) => u && u.id && selectedIds.includes(u.id)));
            }
            // Si hay más IDs seleccionados que datos locales, buscar solo los faltantes
            else if (selectedIds.length > currentIds.length) {
                const missingIds = selectedIds.filter((id) => !currentIds.includes(id));

                // Solo buscar si realmente faltan usuarios
                if (missingIds.length > 0) {
                    // Verificar primero si alguno de los IDs faltantes ya está en los datos locales
                    // (puede pasar si se agregó recientemente desde handleAddUser)
                    const actuallyMissing = missingIds.filter((id) => !selectedUsersData.find((u) => u && u.id === id));

                    if (actuallyMissing.length > 0) {
                        // Buscar los usuarios faltantes
                        Promise.all(
                            actuallyMissing.map((id) =>
                                axios
                                    .get<SearchedUser[]>(route('usuarios.buscar'), {
                                        params: { q: id.toString() },
                                    })
                                    .then((response) => response.data.find((u) => u.id === id))
                                    .catch(() => null),
                            ),
                        ).then((users) => {
                            const validUsers = users.filter((u): u is SearchedUser => u !== null && u !== undefined && u.id !== undefined);
                            if (validUsers.length > 0) {
                                setSelectedUsersData((prev) => {
                                    const existingIds = prev.filter((u) => u && u.id).map((u) => u.id);
                                    const newUsers = validUsers.filter((u) => u && u.id && !existingIds.includes(u.id));
                                    return newUsers.length > 0 ? [...prev.filter((u) => u && u.id), ...newUsers] : prev.filter((u) => u && u.id);
                                });
                            }
                        });
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUsers]); // selectedUsersData se usa dentro pero no debe estar en las dependencias para evitar loops infinitos

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddUser = (user: SearchedUser) => {
        const newSelection = [...selectedUsers, user.id];
        onSelectionChange(newSelection);

        // Agregar a los datos locales
        setSelectedUsersData([...selectedUsersData, user]);

        // Limpiar búsqueda
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleRemoveUser = (userId: number) => {
        const newSelection = selectedUsers.filter((id) => id !== userId);
        onSelectionChange(newSelection);

        // Remover de los datos locales
        setSelectedUsersData(selectedUsersData.filter((u) => u.id !== userId));
    };

    const handleRoleFilterChange = (value: string) => {
        if (value === 'all') {
            setSelectedRoles([]);
        } else {
            setSelectedRoles([value]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <Label className="text-base font-medium">{title}</Label>
                    <span className="text-sm text-muted-foreground">({selectedUsers.length} seleccionados)</span>
                </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col gap-2 sm:flex-row">
                {/* Filtro por roles (si se proporcionan) */}
                {roles.length > 0 && (
                    <Select value={selectedRoles[0] || 'all'} onValueChange={handleRoleFilterChange}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Buscador con dropdown */}
                <div ref={dropdownRef} className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuarios por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                        className="pl-10"
                    />

                    {/* Dropdown de resultados */}
                    {showDropdown && (searchResults.length > 0 || isSearching) && (
                        <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-gray-800">
                            {isSearching ? (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Buscando...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-1">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleAddUser(user)}
                                            className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                {roles.length > 0 && user.roles && user.roles.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs">
                                                                {role.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No se encontraron usuarios.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Usuarios Seleccionados - Badges */}
            {selectedUsersData.length > 0 && (
                <div className="rounded-md border bg-gray-50 p-3 dark:bg-gray-900">
                    <div className="flex flex-wrap gap-2">
                        {selectedUsersData
                            .filter((user) => user && user.id)
                            .map((user) => (
                                <div
                                    key={user.id}
                                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm dark:bg-gray-800"
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                        {roles.length > 0 && user.roles && user.roles.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="outline" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="ml-2 cursor-pointer rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900"
                                    >
                                        <X className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Error de validación */}
            {error && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
}
