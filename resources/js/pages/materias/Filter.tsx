import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Filter() {
    const { url } = usePage();
    const [search, setSearch] = useState('');
    const isInitialMount = useRef(true);

    useEffect(() => {
        const p = new URLSearchParams(new URL(url, window.location.origin).search);
        setSearch(p.get('search') || '');
        isInitialMount.current = false;
    }, [url]);

    const applySearch = (value: string) => {
        const params: Record<string, string> = {};
        if (value) params['search'] = value;
        router.get(route('materias.index'), params, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applySearch(search.trim());
        }
    };

    return (
        <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar materias... (presiona Enter)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                />
            </div>
            {search && (
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); applySearch(''); }}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
