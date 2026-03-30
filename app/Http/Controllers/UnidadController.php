<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\Unidad\StoreUnidadRequest;
use App\Http\Requests\Unidad\UpdateUnidadRequest;
use App\Models\Unidad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnidadController extends Controller
{
    use PersistsFilters;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Unidad::class);

        $persisted = $this->applyPersistedFilters('unidades', ['search', 'ciclo_escolar'], 'unidades.index');

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = Unidad::withTrashed();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['ciclo_escolar'])) {
            $query->where('ciclo_escolar', $filters['ciclo_escolar']);
        }

        $sortableMap = ['id', 'nombre', 'orden', 'ciclo_escolar', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'orden';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $unidades = $query->paginate($persisted['perPage'])->withQueryString();

        return Inertia::render('unidades/Index', [
            'unidades' => $unidades,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'ciclo_escolar' => $filters['ciclo_escolar'] ?? '',
                'sort_by' => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Unidad::class);

        return Inertia::render('unidades/Create');
    }

    public function store(StoreUnidadRequest $request)
    {
        $this->authorize('create', Unidad::class);

        $data = $request->validated();
        if (empty($data['ciclo_escolar'])) {
            $data['ciclo_escolar'] = \App\Models\Configuracion::cached()->ciclo_actual ?? date('Y');
        }

        Unidad::create($data);

        return redirect()->route('unidades.index')->with('success', 'Unidad creada exitosamente.');
    }

    public function show(Unidad $unidad)
    {
        $this->authorize('view', $unidad);

        $unidad->loadCount('notas');

        return Inertia::render('unidades/Show', [
            'unidad' => $unidad,
        ]);
    }

    public function edit(Unidad $unidad)
    {
        if ($unidad->trashed()) {
            abort(403, 'No se puede editar una unidad inactiva.');
        }

        $this->authorize('update', $unidad);

        return Inertia::render('unidades/Edit', [
            'unidad' => [
                'id'           => $unidad->id,
                'nombre'       => $unidad->nombre,
                'descripcion'  => $unidad->descripcion,
                'fecha_inicio' => $unidad->fecha_inicio?->format('Y-m-d'),
                'fecha_fin'    => $unidad->fecha_fin?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(UpdateUnidadRequest $request, Unidad $unidad)
    {
        $this->authorize('update', $unidad);

        $data = $request->validated();
        if (empty($data['ciclo_escolar'])) {
            $data['ciclo_escolar'] = \App\Models\Configuracion::cached()->ciclo_actual ?? $unidad->ciclo_escolar;
        }

        $unidad->update($data);

        return redirect()->route('unidades.index')->with('success', 'Unidad actualizada exitosamente.');
    }

    public function destroy(Unidad $unidad)
    {
        if ($unidad->trashed()) {
            abort(403, 'La unidad ya está inactiva.');
        }

        $this->authorize('delete', $unidad);

        $unidad->delete();

        return redirect()->route('unidades.index')->with('success', 'Unidad desactivada exitosamente.');
    }

    public function restore($id)
    {
        $unidad = Unidad::withTrashed()->findOrFail($id);

        if (! $unidad->trashed()) {
            abort(403, 'La unidad ya está activa.');
        }

        $this->authorize('restore', $unidad);

        $unidad->restore();

        return redirect()->route('unidades.index')->with('success', 'Unidad reactivada exitosamente.');
    }
}
