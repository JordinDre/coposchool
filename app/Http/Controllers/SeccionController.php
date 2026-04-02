<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\Seccion\StoreSeccionRequest;
use App\Http\Requests\Seccion\UpdateSeccionRequest;
use App\Models\Seccion;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeccionController extends Controller
{
    use PersistsFilters;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Seccion::class);

        $persisted = $this->applyPersistedFilters('secciones', ['search', 'ciclo', 'ciclo_escolar'], 'secciones.index');

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = Seccion::withTrashed()
            ->withCount(['materias', 'estudiantes']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['ciclo'])) {
            $query->where('ciclo', $filters['ciclo']);
        }

        if (! empty($filters['ciclo_escolar'])) {
            $query->where('ciclo_escolar', $filters['ciclo_escolar']);
        }

        $sortableMap = ['id', 'nombre', 'ciclo', 'ciclo_escolar', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'nombre';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $secciones = $query->paginate($persisted['perPage'])->withQueryString();

        return Inertia::render('secciones/Index', [
            'secciones' => $secciones,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'ciclo' => $filters['ciclo'] ?? '',
                'ciclo_escolar' => $filters['ciclo_escolar'] ?? '',
                'sort_by' => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Seccion::class);

        return Inertia::render('secciones/Create');
    }

    public function store(StoreSeccionRequest $request)
    {
        $this->authorize('create', Seccion::class);

        $data = $request->validated();
        if (empty($data['ciclo_escolar'])) {
            $data['ciclo_escolar'] = \App\Models\Configuracion::cached()->ciclo_actual ?? date('Y');
        }

        Seccion::create($data);

        return redirect()->route('secciones.index')->with('success', 'Sección creada exitosamente.');
    }

    public function show(Seccion $seccion)
    {
        $this->authorize('view', $seccion);

        $seccion->load([
            'materias:id,nombre,codigo',
            'materias.pivot',
            'estudiantes:id,name,email',
        ]);

        $seccion->loadCount(['materias', 'estudiantes']);

        // Cargar catedrático de cada materia
        $materias = $seccion->materias->map(function ($materia) {
            $catedratico = $materia->pivot->catedratico_id
                ? User::select('id', 'name', 'email')->find($materia->pivot->catedratico_id)
                : null;

            return [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'codigo' => $materia->codigo,
                'catedratico' => $catedratico,
            ];
        });

        return Inertia::render('secciones/Show', [
            'seccion' => $seccion,
            'materias' => $materias,
            'estudiantes' => $seccion->estudiantes,
        ]);
    }

    public function edit(Seccion $seccion)
    {
        if ($seccion->trashed()) {
            abort(403, 'No se puede editar una sección inactiva.');
        }

        $this->authorize('update', $seccion);

        return Inertia::render('secciones/Edit', [
            'seccion' => [
                'id' => $seccion->id,
                'nombre' => $seccion->nombre,
                'ciclo' => $seccion->ciclo,
                'ciclo_escolar' => $seccion->ciclo_escolar,
                'descripcion' => $seccion->descripcion ?? '',
            ],
        ]);
    }

    public function update(UpdateSeccionRequest $request, Seccion $seccion)
    {
        $this->authorize('update', $seccion);

        $data = $request->validated();
        if (empty($data['ciclo_escolar'])) {
            $data['ciclo_escolar'] = \App\Models\Configuracion::cached()->ciclo_actual ?? $seccion->ciclo_escolar;
        }

        $seccion->update($data);

        return redirect()->route('secciones.index')->with('success', 'Sección actualizada exitosamente.');
    }

    public function destroy(Seccion $seccion)
    {
        if ($seccion->trashed()) {
            abort(403, 'La sección ya está inactiva.');
        }

        $this->authorize('delete', $seccion);

        $seccion->delete();

        return redirect()->route('secciones.index')->with('success', 'Sección desactivada exitosamente.');
    }

    public function inscribir(Request $request, Seccion $seccion)
    {
        abort_if($seccion->trashed(), 404);
        $this->authorize('update', $seccion);

        $search = $request->get('search', '');
        $inscritos = $seccion->estudiantes()->pluck('users.id')->toArray();

        $query = User::select('id', 'name', 'email')
            ->whereHas('roles', fn ($q) => $q->where('name', 'estudiante'))
            ->whereNull('deleted_at')
            ->with(['secciones' => fn ($q) => $q->select('secciones.id', 'secciones.nombre')->limit(1)])
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $estudiantes = $query->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'inscrito' => in_array($u->id, $inscritos),
            'seccion_actual' => $u->secciones->first()?->nombre,
        ]);

        return Inertia::render('secciones/Inscribir', [
            'seccion' => [
                'id' => $seccion->id,
                'nombre' => $seccion->nombre,
                'ciclo' => $seccion->ciclo,
                'ciclo_escolar' => $seccion->ciclo_escolar,
            ],
            'estudiantes' => $estudiantes,
            'totalInscritos' => count($inscritos),
            'search' => $search,
        ]);
    }

    public function toggleEstudiante(Request $request, Seccion $seccion)
    {
        $this->authorize('update', $seccion);

        $request->validate(['estudiante_id' => ['required', 'integer', 'exists:users,id']]);

        $estudianteId = $request->estudiante_id;
        $inscrito = $seccion->estudiantes()->where('users.id', $estudianteId)->exists();

        if ($inscrito) {
            $seccion->estudiantes()->detach($estudianteId);
        } else {
            // Remover de cualquier otra sección antes de inscribir
            $estudiante = \App\Models\User::findOrFail($estudianteId);
            $estudiante->secciones()->detach();
            $seccion->estudiantes()->attach($estudianteId);
        }

        return back();
    }

    public function asignarMaterias(Request $request, Seccion $seccion)
    {
        abort_if($seccion->trashed(), 404);
        $this->authorize('update', $seccion);

        $search = $request->get('search', '');

        $query = \App\Models\Materia::select('id', 'nombre', 'codigo')
            ->whereNull('deleted_at')
            ->orderBy('nombre');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%");
            });
        }

        $asignadasMap = $seccion->materias()
            ->get(['materias.id'])
            ->mapWithKeys(fn ($m) => [$m->id => $m->pivot->catedratico_id]);

        $materias = $query->get()->map(fn ($m) => [
            'id' => $m->id,
            'nombre' => $m->nombre,
            'codigo' => $m->codigo,
            'asignada' => $asignadasMap->has($m->id),
            'catedratico_id' => $asignadasMap->get($m->id),
        ]);

        return Inertia::render('secciones/AsignarMaterias', [
            'seccion' => [
                'id' => $seccion->id,
                'nombre' => $seccion->nombre,
                'ciclo' => $seccion->ciclo,
                'ciclo_escolar' => $seccion->ciclo_escolar,
            ],
            'materias' => $materias,
            'search' => $search,
        ]);
    }

    public function toggleMateria(Request $request, Seccion $seccion)
    {
        $this->authorize('update', $seccion);

        $request->validate([
            'materia_id' => ['required', 'integer', 'exists:materias,id'],
            'catedratico_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $asignada = $seccion->materias()->where('materias.id', $request->materia_id)->exists();

        if ($asignada) {
            $seccion->materias()->detach($request->materia_id);
        } else {
            $seccion->materias()->attach($request->materia_id, [
                'catedratico_id' => $request->catedratico_id,
            ]);
        }

        return back();
    }

    public function updateCatedratico(Request $request, Seccion $seccion)
    {
        $this->authorize('update', $seccion);

        $request->validate([
            'materia_id' => ['required', 'integer', 'exists:materias,id'],
            'catedratico_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // Verificar que el catedrático a asignar no esté ya asignado a esta misma
        // sección+materia por otro catedrático diferente
        if ($request->catedratico_id) {
            $existente = $seccion->materias()
                ->where('materias.id', $request->materia_id)
                ->first();

            if ($existente && $existente->pivot->catedratico_id &&
                $existente->pivot->catedratico_id !== (int) $request->catedratico_id) {
                return back()->withErrors(['catedratico_id' => 'Esta materia ya tiene un catedrático asignado en esta sección.']);
            }
        }

        $seccion->materias()->updateExistingPivot($request->materia_id, [
            'catedratico_id' => $request->catedratico_id,
        ]);

        return back();
    }

    public function syncEstudiantes(Request $request, Seccion $seccion)
    {
        $this->authorize('update', $seccion);

        $request->validate([
            'estudiantes' => ['present', 'array'],
            'estudiantes.*' => ['integer', 'exists:users,id'],
        ]);

        $seccion->estudiantes()->sync($request->estudiantes);

        return redirect()
            ->route('secciones.inscribir', $seccion->id)
            ->with('success', 'Estudiantes actualizados exitosamente.');
    }

    public function restore($id)
    {
        $seccion = Seccion::withTrashed()->findOrFail($id);

        if (! $seccion->trashed()) {
            abort(403, 'La sección ya está activa.');
        }

        $this->authorize('restore', $seccion);

        $seccion->restore();

        return redirect()->route('secciones.index')->with('success', 'Sección reactivada exitosamente.');
    }
}
