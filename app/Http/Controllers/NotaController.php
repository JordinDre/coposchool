<?php

namespace App\Http\Controllers;

use App\Exports\NotasExport;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class NotaController extends Controller
{
    /**
     * Grilla de notas — selector de sección+materia, todas las unidades como columnas.
     * Solo la unidad activa es editable.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Nota::class);

        $user = Auth::user();
        $seccion_id = $request->get('seccion_id');
        $materia_id = $request->get('materia_id');

        // Secciones disponibles (catedrático: solo las suyas)
        if ($user->hasRole('catedratico')) {
            $secciones = Seccion::whereHas('materias', fn ($q) => $q->where('materia_seccion.catedratico_id', $user->id))
                ->whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        } else {
            $secciones = Seccion::whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        }

        $seccionObj = $seccion_id ? Seccion::find($seccion_id) : null;

        // Materias del selector (filtra por catedrático si aplica)
        $materias = [];
        if ($seccionObj) {
            $mq = $seccionObj->materias()->whereNull('materias.deleted_at');
            if ($user->hasRole('catedratico')) {
                $mq->wherePivot('catedratico_id', $user->id);
            }
            $materias = $mq->get(['materias.id', 'materias.nombre', 'materias.codigo']);
        }

        // Unidades del ciclo_escolar de la sección (columnas de la tabla)
        $unidades = $seccionObj
            ? Unidad::whereNull('deleted_at')
                ->where('ciclo_escolar', $seccionObj->ciclo_escolar)
                ->orderBy('orden')
                ->get(['id', 'nombre', 'orden', 'ciclo_escolar'])
            : collect();

        // Grilla completa cuando hay sección + materia
        $grilla = null;
        $contexto = null;

        if ($seccionObj && $materia_id) {
            $materiaObj = Materia::find($materia_id);

            if ($materiaObj) {
                $contexto = [
                    'seccion' => $seccionObj->only(['id', 'nombre', 'ciclo', 'ciclo_escolar']),
                    'materia' => $materiaObj->only(['id', 'nombre', 'codigo']),
                ];

                $estudiantes = $seccionObj->estudiantes()
                    ->select('users.id', 'users.name')
                    ->orderBy('users.name')
                    ->get();

                $estudianteIds = $estudiantes->pluck('id');

                // Todas las notas de estos estudiantes en esta materia+sección (todas las unidades)
                $notasMap = Nota::whereIn('estudiante_id', $estudianteIds)
                    ->where('seccion_id', $seccion_id)
                    ->where('materia_id', $materia_id)
                    ->get()
                    ->groupBy('estudiante_id')
                    ->map(fn ($notas) => $notas->keyBy('unidad_id')
                        ->map(fn ($n) => [
                            'nota_id' => $n->id,
                            'nota' => $n->nota,
                            'observaciones' => $n->observaciones,
                        ])
                    );

                $grilla = $estudiantes->map(fn ($est) => [
                    'estudiante_id' => $est->id,
                    'estudiante_name' => $est->name,
                    'notas' => $notasMap->get($est->id, collect())->toArray(),
                ])->values();
            }
        }

        return Inertia::render('notas/Index', [
            'secciones' => $secciones,
            'materias' => $materias,
            'unidades' => $unidades,
            'grilla' => $grilla,
            'contexto' => $contexto,
            'filtros' => compact('seccion_id', 'materia_id'),
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
     * Exportar notas de una sección+materia a Excel (todas las unidades).
     */
    public function exportar(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorize('viewAny', Nota::class);

        $request->validate([
            'seccion_id' => ['required', 'exists:secciones,id'],
            'materia_id' => ['required', 'exists:materias,id'],
        ]);

        $seccion = Seccion::findOrFail($request->seccion_id);
        $materia = Materia::findOrFail($request->materia_id);

        $unidades = Unidad::whereNull('deleted_at')
            ->where('ciclo_escolar', $seccion->ciclo_escolar)
            ->orderBy('orden')
            ->get();

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'deleted_at']);

        $notas = Nota::whereIn('estudiante_id', $estudiantes->pluck('id'))
            ->where('seccion_id', $seccion->id)
            ->where('materia_id', $materia->id)
            ->get()
            ->groupBy('estudiante_id');

        $filename = 'notas-'.str($seccion->nombre)->slug().'-'.str($materia->nombre)->slug().'.xlsx';

        return Excel::download(
            new NotasExport($seccion, $materia, $unidades, $estudiantes, $notas),
            $filename,
        );
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
