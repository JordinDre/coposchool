<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\Materia\StoreMateriaRequest;
use App\Http\Requests\Materia\UpdateMateriaRequest;
use App\Models\Materia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MateriaController extends Controller
{
    use PersistsFilters;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Materia::class);

        $persisted = $this->applyPersistedFilters('materias', ['search'], 'materias.index');

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = Materia::withTrashed()->withCount('secciones');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        $sortableMap = ['id', 'nombre', 'codigo', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'nombre';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $materias = $query->paginate($persisted['perPage'])->withQueryString();

        return Inertia::render('materias/Index', [
            'materias' => $materias,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sort_by' => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Materia::class);

        return Inertia::render('materias/Create');
    }

    public function store(StoreMateriaRequest $request)
    {
        $this->authorize('create', Materia::class);

        Materia::create($request->validated());

        return redirect()->route('materias.index')->with('success', 'Materia creada exitosamente.');
    }

    public function show(Materia $materia)
    {
        $this->authorize('view', $materia);

        $materia->load('secciones:id,nombre,ciclo,ciclo_escolar')->loadCount('secciones');

        return Inertia::render('materias/Show', [
            'materia' => $materia,
        ]);
    }

    public function edit(Materia $materia)
    {
        if ($materia->trashed()) {
            abort(403, 'No se puede editar una materia inactiva.');
        }

        $this->authorize('update', $materia);

        return Inertia::render('materias/Edit', [
            'materia' => $materia,
        ]);
    }

    public function update(UpdateMateriaRequest $request, Materia $materia)
    {
        $this->authorize('update', $materia);

        $materia->update($request->validated());

        return redirect()->route('materias.index')->with('success', 'Materia actualizada exitosamente.');
    }

    public function destroy(Materia $materia)
    {
        if ($materia->trashed()) {
            abort(403, 'La materia ya está inactiva.');
        }

        $this->authorize('delete', $materia);

        $materia->delete();

        return redirect()->route('materias.index')->with('success', 'Materia desactivada exitosamente.');
    }

    public function restore($id)
    {
        $materia = Materia::withTrashed()->findOrFail($id);

        if (! $materia->trashed()) {
            abort(403, 'La materia ya está activa.');
        }

        $this->authorize('restore', $materia);

        $materia->restore();

        return redirect()->route('materias.index')->with('success', 'Materia reactivada exitosamente.');
    }
}
