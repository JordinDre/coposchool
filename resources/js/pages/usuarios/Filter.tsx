import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { Filter as FilterIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface FilterState {
    search: string;
    role?: string;
    status?: string;
}

interface FilterProps {
    roles?: Role[];
}

export default function Filter({ roles = [] }: FilterProps) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<FilterState>({ search: '' });
    const isInitialMount = useRef(true);

    useEffect(() => {
        const p = new URLSearchParams(new URL(url, window.location.origin).search);
        const s = p.get('search') || '';
        setSearch(s);
        setFilters({ search: s, role: p.get('role') || undefined, status: p.get('status') || undefined });
        isInitialMount.current = false;
    }, [url]);

    const activeCount = [filters.role, filters.status].filter(Boolean).length + (search ? 1 : 0);

    const applyFilters = useCallback(() => {
        const params: Record<string, string> = {};
        if (search) params['search'] = search;
        if (filters.role) params['role'] = filters.role;
        if (filters.status) params['status'] = filters.status;
        router.get(route('usuarios.index'), params, { preserveState: true, replace: true });
    }, [search, filters]);

    const clearFilters = () => {
        setSearch('');
        setFilters({ search: '' });
        setIsOpen(false);
        router.get(route('usuarios.index'), {}, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (search.trim()) {
                applyFilters();
            } else {
                clearFilters();
            }
        }
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar usuarios... (presiona Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        leftIcon={Search}
                    />
                </div>
                <div className="flex gap-2">
                    <Dialog
                        open={isOpen}
                        onOpenChange={(o) => {
                            setIsOpen(o);
                            if (!o) applyFilters();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <FilterIcon className="mr-2 size-4" />
                                Filtros
                                {activeCount > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {activeCount}
                                    </Badge>
                                )}
                            </Button>
                        </DialogTrigger>
                        {activeCount > 0 && (
                            <Button size="sm" onClick={clearFilters} color="red">
                                <X className="mr-2 size-4" />
                                Limpiar
                            </Button>
                        )}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Filtros Avanzados</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Rol</Label>
                                        <Select value={filters.role || ''} onValueChange={(v) => setFilters((p) => ({ ...p, role: v || undefined }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem key={r.id} value={r.name} className="capitalize">
                                                        {r.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Estado</Label>
                                        <Select
                                            value={filters.status || ''}
                                            onValueChange={(v) => setFilters((p) => ({ ...p, status: v || undefined }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Activo</SelectItem>
                                                <SelectItem value="inactive">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button onClick={clearFilters} color="red" disabled={activeCount === 0}>
                                        <X className="mr-2 size-4" />
                                        Limpiar
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            applyFilters();
                                            setIsOpen(false);
                                        }}
                                    >
                                        Aplicar Filtros
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
