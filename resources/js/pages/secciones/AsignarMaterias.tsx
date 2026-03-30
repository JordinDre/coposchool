import { Input } from '@/components/ui/input';
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
}

interface Props {
    seccion: { id: number; nombre: string; ciclo: string; ciclo_escolar: number };
    materias: Materia[];
    search: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Asignar materias', href: '#' },
];

AsignarMaterias.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function AsignarMaterias({ seccion, materias, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [toggling, setToggling] = useState<Set<number>>(new Set());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const totalAsignadas = materias.filter((m) => m.asignada).length;

    // Debounced server-side search
    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(`/secciones/${seccion.id}/materias`, value ? { search: value } : {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }, 350);
        },
        [seccion.id],
    );

    useEffect(
        () => () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        },
        [],
    );

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
                onFinish: () =>
                    setToggling((prev) => {
                        const next = new Set(prev);
                        next.delete(materia.id);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title={`Materias — ${seccion.nombre}`} />

            <div className="space-y-5 p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">{seccion.nombre}</h2>
                        <p className="text-sm text-muted-foreground capitalize">{seccion.ciclo}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium tabular-nums">{totalAsignadas} materias</span>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <div className="divide-y overflow-hidden rounded-lg border">
                        {materias.map((materia) => {
                            const loading = toggling.has(materia.id);
                            return (
                                <div
                                    key={materia.id}
                                    className={['transition-colors', materia.asignada ? 'bg-primary/5' : 'bg-background'].join(' ')}
                                >
                                    {/* Fila principal */}
                                    <button
                                        type="button"
                                        onClick={() => toggle(materia)}
                                        disabled={loading}
                                        className={[
                                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                            materia.asignada ? 'hover:bg-primary/8' : 'hover:bg-muted/40',
                                            loading ? 'cursor-wait opacity-60' : '',
                                        ].join(' ')}
                                    >
                                        {/* Checkbox visual */}
                                        <span
                                            className={[
                                                'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                                materia.asignada ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30',
                                            ].join(' ')}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                materia.asignada && <Check className="h-3 w-3" />
                                            )}
                                        </span>

                                        {/* Código badge */}
                                        {materia.codigo && (
                                            <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-muted font-mono text-xs font-semibold text-muted-foreground">
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
