<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\Estudiante\StoreEstudianteRequest;
use App\Http\Requests\Estudiante\UpdateEstudianteRequest;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class EstudianteController extends Controller
{
    use PersistsFilters;

    /**
     * Simple student management list (assign sections, create, edit).
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $persisted = $this->applyPersistedFilters(
            'estudiantes',
            ['search', 'seccion_id', 'status'],
            'estudiantes.index'
        );

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = User::withTrashed()
            ->select(['id', 'name', 'email', 'telefono', 'deleted_at', 'created_at'])
            ->whereHas('roles', fn ($q) => $q->where('name', 'estudiante'))
            ->with(['secciones:id,nombre,ciclo,ciclo_escolar']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telefono', 'like', "%{$search}%")
            );
        }

        if (! empty($filters['seccion_id'])) {
            $query->whereHas('secciones', fn ($q) => $q->where('secciones.id', $filters['seccion_id']));
        }

        if (! empty($filters['status'])) {
            match ($filters['status']) {
                'active'   => $query->whereNull('deleted_at'),
                'inactive' => $query->whereNotNull('deleted_at'),
                default    => null,
            };
        }

        $sortableMap = ['id', 'name', 'email', 'deleted_at', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'name';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $estudiantes = $query->paginate($persisted['perPage'])->withQueryString();

        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);

        return Inertia::render('estudiantes/Index', [
            'estudiantes' => $estudiantes,
            'secciones'   => $secciones,
            'filters'     => [
                'search'         => $filters['search'] ?? '',
                'seccion_id'     => $filters['seccion_id'] ?? '',
                'status'         => $filters['status'] ?? '',
                'sort_by'        => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    /**
     * Grade grid — students with materia×unidad score matrix.
     * Accessible at /notas (Notas module in the sidebar).
     */
    public function calificaciones(Request $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', Nota::class);

        $user = Auth::user();

        $persisted = $this->applyPersistedFilters(
            'notas',
            ['search', 'seccion_id', 'status'],
            'notas.index'
        );

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = User::withTrashed()
            ->select(['id', 'name', 'email', 'telefono', 'deleted_at', 'created_at'])
            ->whereHas('roles', fn ($q) => $q->where('name', 'estudiante'))
            ->with(['secciones' => function ($q) {
                $q->select('secciones.id', 'secciones.nombre', 'secciones.ciclo', 'secciones.ciclo_escolar')
                  ->with(['materias' => function ($mq) {
                      $mq->whereNull('materias.deleted_at')
                         ->select('materias.id', 'materias.nombre', 'materias.codigo');
                  }]);
            }]);

        // Catedrático solo ve estudiantes de sus secciones
        if ($user->hasRole('catedratico')) {
            $query->whereHas('secciones', fn ($q) => $q->whereHas('materias', fn ($q2) =>
                $q2->where('materia_seccion.catedratico_id', $user->id)
            ));
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telefono', 'like', "%{$search}%")
            );
        }

        if (! empty($filters['seccion_id'])) {
            $query->whereHas('secciones', fn ($q) => $q->where('secciones.id', $filters['seccion_id']));
        }

        if (! empty($filters['status'])) {
            match ($filters['status']) {
                'active'   => $query->whereNull('deleted_at'),
                'inactive' => $query->whereNotNull('deleted_at'),
                default    => null,
            };
        }

        $sortableMap = ['id', 'name', 'email', 'deleted_at', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'name';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $estudiantes = $query->paginate($persisted['perPage'])->withQueryString();

        // Secciones para el filtro (filtradas por catedrático)
        if ($user->hasRole('catedratico')) {
            $secciones = Seccion::whereHas('materias', fn ($q) => $q->where('materia_seccion.catedratico_id', $user->id))
                ->whereNull('deleted_at')
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        } else {
            $secciones = Seccion::whereNull('deleted_at')
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        }

        // Catedrático's assignments (section+materia combos they teach)
        $misAsignaciones = [];
        if ($user->hasRole('catedratico')) {
            $misAsignaciones = DB::table('materia_seccion')
                ->join('materias', 'materia_seccion.materia_id', '=', 'materias.id')
                ->join('secciones', 'materia_seccion.seccion_id', '=', 'secciones.id')
                ->where('materia_seccion.catedratico_id', $user->id)
                ->whereNull('secciones.deleted_at')
                ->whereNull('materias.deleted_at')
                ->select(
                    'materia_seccion.seccion_id',
                    'materia_seccion.materia_id',
                    'materias.nombre as materia_nombre',
                    'materias.codigo as materia_codigo',
                    'secciones.nombre as seccion_nombre',
                )
                ->get();
        }

        // All units for the grid columns
        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get(['id', 'nombre', 'orden', 'ciclo_escolar', 'fecha_inicio', 'fecha_fin']);

        // All notes for current page students (all units)
        $estudianteIds = $estudiantes->pluck('id');
        $notasGrid = [];
        if ($estudianteIds->isNotEmpty()) {
            $notasGrid = Nota::whereIn('estudiante_id', $estudianteIds)
                ->get(['id', 'estudiante_id', 'materia_id', 'unidad_id', 'nota', 'observaciones'])
                ->groupBy('estudiante_id')
                ->map(fn ($notas) => $notas->map(fn ($n) => [
                    'id'            => $n->id,
                    'materia_id'    => $n->materia_id,
                    'unidad_id'     => $n->unidad_id,
                    'nota'          => $n->nota,
                    'observaciones' => $n->observaciones,
                ])->values())
                ->toArray();
        }

        return Inertia::render('notas/Index', [
            'estudiantes'     => $estudiantes,
            'secciones'       => $secciones,
            'misAsignaciones' => $misAsignaciones,
            'unidades'        => $unidades,
            'notasGrid'       => $notasGrid,
            'esCatedratico'   => $user->hasRole('catedratico'),
            'filters'         => [
                'search'         => $filters['search'] ?? '',
                'seccion_id'     => $filters['seccion_id'] ?? '',
                'status'         => $filters['status'] ?? '',
                'sort_by'        => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    public function notas(Request $request, int $estudianteId): Response
    {
        $estudiante = User::withTrashed()->findOrFail($estudianteId);
        $this->authorize('create', Nota::class);

        $user         = Auth::user();
        $esCatedratico = $user->hasRole('catedratico');
        $unidadActual  = Unidad::actual();

        if ($esCatedratico) {
            // All seccion+materia combinations where this catedrático teaches this student
            $asignaciones = DB::table('materia_seccion')
                ->join('secciones', 'materia_seccion.seccion_id', '=', 'secciones.id')
                ->join('materias', 'materia_seccion.materia_id', '=', 'materias.id')
                ->join('seccion_user', function ($join) use ($estudianteId) {
                    $join->on('seccion_user.seccion_id', '=', 'materia_seccion.seccion_id')
                         ->where('seccion_user.user_id', '=', $estudianteId);
                })
                ->where('materia_seccion.catedratico_id', $user->id)
                ->whereNull('secciones.deleted_at')
                ->whereNull('materias.deleted_at')
                ->select(
                    'materia_seccion.seccion_id',
                    'secciones.nombre as seccion_nombre',
                    'materia_seccion.materia_id',
                    'materias.nombre as materia_nombre',
                    'materias.codigo as materia_codigo',
                )
                ->get();

            // Auto-select when there is only one assignment
            $defaultSeccion = $asignaciones->count() === 1 ? (string) $asignaciones->first()->seccion_id : '';
            $defaultMateria = $asignaciones->count() === 1 ? (string) $asignaciones->first()->materia_id : '';

            $seccionId = $request->get('seccion_id', $defaultSeccion);
            $materiaId = $request->get('materia_id', $defaultMateria);
            $unidadId  = $unidadActual ? (string) $unidadActual->id : '';

            $notaActual = null;
            if ($seccionId && $materiaId && $unidadId) {
                $notaActual = Nota::where('estudiante_id', $estudianteId)
                    ->where('seccion_id', $seccionId)
                    ->where('materia_id', $materiaId)
                    ->where('unidad_id', $unidadId)
                    ->first();
            }

            $historial = Nota::where('estudiante_id', $estudianteId)
                ->with(['materia:id,nombre,codigo', 'unidad:id,nombre,orden', 'seccion:id,nombre'])
                ->orderByDesc('updated_at')
                ->get();

            return Inertia::render('estudiantes/Notas', [
                'estudiante'    => $estudiante->only(['id', 'name', 'email']),
                'asignaciones'  => $asignaciones,
                'secciones'     => [],
                'materias'      => [],
                'unidades'      => [],
                'unidadActual'  => $unidadActual ? $unidadActual->only(['id', 'nombre', 'orden', 'fecha_inicio', 'fecha_fin']) : null,
                'esCatedratico' => true,
                'notaActual'    => $notaActual,
                'historial'     => $historial,
                'filtros'       => [
                    'seccion_id' => $seccionId,
                    'materia_id' => $materiaId,
                    'unidad_id'  => $unidadId,
                ],
            ]);
        }

        // Admin / director: full selectors
        $seccionId = $request->get('seccion_id', '');
        $materiaId = $request->get('materia_id', '');
        $unidadId  = $request->get('unidad_id', $unidadActual ? (string) $unidadActual->id : '');

        $secciones = $estudiante->secciones()
            ->whereNull('secciones.deleted_at')
            ->get(['secciones.id', 'secciones.nombre', 'secciones.ciclo', 'secciones.ciclo_escolar']);

        $materias = [];
        if ($seccionId) {
            $seccionObj = Seccion::find($seccionId);
            $materias   = $seccionObj?->materias()
                ->whereNull('materias.deleted_at')
                ->get(['materias.id', 'materias.nombre', 'materias.codigo']) ?? collect();
        }

        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get(['id', 'nombre', 'orden', 'ciclo_escolar', 'fecha_inicio', 'fecha_fin']);

        $notaActual = null;
        if ($seccionId && $materiaId && $unidadId) {
            $notaActual = Nota::where('estudiante_id', $estudianteId)
                ->where('seccion_id', $seccionId)
                ->where('materia_id', $materiaId)
                ->where('unidad_id', $unidadId)
                ->first();
        }

        $historial = Nota::where('estudiante_id', $estudianteId)
            ->with(['materia:id,nombre,codigo', 'unidad:id,nombre,orden', 'seccion:id,nombre'])
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('estudiantes/Notas', [
            'estudiante'    => $estudiante->only(['id', 'name', 'email']),
            'asignaciones'  => null,
            'secciones'     => $secciones,
            'materias'      => $materias,
            'unidades'      => $unidades,
            'unidadActual'  => $unidadActual ? $unidadActual->only(['id', 'nombre', 'orden', 'fecha_inicio', 'fecha_fin']) : null,
            'esCatedratico' => false,
            'notaActual'    => $notaActual,
            'historial'     => $historial,
            'filtros'       => [
                'seccion_id' => $seccionId,
                'materia_id' => $materiaId,
                'unidad_id'  => $unidadId,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);

        return Inertia::render('estudiantes/Create', [
            'secciones' => $secciones,
        ]);
    }

    public function store(StoreEstudianteRequest $request): RedirectResponse
    {
        DB::beginTransaction();

        try {
            $estudiante = User::create([
                'name'            => $request->name,
                'telefono'        => $request->telefono,
                'creado_por'      => Auth::id(),
                'actualizado_por' => Auth::id(),
            ]);

            $estudiante->assignRole('estudiante');

            $estudiante->secciones()->sync([$request->seccion_id]);

            DB::commit();

            return redirect()->route('estudiantes.index')->with('success', 'Estudiante creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Error al crear el estudiante: '.$e->getMessage()]);
        }
    }

    public function edit(int $estudiante): Response
    {
        $user = User::withTrashed()->findOrFail($estudiante);

        if ($user->trashed()) {
            abort(403, 'No se puede editar un estudiante inactivo. Debe activarlo primero.');
        }

        $this->authorize('update', $user);

        $user->load('secciones:id,nombre,ciclo,ciclo_escolar');

        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);

        return Inertia::render('estudiantes/Edit', [
            'estudiante'        => $user,
            'secciones'         => $secciones,
            'seccionesInscritas' => $user->secciones->pluck('id')->toArray(),
        ]);
    }

    public function update(UpdateEstudianteRequest $request, int $estudiante): RedirectResponse
    {
        $user = User::findOrFail($estudiante);

        $this->authorize('update', $user);

        DB::beginTransaction();

        try {
            $user->fill([
                'name'            => $request->name,
                'telefono'        => $request->telefono,
                'actualizado_por' => Auth::id(),
            ]);

            $user->save();

            $user->secciones()->sync([$request->seccion_id]);

            DB::commit();

            return redirect()->route('estudiantes.index')->with('success', 'Estudiante actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Error al actualizar el estudiante: '.$e->getMessage()]);
        }
    }

    public function destroy(int $estudiante): RedirectResponse
    {
        $user = User::findOrFail($estudiante);

        $this->authorize('delete', $user);

        $user->update(['eliminado_por' => Auth::id()]);
        $user->delete();

        return redirect()->route('estudiantes.index')->with('success', 'Estudiante desactivado exitosamente.');
    }

    public function restore(int $estudiante): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($estudiante);

        $this->authorize('restore', $user);

        $user->restore();
        $user->update(['eliminado_por' => null]);

        return redirect()->route('estudiantes.index')->with('success', 'Estudiante reactivado exitosamente.');
    }
}
