import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Loader2, Search, User, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Materia {
    id: number;
    nombre: string;
    codigo?: string;
    asignada: boolean;
}

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
    materias: Materia[];
}

interface Props {
    catedratico: { id: number; name: string };
    secciones: Seccion[];
    search: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Catedráticos', href: '/catedraticos' },
    { title: 'Asignaciones', href: '#' },
];

Asignaciones.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Asignaciones({ catedratico, secciones, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [toggling, setToggling] = useState<Set<string>>(new Set());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const totalAsignadas = secciones.reduce((sum, s) => sum + s.materias.filter((m) => m.asignada).length, 0);

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(`/catedraticos/${catedratico.id}/asignaciones`, value ? { search: value } : {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }, 350);
        },
        [catedratico.id],
    );

    useEffect(
        () => () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        },
        [],
    );

    const toggle = (seccionId: number, materiaId: number) => {
        const key = `${seccionId}-${materiaId}`;
        if (toggling.has(key)) return;
        setToggling((prev) => new Set(prev).add(key));
        router.post(
            `/catedraticos/${catedratico.id}/asignaciones/toggle`,
            { seccion_id: seccionId, materia_id: materiaId },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['secciones'],
                onFinish: () =>
                    setToggling((prev) => {
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title={`Asignaciones — ${catedratico.name}`} />

            <div className="space-y-5 p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{catedratico.name}</h2>
                            <p className="text-sm text-muted-foreground">Asignaciones de secciones y materias</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
                        <span className="text-sm font-medium tabular-nums">{totalAsignadas} asignaciones</span>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por materia..." className="pl-8" />
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

                {/* Secciones */}
                {secciones.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                        {search ? 'No se encontraron materias' : 'No hay secciones con materias configuradas'}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {secciones.map((seccion) => {
                            const asignadasCount = seccion.materias.filter((m) => m.asignada).length;
                            return (
                                <div key={seccion.id} className="overflow-hidden rounded-lg border">
                                    {/* Encabezado de sección */}
                                    <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5">
                                        <div>
                                            <span className="text-sm font-medium">{seccion.nombre}</span>
                                            <span className="ml-2 text-xs text-muted-foreground capitalize">
                                                {seccion.ciclo} · {seccion.ciclo_escolar}
                                            </span>
                                        </div>
                                        {asignadasCount > 0 && (
                                            <span className="text-xs font-medium text-primary">
                                                {asignadasCount}/{seccion.materias.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Materias */}
                                    <div className="divide-y">
                                        {seccion.materias.map((materia) => {
                                            const key = `${seccion.id}-${materia.id}`;
                                            const loading = toggling.has(key);
                                            return (
                                                <button
                                                    key={materia.id}
                                                    type="button"
                                                    onClick={() => toggle(seccion.id, materia.id)}
                                                    disabled={loading}
                                                    className={[
                                                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                                        materia.asignada ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-muted/40',
                                                        loading ? 'cursor-wait opacity-60' : '',
                                                    ].join(' ')}
                                                >
                                                    {/* Checkbox visual */}
                                                    <span
                                                        className={[
                                                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                                            materia.asignada
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-muted-foreground/30',
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

                                                    {/* Badge asignado */}
                                                    {materia.asignada && (
                                                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                            Asignado
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
