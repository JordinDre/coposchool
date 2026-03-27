<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\Catedratico\StoreCatedraticoRequest;
use App\Http\Requests\Catedratico\UpdateCatedraticoRequest;
use App\Models\Materia;
use App\Models\Seccion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CatedraticoController extends Controller
{
    use PersistsFilters;

    public function index(Request $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $persisted = $this->applyPersistedFilters(
            'catedraticos',
            ['search', 'seccion_id', 'materia_id', 'status'],
            'catedraticos.index'
        );

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = User::withTrashed()
            ->select(['id', 'name', 'email', 'telefono', 'deleted_at', 'created_at'])
            ->whereHas('roles', fn ($q) => $q->where('name', 'catedratico'))
            ->with(['materiasComoDocente:id,nombre,codigo']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telefono', 'like', "%{$search}%")
            );
        }

        if (! empty($filters['seccion_id'])) {
            $query->whereHas('materiasComoDocente', fn ($q) => $q->where('materia_seccion.seccion_id', $filters['seccion_id']));
        }

        if (! empty($filters['materia_id'])) {
            $query->whereHas('materiasComoDocente', fn ($q) => $q->where('materias.id', $filters['materia_id']));
        }

        if (! empty($filters['status'])) {
            match ($filters['status']) {
                'active' => $query->whereNull('deleted_at'),
                'inactive' => $query->whereNotNull('deleted_at'),
                default => null,
            };
        }

        $sortableMap = ['id', 'name', 'email', 'deleted_at', 'created_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'name';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $catedraticos = $query->paginate($persisted['perPage'])->withQueryString();

        $secciones = Seccion::whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);
        $materias = Materia::whereNull('deleted_at')->orderBy('nombre')->get(['id', 'nombre', 'codigo']);

        return Inertia::render('catedraticos/Index', [
            'catedraticos' => $catedraticos,
            'secciones' => $secciones,
            'materias' => $materias,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'seccion_id' => $filters['seccion_id'] ?? '',
                'materia_id' => $filters['materia_id'] ?? '',
                'status' => $filters['status'] ?? '',
                'sort_by' => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('catedraticos/Create');
    }

    public function store(StoreCatedraticoRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        DB::beginTransaction();

        try {
            $catedratico = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'telefono' => $request->telefono,
                'creado_por' => Auth::id(),
                'actualizado_por' => Auth::id(),
            ]);

            $catedratico->assignRole('catedratico');

            DB::commit();

            return redirect()->route('catedraticos.index')->with('success', 'Catedrático creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Error al crear el catedrático: '.$e->getMessage()]);
        }
    }

    public function edit(int $catedratico): Response
    {
        $user = User::withTrashed()->findOrFail($catedratico);

        if ($user->trashed()) {
            abort(403, 'No se puede editar un catedrático inactivo. Debe activarlo primero.');
        }

        $this->authorize('update', $user);

        return Inertia::render('catedraticos/Edit', [
            'catedratico' => $user,
        ]);
    }

    public function update(UpdateCatedraticoRequest $request, int $catedratico): RedirectResponse
    {
        $user = User::findOrFail($catedratico);

        $this->authorize('update', $user);

        $user->fill([
            'name' => $request->name,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'actualizado_por' => Auth::id(),
        ]);

        if (! empty($request->password)) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->route('catedraticos.index')->with('success', 'Catedrático actualizado exitosamente.');
    }

    public function asignaciones(Request $request, int $catedratico): Response
    {
        $user = User::withTrashed()->findOrFail($catedratico);
        $this->authorize('update', $user);

        $search = $request->get('search', '');

        $secciones = Seccion::whereNull('deleted_at')
            ->whereHas('materias')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar'])
            ->map(function (Seccion $seccion) use ($user, $search) {
                $materiasQuery = $seccion->materias()
                    ->select('materias.id', 'materias.nombre', 'materias.codigo')
                    ->whereNull('materias.deleted_at')
                    ->orderBy('materias.nombre');

                if ($search) {
                    $materiasQuery->where(fn ($q) => $q
                        ->where('materias.nombre', 'like', "%{$search}%")
                        ->orWhere('materias.codigo', 'like', "%{$search}%")
                    );
                }

                $materias = $materiasQuery->get()->map(fn ($m) => [
                    'id' => $m->id,
                    'nombre' => $m->nombre,
                    'codigo' => $m->codigo,
                    'asignada' => (int) $m->pivot->catedratico_id === $user->id,
                ]);

                return [
                    'id' => $seccion->id,
                    'nombre' => $seccion->nombre,
                    'ciclo' => $seccion->ciclo,
                    'ciclo_escolar' => $seccion->ciclo_escolar,
                    'materias' => $materias->values(),
                ];
            })
            ->filter(fn ($s) => count($s['materias']) > 0)
            ->values();

        return Inertia::render('catedraticos/Asignaciones', [
            'catedratico' => ['id' => $user->id, 'name' => $user->name],
            'secciones' => $secciones,
            'search' => $search,
        ]);
    }

    public function toggleAsignacion(Request $request, int $catedratico): RedirectResponse
    {
        $user = User::findOrFail($catedratico);
        $this->authorize('update', $user);

        $request->validate([
            'seccion_id' => ['required', 'integer', 'exists:secciones,id'],
            'materia_id' => ['required', 'integer', 'exists:materias,id'],
        ]);

        $row = DB::table('materia_seccion')
            ->where('seccion_id', $request->seccion_id)
            ->where('materia_id', $request->materia_id)
            ->first();

        if (! $row) {
            return back()->withErrors(['error' => 'La materia no está asignada a esta sección.']);
        }

        $newId = ((int) $row->catedratico_id === $user->id) ? null : $user->id;

        DB::table('materia_seccion')
            ->where('seccion_id', $request->seccion_id)
            ->where('materia_id', $request->materia_id)
            ->update(['catedratico_id' => $newId]);

        return back();
    }

    public function destroy(int $catedratico): RedirectResponse
    {
        $user = User::findOrFail($catedratico);

        $this->authorize('delete', $user);

        $user->update(['eliminado_por' => Auth::id()]);
        $user->delete();

        return redirect()->route('catedraticos.index')->with('success', 'Catedrático desactivado exitosamente.');
    }

    public function restore(int $catedratico): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($catedratico);

        $this->authorize('restore', $user);

        $user->restore();
        $user->update(['eliminado_por' => null]);

        return redirect()->route('catedraticos.index')->with('success', 'Catedrático reactivado exitosamente.');
    }
}
