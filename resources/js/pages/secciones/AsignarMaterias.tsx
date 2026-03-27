import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Check, Loader2, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Materia {
    id: number;
    nombre: string;
    codigo?: string;
    asignada: boolean;
    catedratico_id: number | null;
}

interface Catedratico {
    id: number;
    name: string;
}

interface Props {
    seccion: { id: number; nombre: string; ciclo: string; ciclo_escolar: number };
    materias: Materia[];
    catedraticos: Catedratico[];
    search: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Asignar materias', href: '#' },
];

AsignarMaterias.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function AsignarMaterias({ seccion, materias, catedraticos, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [toggling, setToggling] = useState<Set<number>>(new Set());
    const [updatingCat, setUpdatingCat] = useState<Set<number>>(new Set());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const totalAsignadas = materias.filter((m) => m.asignada).length;

    // Debounced server-side search
    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                `/secciones/${seccion.id}/materias`,
                value ? { search: value } : {},
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 350);
    }, [seccion.id]);

    useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

    const toggle = (materia: Materia) => {
        if (toggling.has(materia.id)) return;
        setToggling((prev) => new Set(prev).add(materia.id));
        router.post(
            `/secciones/${seccion.id}/materias/toggle`,
            { materia_id: materia.id },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['materias'],
                onFinish: () => setToggling((prev) => { const next = new Set(prev); next.delete(materia.id); return next; }),
            }
        );
    };

    const updateCatedratico = (materiaId: number, catedraticoId: number | null) => {
        if (updatingCat.has(materiaId)) return;
        setUpdatingCat((prev) => new Set(prev).add(materiaId));
        router.post(
            `/secciones/${seccion.id}/materias/catedratico`,
            { materia_id: materiaId, catedratico_id: catedraticoId },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['materias'],
                onFinish: () => setUpdatingCat((prev) => { const next = new Set(prev); next.delete(materiaId); return next; }),
            }
        );
    };

    return (
        <>
            <Head title={`Materias — ${seccion.nombre}`} />

            <div className="p-4 space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">{seccion.nombre}</h2>
                        <p className="text-sm text-muted-foreground capitalize">
                            {seccion.ciclo} · {seccion.ciclo_escolar}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium tabular-nums">{totalAsignadas} materias</span>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar por nombre o código..."
                        className="pl-8"
                        autoFocus
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => handleSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Lista */}
                {materias.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                        {search ? 'No se encontraron materias' : 'No hay materias disponibles'}
                    </div>
                ) : (
                    <div className="divide-y rounded-lg border overflow-hidden">
                        {materias.map((materia) => {
                            const loading = toggling.has(materia.id);
                            const loadingCat = updatingCat.has(materia.id);
                            return (
                                <div
                                    key={materia.id}
                                    className={[
                                        'transition-colors',
                                        materia.asignada ? 'bg-primary/5' : 'bg-background',
                                    ].join(' ')}
                                >
                                    {/* Fila principal */}
                                    <button
                                        type="button"
                                        onClick={() => toggle(materia)}
                                        disabled={loading}
                                        className={[
                                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                            materia.asignada ? 'hover:bg-primary/8' : 'hover:bg-muted/40',
                                            loading ? 'opacity-60 cursor-wait' : '',
                                        ].join(' ')}
                                    >
                                        {/* Checkbox visual */}
                                        <span className={[
                                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                            materia.asignada
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-muted-foreground/30',
                                        ].join(' ')}>
                                            {loading
                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                : materia.asignada && <Check className="h-3 w-3" />}
                                        </span>

                                        {/* Código badge */}
                                        {materia.codigo && (
                                            <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">
                                                {materia.codigo}
                                            </span>
                                        )}

                                        {/* Nombre */}
                                        <span className="min-w-0 flex-1 text-sm font-medium">{materia.nombre}</span>

                                        {/* Badge estado */}
                                        {materia.asignada && (
                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Asignada
                                            </span>
                                        )}
                                    </button>

                                    {/* Selector de catedrático */}
                                    {materia.asignada && (
                                        <div
                                            className="px-4 pb-3 pl-[3.25rem]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Select
                                                value={materia.catedratico_id?.toString() ?? 'none'}
                                                onValueChange={(v) =>
                                                    updateCatedratico(materia.id, v === 'none' ? null : parseInt(v))
                                                }
                                                disabled={loadingCat}
                                            >
                                                <SelectTrigger className="h-8 text-xs max-w-xs">
                                                    {loadingCat
                                                        ? <span className="flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Guardando...</span>
                                                        : <SelectValue placeholder="Asignar catedrático..." />}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin asignar</SelectItem>
                                                    {catedraticos.map((c) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
