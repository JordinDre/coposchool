import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { Filter as FilterIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const CICLOS = ['pre-primaria', 'kinder', 'primaria', 'basico', 'diversificado'] as const;

interface FilterState {
    search: string;
    ciclo?: string;
    ciclo_escolar?: string;
}

export default function Filter() {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<FilterState>({ search: '' });
    const isInitialMount = useRef(true);

    useEffect(() => {
        const urlObj = new URL(url, window.location.origin);
        const p = new URLSearchParams(urlObj.search);
        const s = p.get('search') || '';
        setSearch(s);
        setFilters({
            search: s,
            ciclo: p.get('ciclo') || undefined,
            ciclo_escolar: p.get('ciclo_escolar') || undefined,
        });
        isInitialMount.current = false;
    }, [url]);

    const activeCount = [filters.ciclo, filters.ciclo_escolar].filter(Boolean).length + (search ? 1 : 0);

    const applyFilters = useCallback(() => {
        const params: Record<string, string> = {};
        if (search) params['search'] = search;
        if (filters.ciclo) params['ciclo'] = filters.ciclo;
        if (filters.ciclo_escolar) params['ciclo_escolar'] = filters.ciclo_escolar;
        router.get(route('secciones.index'), params, { preserveState: true, replace: true });
    }, [search, filters]);

    const clearFilters = () => {
        setSearch('');
        setFilters({ search: '' });
        setIsOpen(false);
        router.get(route('secciones.index'), {}, { preserveState: true, replace: true });
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
                <div className="relative flex-1">
                    <Search className="peer-focus:text-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground transition-colors" />
                    <Input
                        placeholder="Buscar secciones... (presiona Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="peer pl-10"
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
                                        <Label>Ciclo</Label>
                                        <Select
                                            value={filters.ciclo || ''}
                                            onValueChange={(v) => setFilters((p) => ({ ...p, ciclo: v || undefined }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CICLOS.map((c) => (
                                                    <SelectItem key={c} value={c} className="capitalize">
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Ciclo Escolar</Label>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 2024"
                                            value={filters.ciclo_escolar || ''}
                                            onChange={(e) => setFilters((p) => ({ ...p, ciclo_escolar: e.target.value || undefined }))}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button onClick={clearFilters} color="red" disabled={activeCount === 0}>
                                        <X className="mr-2 size-4" /> Limpiar
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
