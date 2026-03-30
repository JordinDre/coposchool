import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Loader2, Search, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Estudiante {
    id: number;
    name: string;
    email: string;
    inscrito: boolean;
    seccion_actual?: string;
}

interface Props {
    seccion: { id: number; nombre: string; ciclo: string; ciclo_escolar: number };
    estudiantes: Estudiante[];
    totalInscritos: number;
    search: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Secciones', href: '/secciones' },
    { title: 'Inscribir estudiantes', href: '#' },
];

Inscribir.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Inscribir({ seccion, estudiantes, totalInscritos, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [toggling, setToggling] = useState<Set<number>>(new Set());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced server-side search
    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(`/secciones/${seccion.id}/inscribir`, value ? { search: value } : {}, {
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

    const toggle = (id: number) => {
        if (toggling.has(id)) return;
        setToggling((prev) => new Set(prev).add(id));
        router.post(
            `/secciones/${seccion.id}/inscribir/toggle`,
            { estudiante_id: id },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['estudiantes', 'totalInscritos'],
                onFinish: () =>
                    setToggling((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title={`Inscribir — ${seccion.nombre}`} />

            <div className="space-y-5 p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">{seccion.nombre}</h2>
                        <p className="text-sm text-muted-foreground capitalize">{seccion.ciclo}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium tabular-nums">{totalInscritos} inscritos</span>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
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
                {estudiantes.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                        {search ? 'No se encontraron estudiantes' : 'No hay estudiantes disponibles'}
                    </div>
                ) : (
                    <div className="divide-y overflow-hidden rounded-lg border">
                        {estudiantes.map((est) => {
                            const loading = toggling.has(est.id);
                            return (
                                <button
                                    key={est.id}
                                    type="button"
                                    onClick={() => toggle(est.id)}
                                    disabled={loading}
                                    className={[
                                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                        est.inscrito ? 'bg-primary/5 hover:bg-primary/8' : 'bg-background hover:bg-muted/40',
                                        loading ? 'cursor-wait opacity-60' : '',
                                    ].join(' ')}
                                >
                                    {/* Checkbox visual */}
                                    <span
                                        className={[
                                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                            est.inscrito ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30',
                                        ].join(' ')}
                                    >
                                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : est.inscrito && <Check className="h-3 w-3" />}
                                    </span>

                                    {/* Avatar inicial */}
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground uppercase">
                                        {est.name.charAt(0)}
                                    </span>

                                    {/* Nombre + sección actual */}
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">{est.name}</span>
                                        {!est.inscrito && est.seccion_actual && (
                                            <span className="block truncate text-xs text-amber-600 dark:text-amber-400">
                                                En: {est.seccion_actual} · se moverá a esta sección
                                            </span>
                                        )}
                                    </span>

                                    {/* Badge estado */}
                                    {est.inscrito && (
                                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            Inscrito
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
