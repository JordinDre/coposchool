import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle, BookOpen, CalendarDays, CalendarRange,
    ClipboardList, GraduationCap, TrendingUp, Users,
} from 'lucide-react';
import React from 'react';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
    ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

// ── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

Dashboard.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

// ── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    totalEstudiantes?: number;
    totalCatedraticos?: number;
    totalSecciones?: number;
    notasRegistradas?: number;
    promedioGeneral?: number | null;
    pctAprobados?: number | null;
    promedioUnidades?: { nombre: string; orden: number; promedio: number | null; count: number }[];
}

interface TopMateria {
    nombre: string;
    reprobadas: number;
    total: number;
    promedio: number;
    pct_reprobadas: number;
}

interface TendenciaDia {
    fecha: string;
    count: number;
    label: string;
}

interface DistribucionNota {
    rango: string;
    min: number;
    max: number;
    count: number;
}

interface EstudianteEnRiesgo {
    id: number;
    name: string;
    reprobadas: number;
    total: number;
}

interface RendimientoSeccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
    total_estudiantes: number;
    notas_registradas: number;
    promedio: number | null;
    pct_aprobados: number | null;
}

interface MiSeccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
    total_estudiantes: number;
    materias: Array<{ id: number; nombre: string; codigo?: string }>;
}

interface MiNota {
    id: number;
    nota: number | null;
    materia: { id: number; nombre: string };
    unidad: { id: number; nombre: string };
    seccion: { id: number; nombre: string };
}

interface Actividad {
    id: number;
    descripcion: string;
    evento: string | null;
    subject_type: string | null;
    subject_id: number | null;
    causer: { id: number; name: string } | null;
    created_at: string;
    propiedades: { attributes?: Record<string, unknown>; old?: Record<string, unknown> };
}

interface TendenciaUnidad {
    nombre: string;
    promedio: number | null;
}

interface UnidadActual {
    id: number;
    nombre: string;
    orden: number;
    ciclo_escolar: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
}

interface DashboardProps {
    cicloEscolar: number;
    stats: Stats;
    distribucionNotas: DistribucionNota[];
    topMaterias: TopMateria[];
    notasUltimos14Dias: TendenciaDia[];
    estudiantesEnRiesgo: EstudianteEnRiesgo[];
    rendimientoSecciones: RendimientoSeccion[];
    misSecciones: MiSeccion[];
    notasTendenciaCatedratico: TendenciaUnidad[];
    misNotas: MiNota[];
    actividadReciente: Actividad[];
    unidadActual: UnidadActual | null;
}

// ── Color maps ────────────────────────────────────────────────────────────────

const DIST_COLORS: Record<string, string> = {
    'Sobresaliente': '#16a34a',
    'Muy bueno':     '#4ade80',
    'Bueno':         '#f59e0b',
    'Suficiente':    '#f97316',
    'Reprobado':     '#ef4444',
};

const SUBJECT_LABELS: Record<string, string> = {
    'App\\Models\\Seccion': 'Sección',
    'App\\Models\\Materia': 'Materia',
    'App\\Models\\Unidad':  'Unidad',
    'App\\Models\\Nota':    'Nota',
    'App\\Models\\User':    'Usuario',
};

