<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Tarea;
use App\Models\TareaNota;
use App\Models\Unidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TareaController extends Controller
{
    use PersistsFilters;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('ver tareas');

        $user = Auth::user();

        $seccion_id = $request->get('seccion_id');
        $materia_id = $request->get('materia_id');
        $unidad_id  = $request->get('unidad_id');

        // Opciones de selección
        if ($user->hasRole('catedratico')) {
            $secciones = Seccion::whereHas('materias', function ($q) use ($user) {
                $q->where('materia_seccion.catedratico_id', $user->id);
            })->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        } else {
            $secciones = Seccion::whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        }

        $materias = [];
        $unidades = Unidad::whereNull('deleted_at')->orderBy('orden')->get(['id', 'nombre', 'orden', 'ciclo_escolar']);
        $tareas   = [];
        $contexto = null;
        $estudiantes = collect();
        $notasGrid = [];

        if ($seccion_id) {
            $seccionObj = Seccion::find($seccion_id);
            if ($seccionObj) {
                $materiasQuery = $seccionObj->materias();
                if ($user->hasRole('catedratico')) {
                    $materiasQuery->wherePivot('catedratico_id', $user->id);
                }
                $materias = $materiasQuery->get(['materias.id', 'materias.nombre', 'materias.codigo']);
            }
        }

        if ($seccion_id && $materia_id && $unidad_id) {
            $seccionObj = Seccion::find($seccion_id);
            $materiaObj = Materia::find($materia_id);
            $unidadObj  = Unidad::find($unidad_id);

            if ($seccionObj && $materiaObj && $unidadObj) {
                $contexto = [
                    'seccion' => $seccionObj->only(['id', 'nombre', 'ciclo', 'ciclo_escolar']),
                    'materia' => $materiaObj->only(['id', 'nombre', 'codigo']),
                    'unidad'  => $unidadObj->only(['id', 'nombre', 'orden']),
                ];

                $tareas = Tarea::where('seccion_id', $seccion_id)
                    ->where('materia_id', $materia_id)
                    ->where('unidad_id', $unidad_id)
                    ->get();
                    
                $estudiantes = $seccionObj->estudiantes()->select('users.id', 'users.name', 'users.email')->get();
                
                if ($tareas->isNotEmpty()) {
                    $tareaIds = $tareas->pluck('id');
                    $notas = TareaNota::whereIn('tarea_id', $tareaIds)->get();
                    foreach ($notas as $nota) {
                        $notasGrid[$nota->tarea_id][$nota->estudiante_id] = [
                            'nota' => $nota->nota,
                            'observaciones' => $nota->observaciones,
                        ];
                    }
                }
            }
        }

        return Inertia::render('tareas/Index', [
            'secciones'   => $secciones,
            'materias'    => $materias,
            'unidades'    => $unidades,
            'tareas'      => $tareas,
            'contexto'    => $contexto,
            'estudiantes' => $estudiantes,
            'notasGrid'   => $notasGrid,
            'filtros'     => [
                'seccion_id' => $seccion_id,
                'materia_id' => $materia_id,
                'unidad_id'  => $unidad_id,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('crear tareas');

        $data = $request->validate([
            'seccion_id'  => ['required', 'exists:secciones,id'],
            'materia_id'  => ['required', 'exists:materias,id'],
            'unidad_id'   => ['required', 'exists:unidades,id'],
            'nombre'      => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'valor'       => ['required', 'numeric', 'min:0.01', 'max:100'],
        ]);

        $this->validateCatedraticoPermissions($request);
        $this->validateSumaValores($data['seccion_id'], $data['materia_id'], $data['unidad_id'], $data['valor']);

        $data['catedratico_id'] = Auth::id();

        Tarea::create($data);

        return back()->with('success', 'Tarea creada exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tarea $tarea)
    {
        $this->authorize('editar tareas');

        $data = $request->validate([
            'nombre'      => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'valor'       => ['required', 'numeric', 'min:0.01', 'max:100'],
        ]);

        $this->validateSumaValores($tarea->seccion_id, $tarea->materia_id, $tarea->unidad_id, $data['valor'], $tarea->id);

        $tarea->update($data);
        
        // Recalcular notas finales si cambió el valor de la tarea
        // Opcional: Podríamos recalcular todo aquí si el valor baja y las notas exceden el nuevo valor,
        // pero por simplicidad solo se recalculan al guardar notas o destruir tareas.
        $this->recalcularNotasFinales($tarea->seccion_id, $tarea->materia_id, $tarea->unidad_id);

        return back()->with('success', 'Tarea actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tarea $tarea)
    {
        $this->authorize('eliminar tareas');
        
        $seccion_id = $tarea->seccion_id;
        $materia_id = $tarea->materia_id;
        $unidad_id = $tarea->unidad_id;

        $tarea->delete();
        
        $this->recalcularNotasFinales($seccion_id, $materia_id, $unidad_id);

        return back()->with('success', 'Tarea eliminada exitosamente.');
    }

    /**
     * Guarda o actualiza notas de estudiantes para una tarea específica.
     */
    public function bulkNotas(Request $request)
    {
        $this->authorize('calificar tareas');

        $request->validate([
            'tarea_id'           => ['required', 'exists:tareas,id'],
            'notas'              => ['required', 'array'],
            'notas.*.estudiante_id' => ['required', 'exists:users,id'],
            'notas.*.nota'       => ['nullable', 'numeric', 'min:0'],
            'notas.*.observaciones' => ['nullable', 'string', 'max:500'],
        ]);

        $tarea = Tarea::findOrFail($request->tarea_id);

        // Validar que la nota no exceda el valor de la tarea
        foreach ($request->notas as $item) {
            if (isset($item['nota']) && $item['nota'] > $tarea->valor) {
                return back()->withErrors(['notas' => "La nota del estudiante no puede exceder el valor de la tarea ({$tarea->valor} pts)."]);
            }
        }

        foreach ($request->notas as $item) {
            TareaNota::updateOrCreate(
                [
                    'tarea_id'      => $tarea->id,
                    'estudiante_id' => $item['estudiante_id'],
                ],
                [
                    'nota'          => $item['nota'] ?? null,
                    'observaciones' => $item['observaciones'] ?? null,
                ]
            );
        }

        $this->recalcularNotasFinales($tarea->seccion_id, $tarea->materia_id, $tarea->unidad_id);

        return back()->with('success', 'Notas de la tarea guardadas exitosamente.');
    }

    // ========== Métodos de Utilidad ==========

    private function validateSumaValores($seccion_id, $materia_id, $unidad_id, $nuevoValor, $tareaIgnoradaId = null)
    {
        $query = Tarea::where('seccion_id', $seccion_id)
            ->where('materia_id', $materia_id)
            ->where('unidad_id', $unidad_id);

        if ($tareaIgnoradaId) {
            $query->where('id', '!=', $tareaIgnoradaId);
        }

        $sumaActual = $query->sum('valor');
        $total = $sumaActual + $nuevoValor;

        if ($total > 100) {
            abort(422, "La suma de las tareas en esta unidad superaría el límite de 100 puntos. (Suma actual: {$sumaActual}, Nuevo intento: {$nuevoValor})");
        }
    }

    private function validateCatedraticoPermissions(Request $request)
    {
        $user = Auth::user();

        if ($user->hasRole('catedratico')) {
            $assigned = DB::table('materia_seccion')
                ->where('seccion_id', $request->seccion_id)
                ->where('materia_id', $request->materia_id)
                ->where('catedratico_id', $user->id)
                ->exists();

            if (! $assigned) {
                abort(403, 'No tienes permiso para gestionar tareas en esta sección y materia.');
            }

            $unidadActual = Unidad::actual();

            if (! $unidadActual || (int) $unidadActual->id !== (int) $request->unidad_id) {
                abort(403, 'Solo puedes gestionar tareas en la unidad activa actual.');
            }
        }
    }

    /**
     * Recalcula y sincroniza la nota final en la tabla `notas` basándose en las tareas.
     */
    private function recalcularNotasFinales($seccion_id, $materia_id, $unidad_id)
    {
        $tareas = Tarea::where('seccion_id', $seccion_id)
            ->where('materia_id', $materia_id)
            ->where('unidad_id', $unidad_id)
            ->get();

        if ($tareas->isEmpty()) {
            return;
        }

        $tareaIds = $tareas->pluck('id');
        
        $estudiantesSuma = TareaNota::whereIn('tarea_id', $tareaIds)
            ->select('estudiante_id', DB::raw('SUM(nota) as total_nota'))
            ->groupBy('estudiante_id')
            ->get();

        foreach ($estudiantesSuma as $row) {
            Nota::updateOrCreate(
                [
                    'estudiante_id' => $row->estudiante_id,
                    'materia_id'    => $materia_id,
                    'unidad_id'     => $unidad_id,
                    'seccion_id'    => $seccion_id,
                ],
                [
                    'catedratico_id' => Auth::id(), // O el catedrático que hizo la ultima accion
                    'nota'           => $row->total_nota,
                    // Si el profesor quiere poner observaciones en la nota final, no lo sobreescribimos aquí si no hay,
                    // pero está bien dejarlo así o null.
                ]
            );
        }
    }
}
