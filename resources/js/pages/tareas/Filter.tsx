import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface FilterProps {
    secciones: { id: number; nombre: string; ciclo: string; ciclo_escolar: number }[];
    materias: { id: number; nombre: string; codigo?: string }[];
    unidades: { id: number; nombre: string; orden: number; ciclo_escolar: number }[];
    filtros: {
        seccion_id: string;
        materia_id: string;
        unidad_id: string;
    };
}

export default function Filter({ secciones, materias, unidades, filtros }: FilterProps) {
    const [seccionId, setSeccionId] = useState<string>(filtros.seccion_id || '');
    const [materiaId, setMateriaId] = useState<string>(filtros.materia_id || '');
    const [unidadId, setUnidadId] = useState<string>(filtros.unidad_id || '');

    const handleSeccionChange = (val: string) => {
        const v = val === 'all' ? '' : val;
        setSeccionId(v);
        setMateriaId('');
        applyFilters(v, '', unidadId);
    };

    const handleMateriaChange = (val: string) => {
        const v = val === 'all' ? '' : val;
        setMateriaId(v);
        applyFilters(seccionId, v, unidadId);
    };

    const handleUnidadChange = (val: string) => {
        const v = val === 'all' ? '' : val;
        setUnidadId(v);
        applyFilters(seccionId, materiaId, v);
    };

    const applyFilters = (sec: string, mat: string, uni: string) => {
        const params: Record<string, string> = {};
        if (sec) params['seccion_id'] = sec;
        if (mat) params['materia_id'] = mat;
        if (uni) params['unidad_id'] = uni;

        router.get(route('tareas.index'), params, { preserveState: true, replace: true, preserveScroll: true });
    };

    return (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={seccionId || 'all'} onValueChange={handleSeccionChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sección..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las secciones</SelectItem>
                    {secciones.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                            {s.nombre} · {s.ciclo_escolar}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={materiaId || 'all'} onValueChange={handleMateriaChange} disabled={!seccionId || materias.length === 0}>
                <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder={seccionId ? 'Materia...' : 'Elija sección...'} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las materias</SelectItem>
                    {materias.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                            {m.codigo ? `${m.codigo} - ` : ''}
                            {m.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={unidadId || 'all'} onValueChange={handleUnidadChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Unidad..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las unidades</SelectItem>
                    {unidades.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                            Unidad {u.orden}: {u.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
