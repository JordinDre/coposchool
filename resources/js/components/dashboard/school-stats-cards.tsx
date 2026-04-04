import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { AlertTriangle, BookOpen, ClipboardList, GraduationCap, TrendingUp, Users, type LucideIcon } from 'lucide-react';

interface Stats {
    totalEstudiantes?: number;
    totalCatedraticos?: number;
    totalSecciones?: number;
    notasRegistradas?: number;
    promedioGeneral?: number | null;
    pctAprobados?: number | null;
}

interface SchoolStatsCardsProps {
    stats: Stats;
}

export function SchoolStatsCards({ stats }: SchoolStatsCardsProps) {
    const statsToShow = [
        stats.totalEstudiantes !== undefined && {
            key: 'est',
            label: 'Estudiantes',
            value: stats.totalEstudiantes,
            sub: 'activos',
            icon: GraduationCap,
            href: '/estudiantes',
        },
        stats.totalCatedraticos !== undefined && {
            key: 'cat',
            label: 'Catedráticos',
            value: stats.totalCatedraticos,
            sub: 'activos',
            icon: Users,
            href: '/catedraticos',
        },
        stats.totalSecciones !== undefined && {
            key: 'sec',
            label: 'Secciones',
            value: stats.totalSecciones,
            sub: 'en el ciclo',
            icon: BookOpen,
            href: '/secciones',
        },
        stats.notasRegistradas !== undefined && {
            key: 'not',
            label: 'Notas reg.',
            value: stats.notasRegistradas,
            sub: 'en el ciclo',
            icon: ClipboardList,
            href: '/notas',
        },
        stats.promedioGeneral != null && {
            key: 'prom',
            label: 'Promedio',
            value: stats.promedioGeneral,
            sub: 'general ciclo',
            icon: TrendingUp,
            href: '/notas',
        },
        stats.pctAprobados != null && {
            key: 'pct',
            label: '% Aprobados',
            value: `${stats.pctAprobados}%`,
            sub: 'del ciclo',
            icon: AlertTriangle,
            href: '/notas',
        },
    ].filter(Boolean) as Array<{
        key: string;
        label: string;
        value: number | string;
        sub: string;
        icon: LucideIcon;
        href: string;
    }>;

    const STAT_GRADIENTS: Record<string, string> = {
        est: 'from-blue-500 to-blue-600',
        cat: 'from-indigo-500 to-purple-600',
        sec: 'from-emerald-500 to-teal-600',
        not: 'from-amber-500 to-orange-600',
        prom: 'from-sky-500 to-blue-600',
        pct: 'from-violet-500 to-indigo-600',
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {statsToShow.map(({ key, label, value, sub, icon: Icon, href }) => {
                const grad = STAT_GRADIENTS[key] ?? 'from-primary to-primary/80';
                return (
                    <Link key={key} href={href} className="group block">
                        <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-primary/50">
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${grad}`} />
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]`}
                            />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    {label}
                                </CardTitle>
                                <div
                                    className={`rounded-xl bg-gradient-to-br ${grad} p-2 text-white shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md`}
                                >
                                    <Icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
