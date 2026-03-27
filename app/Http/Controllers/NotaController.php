<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotaController extends Controller
{
    use PersistsFilters;

    /**
     * Vista principal de notas.
     * Catedráticos ven un selector de sección/materia/unidad y luego la grilla.
     * Admins/directores pueden ver notas con filtros.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Nota::class);

        $user = Auth::user();

        // Selector de contexto (sección + materia + unidad)
        $seccion_id = $request->get('seccion_id');
        $materia_id = $request->get('materia_id');
        $unidad_id = $request->get('unidad_id');

        // Si el usuario es catedrático, limitar a sus secciones/materias
        if ($user->hasRole('catedratico')) {
            $secciones = Seccion::whereHas('materias', function ($q) use ($user) {
                $q->where('materia_seccion.catedratico_id', $user->id);
            })->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        } else {
            $secciones = Seccion::whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        }

        // Si el usuario es estudiante, mostrar solo sus notas
        if ($user->hasRole('estudiante')) {
            $misNotas = Nota::where('estudiante_id', $user->id)
                ->with(['materia:id,nombre,codigo', 'unidad:id,nombre,orden', 'seccion:id,nombre'])
                ->orderBy('created_at', 'desc')
                ->get();

            return Inertia::render('notas/Index', [
                'esEstudiante' => true,
                'misNotas' => $misNotas,
                'secciones' => [],
                'materias' => [],
                'unidades' => [],
                'grilla' => null,
                'contexto' => null,
            ]);
        }

        // Para catedrático/admin: construir grilla si hay contexto
        $materias = [];
        $unidades = [];
        $grilla = null;
        $contexto = null;
        $tiene_tareas = false;

        if ($seccion_id) {
            // Materias disponibles en esa sección (filtradas por catedrático si aplica)
            $seccionObj = Seccion::find($seccion_id);
            if ($seccionObj) {
                $materiasQuery = $seccionObj->materias();
                if ($user->hasRole('catedratico')) {
                    $materiasQuery->wherePivot('catedratico_id', $user->id);
                }
                $materias = $materiasQuery->get(['materias.id', 'materias.nombre', 'materias.codigo']);
            }
        }

        $unidades = Unidad::whereNull('deleted_at')->orderBy('orden')->get(['id', 'nombre', 'orden', 'ciclo_escolar']);

        if ($seccion_id && $materia_id && $unidad_id) {
            $seccionObj = Seccion::find($seccion_id);
            $materiaObj = Materia::find($materia_id);
            $unidadObj = Unidad::find($unidad_id);

            if ($seccionObj && $materiaObj && $unidadObj) {
                $contexto = [
                    'seccion' => $seccionObj->only(['id', 'nombre', 'ciclo', 'ciclo_escolar']),
                    'materia' => $materiaObj->only(['id', 'nombre', 'codigo']),
                    'unidad' => $unidadObj->only(['id', 'nombre', 'orden']),
                ];

                // Obtener todos los estudiantes de la sección
                $estudiantes = $seccionObj->estudiantes()->select('users.id', 'users.name', 'users.email')->get();

                // Obtener notas existentes
                $notasExistentes = Nota::where('seccion_id', $seccion_id)
                    ->where('materia_id', $materia_id)
                    ->where('unidad_id', $unidad_id)
                    ->get()
                    ->keyBy('estudiante_id');

                $grilla = $estudiantes->map(function ($estudiante) use ($notasExistentes) {
                    $nota = $notasExistentes->get($estudiante->id);

                    return [
                        'estudiante_id' => $estudiante->id,
                        'estudiante_name' => $estudiante->name,
                        'nota_id' => $nota?->id,
                        'nota' => $nota?->nota,
                        'observaciones' => $nota?->observaciones,
                    ];
                })->values();

                $tiene_tareas = \App\Models\Tarea::where('seccion_id', $seccion_id)
                    ->where('materia_id', $materia_id)
                    ->where('unidad_id', $unidad_id)
                    ->exists();
            }
        }

        return Inertia::render('notas/Index', [
            'esEstudiante' => false,
            'misNotas' => [],
            'secciones' => $secciones,
            'materias' => $materias,
            'unidades' => $unidades,
            'grilla' => $grilla,
            'contexto' => $contexto,
            'tiene_tareas' => $tiene_tareas,
            'filtros' => [
                'seccion_id' => $seccion_id,
                'materia_id' => $materia_id,
                'unidad_id' => $unidad_id,
            ],
        ]);
    }

    /**
     * Guardar o actualizar notas de la grilla (bulk upsert).
     */
    public function bulkStore(Request $request)
    {
        $this->authorize('create', Nota::class);

        $request->validate([
            'seccion_id' => ['required', 'exists:secciones,id'],
            'materia_id' => ['required', 'exists:materias,id'],
            'unidad_id' => ['required', 'exists:unidades,id'],
            'notas' => ['required', 'array'],
            'notas.*.estudiante_id' => ['required', 'exists:users,id'],
            'notas.*.nota' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notas.*.observaciones' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        // Catedrático: validate they are assigned to this seccion+materia and that the unit is active
        if ($user->hasRole('catedratico')) {
            $assigned = DB::table('materia_seccion')
                ->where('seccion_id', $request->seccion_id)
                ->where('materia_id', $request->materia_id)
                ->where('catedratico_id', $user->id)
                ->exists();

            if (! $assigned) {
                abort(403, 'No tienes permiso para calificar esta sección y materia.');
            }

            $unidadActual = Unidad::actual();

            if (! $unidadActual || (int) $unidadActual->id !== (int) $request->unidad_id) {
                abort(403, 'Solo puedes ingresar notas en la unidad activa actual.');
            }
        }

        foreach ($request->notas as $item) {
            Nota::updateOrCreate(
                [
                    'estudiante_id' => $item['estudiante_id'],
                    'materia_id' => $request->materia_id,
                    'unidad_id' => $request->unidad_id,
                    'seccion_id' => $request->seccion_id,
                ],
                [
                    'catedratico_id' => $user->id,
                    'nota' => $item['nota'] ?? null,
                    'observaciones' => $item['observaciones'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Notas guardadas exitosamente.');
    }

    /**
     * Obtener el historial de modificaciones de una nota específica.
     */
    public function historial(Nota $nota)
    {
        $this->authorize('create', Nota::class); // Reusing standard permission

        return response()->json(
            $nota->activities()->with('causer:id,name')->latest()->get()
        );
    }
}
