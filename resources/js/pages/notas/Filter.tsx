import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { Filter as FilterIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}

interface FilterState {
    search: string;
    seccion_id?: string;
    status?: string;
}

export default function Filter({ secciones }: { secciones: Seccion[] }) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<FilterState>({ search: '' });
    const isInitialMount = useRef(true);

    useEffect(() => {
        const p = new URLSearchParams(new URL(url, window.location.origin).search);
        const s = p.get('search') || '';
        setSearch(s);
        setFilters({ search: s, seccion_id: p.get('seccion_id') || undefined, status: p.get('status') || undefined });
        isInitialMount.current = false;
    }, [url]);

    const activeCount = [filters.seccion_id, filters.status].filter(Boolean).length + (search ? 1 : 0);

    const applyFilters = useCallback(() => {
        const params: Record<string, string> = {};
        if (search) params['search'] = search;
        if (filters.seccion_id) params['seccion_id'] = filters.seccion_id;
        if (filters.status) params['status'] = filters.status;
        router.get(route('notas.index'), params, { preserveState: true, replace: true });
    }, [search, filters]);

    const clearFilters = () => {
        setSearch('');
        setFilters({ search: '' });
        setIsOpen(false);
        router.get(route('notas.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar estudiantes... (presiona Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (search.trim()) {
                                    applyFilters();
                                } else {
                                    clearFilters();
                                }
                            }
                        }}
                        className="pl-10"
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
                            <Button size="sm" variant="ghost" onClick={clearFilters}>
                                <X className="mr-2 size-4" />
                                Limpiar
                            </Button>
                        )}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Filtros Avanzados</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Sección</Label>
                                        <Select
                                            value={filters.seccion_id || ''}
                                            onValueChange={(v) => setFilters((p) => ({ ...p, seccion_id: v || undefined }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {secciones.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.nombre} · {s.ciclo} {s.ciclo_escolar}
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
                                    <Button variant="outline" onClick={clearFilters} disabled={activeCount === 0}>
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