const EVENT_LABELS: Record<string, { label: string; classes: string }> = {
    created:  { label: 'creó',      classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800' },
    updated:  { label: 'actualizó', classes: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800' },
    deleted:  { label: 'desactivó', classes: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800' },
    restored: { label: 'reactivó',  classes: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null): string {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

function gradeColor(n: number | null): string {
    if (n === null) return 'text-muted-foreground';
    if (n >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (n >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

function promedioColor(p: number | null): string {
    if (p === null) return 'text-muted-foreground/40';
    if (p >= 70) return 'text-emerald-700 dark:text-emerald-400';
    if (p >= 60) return 'text-amber-700 dark:text-amber-400';
    return 'text-red-700 dark:text-red-400';
}

function barColorFor(avg: number | null): string {
    if (avg === null) return '#94a3b8';
    if (avg >= 70) return '#16a34a';
    if (avg >= 60) return '#f59e0b';
    return '#ef4444';
}

function formatRelative(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace un momento';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `hace ${days}d`;
    return new Date(dateStr).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
}

// ── Micro components ──────────────────────────────────────────────────────────

function MiniBar({ pct, color = 'bg-emerald-500' }: { pct: number; color?: string }) {
    return (
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-border/60">
            <div className={`absolute inset-y-0 left-0 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
    );
}

function PctBadge({ pct }: { pct: number | null }) {
    if (pct === null) return <span className="text-muted-foreground/40 text-xs tabular-nums">—</span>;
    const color = pct >= 70 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
    const bar   = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-20">
                <MiniBar pct={pct} color={bar} />
            </div>
            <span className={`w-8 text-right text-xs font-semibold tabular-nums ${color}`}>{pct}%</span>
        </div>
    );
}

function CardLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label, format }: {
    active?: boolean;
    payload?: Array<{ value: number; name?: string }>;
    label?: string;
    format?: (v: number) => string;
}) {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value;
    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
            <p className="font-medium text-foreground">{label}</p>
            {val !== undefined && (
                <p className="mt-0.5 tabular-nums text-muted-foreground">{format ? format(val) : val}</p>
            )}
        </div>
    );
}

// ── Charts ────────────────────────────────────────────────────────────────────

function DistribucionChart({ data }: { data: DistribucionNota[] }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return <Empty>Sin notas registradas aún.</Empty>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 2, right: 64, bottom: 2, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis
                    type="category"
                    dataKey="rango"
                    width={88}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={({ active, payload, label }) => (
                        <ChartTip
                            active={active}
                            payload={payload as Array<{ value: number }>}
                            label={label as string}
                            format={(v) => `${v} estudiantes · ${total > 0 ? Math.round(v / total * 100) : 0}%`}
                        />
                    )}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28} label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))', formatter: (v: number) => total > 0 ? `${Math.round(v / total * 100)}%` : '' }}>
                    {data.map((entry) => (
                        <Cell key={entry.rango} fill={DIST_COLORS[entry.rango] ?? '#94a3b8'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function PromedioUnidadChart({ data }: {
    data: { nombre: string; orden: number; promedio: number | null; count: number }[];
}) {
    if (data.length === 0) return <Empty>Sin unidades en el ciclo.</Empty>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={26} />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const item = data.find(d => d.nombre === label);
                        return (
                            <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="mt-0.5 text-muted-foreground">Promedio: {payload[0]?.value}</p>
                                <p className="text-muted-foreground">{item?.count ?? 0} notas</p>
                            </div>
                        );
                    }}
                />
                <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 3" strokeOpacity={0.5} />
                <Bar dataKey="promedio" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {data.map((entry) => (
                        <Cell key={entry.nombre} fill={barColorFor(entry.promedio)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function TopMateriasChart({ data }: { data: TopMateria[] }) {
    if (data.length === 0) return <Empty>Sin datos de materias aún.</Empty>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 2, right: 44, bottom: 2, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                    type="category"
                    dataKey="nombre"
                    width={108}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => v.length > 17 ? v.slice(0, 15) + '…' : v}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = data.find(x => x.nombre === label);
                        return (
                            <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="mt-0.5 text-muted-foreground">{d?.reprobadas} reprobados / {d?.total} notas ({d?.pct_reprobadas}%)</p>
                                <p className="text-muted-foreground">Promedio: {d?.promedio}</p>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="reprobadas" radius={[0, 4, 4, 0]} maxBarSize={26}
                    label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))', formatter: (v: number) => v > 0 ? v : '' }}>
                    {data.map((entry) => (
                        <Cell key={entry.nombre} fill={entry.pct_reprobadas >= 50 ? '#ef4444' : entry.pct_reprobadas >= 30 ? '#f97316' : '#f59e0b'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function TendenciaRegistroChart({ data }: { data: TendenciaDia[] }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return <Empty>Sin actividad en los últimos 14 días.</Empty>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                    content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                            <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="mt-0.5 text-muted-foreground">{payload[0]?.value} notas</p>
                            </div>
                        );
                    }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)"
                    dot={{ fill: '#3b82f6', r: 2.5, strokeWidth: 0 }}
                    activeDot={{ r: 4.5, fill: '#3b82f6', strokeWidth: 0 }} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function TendenciaCatedraticoChart({ data }: { data: TendenciaUnidad[] }) {
    if (data.length === 0 || data.every(d => d.promedio === null)) return <Empty>Sin notas registradas aún.</Empty>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={26} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={({ active, payload, label }) => (
                        <ChartTip active={active} payload={payload as Array<{ value: number }>} label={label as string} format={(v) => `Promedio: ${v}`} />
                    )}
                />
                <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 3" strokeOpacity={0.5} />
                <Bar dataKey="promedio" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {data.map((entry) => (
                        <Cell key={entry.nombre} fill={barColorFor(entry.promedio)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {children}
        </div>
    );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ actividad }: { actividad: Actividad }) {
    const event       = actividad.evento ?? '';
    const eventInfo   = EVENT_LABELS[event] ?? { label: event, classes: 'bg-muted text-muted-foreground ring-border' };
    const subjectLbl  = actividad.subject_type ? (SUBJECT_LABELS[actividad.subject_type] ?? actividad.subject_type.split('\\').pop()) : null;
    const attrs       = actividad.propiedades?.attributes ?? {};
    const subjectName = (attrs.nombre as string) ?? (attrs.name as string) ?? (attrs.nota != null ? `Nota: ${attrs.nota}` : null);

    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {actividad.causer?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                    <span className="font-medium">{actividad.causer?.name ?? 'Sistema'}</span>{' '}
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${eventInfo.classes}`}>
                        {eventInfo.label}
                    </span>
                    {subjectLbl  && <>{' '}<span className="text-muted-foreground">{subjectLbl}</span></>}
                    {subjectName && <>{' '}<span className="font-medium">"{subjectName}"</span></>}
                </p>
                {event === 'updated' && actividad.propiedades.old && (
                    <div className="mt-1 space-y-0.5">
                        {Object.entries(actividad.propiedades.old)
                            .filter(([k]) => !['updated_at', 'deleted_at'].includes(k))
                            .slice(0, 2)
                            .map(([key, oldVal]) => (
                                <p key={key} className="text-xs text-muted-foreground">
                                    <span className="font-medium">{key}:</span>{' '}
                                    <span className="line-through opacity-60">{String(oldVal ?? '—')}</span>
                                    {' → '}
                                    <span>{String((attrs[key] as string | number | null) ?? '—')}</span>
                                </p>
                            ))}
                    </div>
                )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(actividad.created_at)}</span>
        </div>
    );
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</h2>
            {action}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard({
    cicloEscolar,
    stats,
    distribucionNotas,
    topMaterias,
    notasUltimos14Dias,
    estudiantesEnRiesgo,
    rendimientoSecciones,
    misSecciones,
    notasTendenciaCatedratico,
    misNotas,
    actividadReciente,
    unidadActual,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    const totalNotas14d  = notasUltimos14Dias.reduce((s, d) => s + d.count, 0);
    const totalDistNotas = distribucionNotas.reduce((s, d) => s + d.count, 0);

    const hasDistribucion = distribucionNotas.length > 0 && totalDistNotas > 0;
    const hasPromedioUnd  = (stats.promedioUnidades?.length ?? 0) > 0;
    const hasTopMaterias  = topMaterias.length > 0;
    const hasTendencia    = notasUltimos14Dias.length > 0;
    const hasAtRisk       = estudiantesEnRiesgo.length > 0;
    const hasRend         = rendimientoSecciones.length > 0;
    const hasCatedratico  = misSecciones.length > 0;
    const hasEstudiante   = misNotas.length > 0;
    const hasActivity     = actividadReciente.length > 0;

    // Build stat rows
    const statCards = [
        stats.totalEstudiantes !== undefined  && { key: 'est',  label: 'Estudiantes',      value: stats.totalEstudiantes,  sub: 'activos',     icon: GraduationCap, href: '/estudiantes',  accent: 'text-foreground' },
        stats.totalCatedraticos !== undefined && { key: 'cat',  label: 'Catedráticos',     value: stats.totalCatedraticos, sub: 'activos',     icon: Users,         href: '/catedraticos', accent: 'text-foreground' },
        stats.totalSecciones !== undefined    && { key: 'sec',  label: 'Secciones',        value: stats.totalSecciones,    sub: 'en el ciclo', icon: BookOpen,      href: '/secciones',    accent: 'text-foreground' },
        stats.notasRegistradas !== undefined  && { key: 'not',  label: 'Notas reg.',       value: stats.notasRegistradas,  sub: 'en el ciclo', icon: ClipboardList, href: '/notas',        accent: 'text-foreground' },
        stats.promedioGeneral != null         && { key: 'prom', label: 'Promedio',         value: stats.promedioGeneral,   sub: 'general ciclo', icon: TrendingUp,  href: '/notas',        accent: promedioColor(stats.promedioGeneral ?? null) },
        stats.pctAprobados != null            && { key: 'pct',  label: '% Aprobados',      value: `${stats.pctAprobados}%`, sub: 'del ciclo',  icon: AlertTriangle, href: '/notas',        accent: (stats.pctAprobados ?? 0) >= 70 ? 'text-emerald-600 dark:text-emerald-400' : (stats.pctAprobados ?? 0) >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400' },
    ].filter(Boolean) as { key: string; label: string; value: number | string; sub: string; icon: React.ComponentType<{ className?: string }>; href: string; accent: string }[];

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">
                            Bienvenido, {auth.user?.name?.split(' ')[0]}
                        </h1>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Panel de control · Ciclo escolar {cicloEscolar}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium">
                        <CalendarDays className="size-3 text-muted-foreground" />
                        {cicloEscolar}
                    </div>
                </div>

                {/* ── Unidad activa ── */}
                {unidadActual && (() => {
                    const fin  = unidadActual.fecha_fin ? new Date(unidadActual.fecha_fin + 'T12:00:00') : null;
                    const dias = fin ? Math.max(0, Math.ceil((fin.getTime() - Date.now()) / 86400000)) : null;
                    const pctTranscurrido = (() => {
                        if (!unidadActual.fecha_inicio || !unidadActual.fecha_fin) return null;
                        const start = new Date(unidadActual.fecha_inicio + 'T00:00:00').getTime();
                        const end   = new Date(unidadActual.fecha_fin   + 'T23:59:59').getTime();
                        const now   = Date.now();
                        return Math.min(100, Math.max(0, Math.round((now - start) / (end - start) * 100)));
                    })();
                    return (
                        <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <CalendarRange className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-semibold text-foreground">{unidadActual.nombre}</span>
                                    {unidadActual.fecha_inicio && unidadActual.fecha_fin && (
                                        <span className="text-xs text-muted-foreground">
                                            {fmtDate(unidadActual.fecha_inicio)} – {fmtDate(unidadActual.fecha_fin)}
                                        </span>
                                    )}
                                </div>
                                {pctTranscurrido !== null && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="relative h-1 w-32 overflow-hidden rounded-full bg-primary/15">
                                            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pctTranscurrido}%` }} />
                                        </div>
                                        <span className="text-[10px] text-primary/70">{pctTranscurrido}% transcurrido</span>
                                    </div>
                                )}
                            </div>
                            {dias !== null && (
                                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                    {dias === 0 ? 'Termina hoy' : `${dias}d restantes`}
                                </span>
                            )}
                        </div>
                    );
                })()}

                {/* ── Stat cards ── */}
                {statCards.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {statCards.map(({ key, label, value, sub, icon: Icon, href, accent }) => (
                            <Link key={key} href={href}>
                                <Card className="group transition-colors hover:bg-muted/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-1">
                                            <CardLabel>{label}</CardLabel>
                                            <Icon className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
                                        </div>
                                        <p className={`mt-2 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
                                        <p className="mt-0.5 text-[10px] text-muted-foreground/60">{sub}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* ── Row 1: Distribución (2/3) + Tendencia registro (1/3) ── */}
                {(hasDistribucion || hasTendencia) && (
                    <div className="grid gap-4 lg:grid-cols-3">

                        {hasDistribucion && (
                            <Card className="lg:col-span-2">
                                <CardHeader className="border-b px-5 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-sm font-semibold">Distribución de calificaciones</CardTitle>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {totalDistNotas} notas · ciclo {cicloEscolar}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 pt-0.5">
                                            {distribucionNotas.slice().reverse().map((d) => (
                                                <span key={d.rango} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <span className="size-2 rounded-full" style={{ background: DIST_COLORS[d.rango] }} />
                                                    {d.rango}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-2 pb-3 pt-4">
                                    <div style={{ height: 192 }}>
                                        <DistribucionChart data={distribucionNotas} />
                                    </div>
                                    <div className="mt-3 grid grid-cols-5 divide-x border-t pt-3">
                                        {distribucionNotas.slice().reverse().map((d) => (
                                            <div key={d.rango} className="px-2 text-center">
                                                <p className="text-sm font-bold tabular-nums" style={{ color: DIST_COLORS[d.rango] }}>
                                                    {totalDistNotas > 0 ? Math.round(d.count / totalDistNotas * 100) : 0}%
                                                </p>
                                                <p className="text-[9px] leading-tight text-muted-foreground">{d.rango}</p>
                                                <p className="text-[9px] text-muted-foreground/50">{d.count} notas</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {hasTendencia && (
                            <Card>
                                <CardHeader className="border-b px-5 py-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-sm font-semibold">Actividad reciente</CardTitle>
                                            <p className="mt-0.5 text-xs text-muted-foreground">Notas ingresadas · 14 días</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{totalNotas14d}</p>
                                            <p className="text-[10px] text-muted-foreground">notas</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-2 pb-3 pt-4">
                                    <div style={{ height: 192 }}>
                                        <TendenciaRegistroChart data={notasUltimos14Dias} />
                                    </div>
                                    <div className="mt-3 border-t pt-3 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Promedio diario:{' '}
                                            <span className="font-semibold text-foreground">
                                                {(totalNotas14d / 14).toFixed(1)}
                                            </span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── Row 2: Promedio por unidad + Top materias reprobadas ── */}
                {(hasPromedioUnd || hasTopMaterias) && (
                    <div className="grid gap-4 lg:grid-cols-2">

                        {hasPromedioUnd && (
                            <Card>
                                <CardHeader className="border-b px-5 py-4">
                                    <CardTitle className="text-sm font-semibold">Promedio general por unidad</CardTitle>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Promedio de todas las secciones · línea roja = mínimo (60)
                                    </p>
                                </CardHeader>
                                <CardContent className="px-2 pb-3 pt-4">
                                    <div style={{ height: 200 }}>
                                        <PromedioUnidadChart data={stats.promedioUnidades!} />
                                    </div>
                                    <div className="mt-3 grid divide-x border-t pt-3" style={{ gridTemplateColumns: `repeat(${stats.promedioUnidades!.length}, 1fr)` }}>
                                        {stats.promedioUnidades!.map((u) => (
                                            <div key={u.nombre} className="px-2 text-center">
                                                <p className={`text-sm font-bold tabular-nums ${promedioColor(u.promedio)}`}>
                                                    {u.promedio !== null ? u.promedio.toFixed(1) : '—'}
                                                </p>
                                                <p className="text-[9px] leading-tight text-muted-foreground">{u.nombre}</p>
                                                <p className="text-[9px] text-muted-foreground/50">{u.count} notas</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {hasTopMaterias && (
                            <Card>
                                <CardHeader className="border-b px-5 py-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                                                <AlertTriangle className="size-3.5 text-amber-500" />
                                                Materias con más reprobados
                                            </CardTitle>
                                            <p className="mt-0.5 text-xs text-muted-foreground">Top 6 por cantidad de reprobados</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-2 pb-3 pt-4">
                                    <div style={{ height: 200 }}>
                                        <TopMateriasChart data={topMaterias} />
                                    </div>
                                    <div className="mt-3 flex items-center justify-end gap-4 border-t pt-3">
                                        {[['#ef4444','≥50%'],['#f97316','30–49%'],['#f59e0b','<30%']].map(([c,l]) => (
                                            <span key={l} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <span className="inline-block size-2 rounded-full" style={{ background: c }} />{l}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── Row 3: Rendimiento secciones + Estudiantes en riesgo ── */}
                {(hasRend || hasAtRisk) && (
                    <div className="grid gap-4 lg:grid-cols-2">

                        {hasRend && (
                            <section className="space-y-3">
                                <SectionTitle
                                    action={
                                        <Link href="/notas" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                                            Ver notas →
                                        </Link>
                                    }
                                >
                                    Rendimiento por sección · {cicloEscolar}
                                </SectionTitle>
                                <Card>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/20">
                                                    <th className="px-4 py-2.5 text-left"><CardLabel>Sección</CardLabel></th>
                                                    <th className="px-4 py-2.5 text-right"><CardLabel>Alumnos</CardLabel></th>
                                                    <th className="px-4 py-2.5 text-right"><CardLabel>Promedio</CardLabel></th>
                                                    <th className="px-4 py-2.5"><CardLabel>% Aprobados</CardLabel></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {rendimientoSecciones.map((sec) => (
                                                    <tr key={sec.id} className="transition-colors hover:bg-muted/10">
                                                        <td className="px-4 py-2.5">
                                                            <div className="font-medium text-sm">{sec.nombre}</div>
                                                            <div className="text-[10px] capitalize text-muted-foreground">{sec.ciclo}</div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground text-sm">{sec.total_estudiantes}</td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            {sec.promedio !== null ? (
                                                                <span className={`tabular-nums font-semibold text-sm ${promedioColor(sec.promedio)}`}>
                                                                    {sec.promedio.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground/40">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <PctBadge pct={sec.pct_aprobados} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </section>
                        )}

                        {hasAtRisk && (
                            <section className="space-y-3">
                                <SectionTitle>
                                    <span className="flex items-center gap-1.5">
                                        <AlertTriangle className="size-3 text-red-500" />
                                        Estudiantes en riesgo · {cicloEscolar}
                                    </span>
                                </SectionTitle>
                                <Card>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/20">
                                                    <th className="px-4 py-2.5 text-left"><CardLabel>Estudiante</CardLabel></th>
                                                    <th className="px-4 py-2.5 text-right"><CardLabel>Reprobadas</CardLabel></th>
                                                    <th className="px-4 py-2.5 text-right"><CardLabel>Total</CardLabel></th>
                                                    <th className="px-4 py-2.5"><CardLabel>Gravedad</CardLabel></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {estudiantesEnRiesgo.map((est) => {
                                                    const pct = est.total > 0 ? Math.round(est.reprobadas / est.total * 100) : 0;
                                                    return (
                                                        <tr key={est.id} className="transition-colors hover:bg-muted/10">
                                                            <td className="px-4 py-2.5 font-medium text-sm">{est.name}</td>
                                                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600 dark:text-red-400 text-sm">
                                                                {est.reprobadas}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground text-sm">
                                                                {est.total}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16">
                                                                        <MiniBar pct={pct} color="bg-red-500" />
                                                                    </div>
                                                                    <span className="w-8 text-right text-xs font-semibold tabular-nums text-red-600 dark:text-red-400">
                                                                        {pct}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </section>
                        )}
                    </div>
                )}

                {/* ── Actividad reciente ── */}
                {hasActivity && (
                    <section className="space-y-3">
                        <SectionTitle>Actividad reciente</SectionTitle>
                        <Card>
                            <CardContent className="px-4 py-2">
                                <div className="divide-y">
                                    {actividadReciente.map((a) => (
                                        <ActivityRow key={a.id} actividad={a} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* ── Catedrático: mis secciones + tendencia ── */}
                {hasCatedratico && (
                    <div className="space-y-6">
                        <section className="space-y-3">
                            <SectionTitle>Mis secciones · {cicloEscolar}</SectionTitle>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {misSecciones.map((seccion) => (
                                    <Card key={seccion.id}>
                                        <CardHeader className="border-b px-4 py-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-sm leading-snug">{seccion.nombre}</CardTitle>
                                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                                                    {seccion.ciclo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{seccion.total_estudiantes} estudiantes</p>
                                        </CardHeader>
                                        <CardContent className="px-4 py-3">
                                            <ul className="space-y-1">
                                                {seccion.materias.map((m) => (
                                                    <li key={m.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="size-1 shrink-0 rounded-full bg-border" />
                                                        {m.codigo && <span className="text-[10px] text-muted-foreground/50">{m.codigo}</span>}
                                                        {m.nombre}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {notasTendenciaCatedratico.some(d => d.promedio !== null) && (
                            <section className="space-y-3">
                                <SectionTitle>Tendencia por unidad · mis materias</SectionTitle>
                                <Card>
                                    <CardHeader className="border-b px-5 py-4">
                                        <p className="text-xs text-muted-foreground">
                                            Promedio de mis materias asignadas · línea roja = mínimo (60)
                                        </p>
                                    </CardHeader>
                                    <CardContent className="px-2 pb-3 pt-4">
                                        <div style={{ height: 200 }}>
                                            <TendenciaCatedraticoChart data={notasTendenciaCatedratico} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>
                        )}
                    </div>
                )}

                {/* ── Estudiante: mis notas ── */}
                {hasEstudiante && (
                    <section className="space-y-3">
                        <SectionTitle>Mis calificaciones · {cicloEscolar}</SectionTitle>
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="px-4 py-2.5 text-left"><CardLabel>Sección</CardLabel></th>
                                            <th className="px-4 py-2.5 text-left"><CardLabel>Materia</CardLabel></th>
                                            <th className="px-4 py-2.5 text-left"><CardLabel>Unidad</CardLabel></th>
                                            <th className="px-4 py-2.5 text-right"><CardLabel>Nota</CardLabel></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {misNotas.map((nota) => (
                                            <tr key={nota.id} className="hover:bg-muted/10">
                                                <td className="px-4 py-2.5 text-muted-foreground">{nota.seccion.nombre}</td>
                                                <td className="px-4 py-2.5 font-medium">{nota.materia.nombre}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{nota.unidad.nombre}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <span className={`font-semibold tabular-nums ${gradeColor(nota.nota)}`}>
                                                        {nota.nota ?? '—'}
                                                    </span>
                                                    {nota.nota !== null && nota.nota >= 60 ? (
                                                        <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800">
                                                            Aprobado
                                                        </span>
                                                    ) : nota.nota !== null ? (
                                                        <span className="ml-1.5 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800">
                                                            Reprobado
                                                        </span>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </section>
                )}

                {/* ── Empty state ── */}
                {statCards.length === 0 && !hasCatedratico && !hasEstudiante && !hasDistribucion && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <BookOpen className="mb-3 size-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium">Sin datos para mostrar</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                No tienes permisos asignados o aún no hay datos en el ciclo {cicloEscolar}.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
