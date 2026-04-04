<?php

namespace App\Http\Controllers;

use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $cicloEscolar = $request->input('ciclo_escolar', now()->year);

        $stats = [];

        // ── Totales de personas ──────────────────────────────────────────────
        if ($user->can('ver usuarios')) {
            $stats['totalEstudiantes'] = User::role('estudiante')->count();
            $stats['totalCatedraticos'] = User::role('catedratico')->count();
        }

        if ($user->can('listar secciones')) {
            $stats['totalSecciones'] = Seccion::where('ciclo_escolar', $cicloEscolar)->count();
        }

        if ($user->can('listar notas')) {
            $stats['notasRegistradas'] = Nota::whereHas(
                'unidad', fn ($q) => $q->where('ciclo_escolar', $cicloEscolar)
            )->count();
        }

        // ── Distribución de notas (5 rangos) ─────────────────────────────────
        $distribucionNotas = [];
        $topMaterias = [];
        $notasUltimos14Dias = [];
        if ($user->can('listar notas')) {
            $todasLasNotas = Nota::whereHas(
                'unidad', fn ($q) => $q->where('ciclo_escolar', $cicloEscolar)
            )
                ->whereNotNull('nota')
                ->pluck('nota')
                ->map(fn ($n) => (float) $n);

            $total = $todasLasNotas->count();

            $distribucionNotas = [
                ['rango' => 'Reprobado',     'min' => 0,  'max' => 59,  'count' => $todasLasNotas->filter(fn ($n) => $n < 60)->count()],
                ['rango' => 'Suficiente',    'min' => 60, 'max' => 69,  'count' => $todasLasNotas->filter(fn ($n) => $n >= 60 && $n < 70)->count()],
                ['rango' => 'Bueno',         'min' => 70, 'max' => 79,  'count' => $todasLasNotas->filter(fn ($n) => $n >= 70 && $n < 80)->count()],
                ['rango' => 'Muy bueno',     'min' => 80, 'max' => 89,  'count' => $todasLasNotas->filter(fn ($n) => $n >= 80 && $n < 90)->count()],
                ['rango' => 'Sobresaliente', 'min' => 90, 'max' => 100, 'count' => $todasLasNotas->filter(fn ($n) => $n >= 90)->count()],
            ];

            // Promedio general por unidad
            $promedioUnidades = Unidad::whereNull('deleted_at')
                ->where('ciclo_escolar', $cicloEscolar)
                ->orderBy('orden')
                ->get(['id', 'nombre', 'orden'])
                ->map(function (Unidad $u): array {
                    $avg = Nota::where('unidad_id', $u->id)
                        ->whereNotNull('nota')
                        ->avg('nota');

                    return [
                        'nombre' => $u->nombre,
                        'orden' => $u->orden,
                        'promedio' => $avg !== null ? round((float) $avg, 1) : null,
                        'count' => Nota::where('unidad_id', $u->id)->whereNotNull('nota')->count(),
                    ];
                });

            $stats['promedioUnidades'] = $promedioUnidades->values();

            // KPIs globales
            $stats['promedioGeneral'] = $total > 0 ? round($todasLasNotas->avg(), 1) : null;
            $stats['pctAprobados'] = $total > 0
                ? (int) round($todasLasNotas->filter(fn ($n) => $n >= 60)->count() / $total * 100)
                : null;

            // Top 6 materias con más reprobados
            $topMaterias = DB::table('notas')
                ->join('materias', 'notas.materia_id', '=', 'materias.id')
                ->join('unidades', 'notas.unidad_id', '=', 'unidades.id')
                ->where('unidades.ciclo_escolar', $cicloEscolar)
                ->whereNotNull('notas.nota')
                ->whereNull('notas.deleted_at')
                ->whereNull('unidades.deleted_at')
                ->whereNull('materias.deleted_at')
                ->select(
                    'materias.nombre',
                    DB::raw('COUNT(*) as total_notas'),
                    DB::raw('SUM(CASE WHEN notas.nota < 60 THEN 1 ELSE 0 END) as reprobadas'),
                    DB::raw('ROUND(AVG(notas.nota), 1) as promedio')
                )
                ->groupBy('materias.id', 'materias.nombre')
                ->orderByDesc('reprobadas')
                ->limit(6)
                ->get()
                ->map(fn ($row) => [
                    'nombre' => $row->nombre,
                    'reprobadas' => (int) $row->reprobadas,
                    'total' => (int) $row->total_notas,
                    'promedio' => (float) $row->promedio,
                    'pct_reprobadas' => (int) $row->total_notas > 0
                        ? (int) round((int) $row->reprobadas / (int) $row->total_notas * 100)
                        : 0,
                ])
                ->values();

            // Registro de notas en los últimos 14 días
            $registroPorDia = DB::table('notas')
                ->where('created_at', '>=', now()->subDays(13)->startOfDay())
                ->whereNull('deleted_at')
                ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('COUNT(*) as count'))
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get()
                ->keyBy('fecha');

            $notasUltimos14Dias = collect(range(13, 0))
                ->map(fn (int $d) => now()->subDays($d)->toDateString())
                ->map(fn (string $fecha) => [
                    'fecha' => $fecha,
                    'count' => (int) ($registroPorDia[$fecha]->count ?? 0),
                    'label' => \Carbon\Carbon::parse($fecha)->locale('es')->isoFormat('D MMM'),
                ])
                ->values();
        }

        // ── Estudiantes en riesgo ─────────────────────────────────────────────
        $estudiantesEnRiesgo = [];
        if ($user->can('ver usuarios') && $user->can('listar notas')) {
            $estudiantesEnRiesgo = User::role('estudiante')
                ->whereNull('deleted_at')
                ->withCount([
                    'notas as notas_reprobadas' => fn ($q) => $q
                        ->whereHas('unidad', fn ($u) => $u->where('ciclo_escolar', $cicloEscolar))
                        ->whereNotNull('nota')
                        ->where('nota', '<', 60),
                    'notas as total_notas' => fn ($q) => $q
                        ->whereHas('unidad', fn ($u) => $u->where('ciclo_escolar', $cicloEscolar))
                        ->whereNotNull('nota'),
                ])
                ->having('notas_reprobadas', '>', 0)
                ->orderByDesc('notas_reprobadas')
                ->take(8)
                ->get(['id', 'name'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'reprobadas' => (int) $u->notas_reprobadas,
                    'total' => (int) $u->total_notas,
                ])
                ->values();
        }

        // ── Rendimiento por sección ───────────────────────────────────────────
        $rendimientoSecciones = [];
        if ($user->can('listar secciones') && $user->can('listar notas')) {
            $rendimientoSecciones = Seccion::whereNull('deleted_at')
                ->where('ciclo_escolar', $cicloEscolar)
                ->withCount('estudiantes')
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar'])
                ->map(function (Seccion $sec) use ($cicloEscolar): array {
                    $notasData = Nota::where('seccion_id', $sec->id)
                        ->whereHas('unidad', fn ($q) => $q->where('ciclo_escolar', $cicloEscolar))
                        ->whereNotNull('nota')
                        ->pluck('nota')
                        ->map(fn ($n) => (float) $n);

                    $total = $notasData->count();
                    $promedio = $total > 0 ? round($notasData->avg(), 1) : null;
                    $aprobados = $notasData->filter(fn ($n) => $n >= 60)->count();

                    return [
                        'id' => $sec->id,
                        'nombre' => $sec->nombre,
                        'ciclo' => $sec->ciclo,
                        'ciclo_escolar' => $sec->ciclo_escolar,
                        'total_estudiantes' => $sec->estudiantes_count,
                        'notas_registradas' => $total,
                        'promedio' => $promedio,
                        'pct_aprobados' => $total > 0 ? (int) round($aprobados / $total * 100) : null,
                    ];
                })
                ->values();
        }

        // ── Secciones del catedrático ─────────────────────────────────────────
        $misSecciones = [];
        $notasTendenciaCatedratico = [];
        if ($user->hasRole('catedratico')) {
            $misSecciones = Seccion::query()
                ->whereHas('materias', fn ($q) => $q->where('materia_seccion.catedratico_id', $user->id))
                ->where('ciclo_escolar', $cicloEscolar)
                ->withCount('estudiantes')
                ->with(['materias' => fn ($q) => $q->where('materia_seccion.catedratico_id', $user->id)])
                ->get()
                ->map(fn (Seccion $s) => [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'ciclo' => $s->ciclo,
                    'ciclo_escolar' => $s->ciclo_escolar,
                    'total_estudiantes' => $s->estudiantes_count,
                    'materias' => $s->materias->map(fn ($m) => [
                        'id' => $m->id,
                        'nombre' => $m->nombre,
                        'codigo' => $m->codigo,
                    ]),
                ])
                ->values();

            // Tendencia de promedio por unidad para sus materias asignadas
            $seccionIds = \Illuminate\Support\Facades\DB::table('materia_seccion')
                ->where('catedratico_id', $user->id)
                ->pluck('seccion_id')
                ->unique();
            $materiaIds = \Illuminate\Support\Facades\DB::table('materia_seccion')
                ->where('catedratico_id', $user->id)
                ->pluck('materia_id')
                ->unique();

            $notasTendenciaCatedratico = Unidad::whereNull('deleted_at')
                ->where('ciclo_escolar', $cicloEscolar)
                ->orderBy('orden')
                ->get(['id', 'nombre', 'orden'])
                ->map(function (Unidad $u) use ($seccionIds, $materiaIds): array {
                    $avg = Nota::where('unidad_id', $u->id)
                        ->whereIn('seccion_id', $seccionIds)
                        ->whereIn('materia_id', $materiaIds)
                        ->whereNotNull('nota')
                        ->avg('nota');

                    return [
                        'nombre' => $u->nombre,
                        'promedio' => $avg !== null ? round((float) $avg, 1) : null,
                    ];
                })
                ->values();
        }

        // ── Notas del estudiante ──────────────────────────────────────────────
        $misNotas = [];
        if ($user->hasRole('estudiante')) {
            $misNotas = Nota::where('estudiante_id', $user->id)
                ->with(['materia', 'unidad', 'seccion'])
                ->latest()
                ->take(10)
                ->get();
        }

        // ── Actividad reciente ────────────────────────────────────────────────
        $actividadReciente = [];
        if ($user->hasAnyRole(['admin', 'super-admin', 'administrador'])) {
            $actividadReciente = Activity::with('causer:id,name')
                ->latest()
                ->take(15)
                ->get()
                ->map(fn (Activity $a) => [
                    'id' => $a->id,
                    'descripcion' => $a->description,
                    'evento' => $a->event,
                    'subject_type' => $a->subject_type,
                    'subject_id' => $a->subject_id,
                    'causer' => $a->causer ? ['id' => $a->causer->id, 'name' => $a->causer->name] : null,
                    'created_at' => $a->created_at,
                    'propiedades' => $a->properties->only(['attributes', 'old'])->toArray(),
                ]);
        }

        // ── Unidad actualmente activa ─────────────────────────────────────────
        $unidadActual = Unidad::actual();

        return Inertia::render('dashboard', [
            'cicloEscolar' => $cicloEscolar,
            'stats' => $stats,
            'distribucionNotas' => $distribucionNotas,
            'topMaterias' => $topMaterias,
            'notasUltimos14Dias' => $notasUltimos14Dias,
            'estudiantesEnRiesgo' => $estudiantesEnRiesgo,
            'rendimientoSecciones' => $rendimientoSecciones,
            'misSecciones' => $misSecciones,
            'notasTendenciaCatedratico' => $notasTendenciaCatedratico,
            'misNotas' => $misNotas,
            'actividadReciente' => $actividadReciente,
            'unidadActual' => $unidadActual ? [
                'id' => $unidadActual->id,
                'nombre' => $unidadActual->nombre,
                'orden' => $unidadActual->orden,
                'ciclo_escolar' => $unidadActual->ciclo_escolar,
                'fecha_inicio' => $unidadActual->fecha_inicio?->toDateString(),
                'fecha_fin' => $unidadActual->fecha_fin?->toDateString(),
            ] : null,
        ]);
    }
}
