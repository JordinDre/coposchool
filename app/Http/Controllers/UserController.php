<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use PersistsFilters;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $persisted = $this->applyPersistedFilters('usuarios', ['search', 'search_field', 'role', 'status'], 'usuarios.index');

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        $query = User::withTrashed()
            ->select(['id', 'name', 'email', 'telefono', 'creado_por', 'actualizado_por', 'eliminado_por', 'deleted_at', 'created_at', 'updated_at'])
            ->with('roles', 'creador:id,name', 'actualizador:id,name', 'eliminador:id,name');

        if (! Auth::user()->hasRole('super-admin')) {
            $query->whereDoesntHave('roles', fn ($r) => $r->where('name', 'super-admin'));
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $searchField = $filters['search_field'] ?? 'all';

            $query->where(function ($q) use ($search, $searchField) {
                if ($searchField === 'all' || empty($searchField)) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('telefono', 'like', "%{$search}%");
                } else {
                    match ($searchField) {
                        'id'    => $q->where('id', is_numeric($search) ? $search : '0'),
                        'name'  => $q->where('name', 'like', "%{$search}%"),
                        'email' => $q->where('email', 'like', "%{$search}%"),
                        default => $q->where('id', is_numeric($search) ? $search : '0'),
                    };
                }
            });
        }

        if (! empty($filters['role'])) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $filters['role']));
        }

        if (! empty($filters['status'])) {
            match ($filters['status']) {
                'active'   => $query->whereNull('deleted_at'),
                'inactive' => $query->whereNotNull('deleted_at'),
                default    => null,
            };
        }

        $sortableMap = ['id', 'name', 'email', 'telefono', 'deleted_at', 'created_at', 'updated_at'];
        $orderColumn = in_array($persisted['sortBy'], $sortableMap) ? $persisted['sortBy'] : 'created_at';
        $query->orderBy($orderColumn, $persisted['sortDir']);

        $users = $query->paginate($persisted['perPage'])->withQueryString();

        $roles = Role::select('id', 'name')
            ->whereNotIn('name', ['super-admin'])
            ->get();

        return Inertia::render('usuarios/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search'         => $filters['search'] ?? '',
                'role'           => $filters['role'] ?? '',
                'status'         => $filters['status'] ?? '',
                'sort_by'        => $persisted['sortBy'],
                'sort_direction' => $persisted['sortDir'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', User::class);

        $roles = Role::select('id', 'name')
            ->whereNotIn('name', ['super-admin'])
            ->get();

        return Inertia::render('usuarios/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name'            => $request->name,
                'email'           => $request->email,
                'password'        => Hash::make($request->password),
                'telefono'        => $request->telefono,
                'creado_por'      => Auth::id(),
                'actualizado_por' => Auth::id(),
            ]);

            $user->syncRoles($request->roles ?? []);

            DB::commit();

            return redirect()->route('usuarios.index')->with('success', 'Usuario creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Error al crear el usuario: '.$e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $usuario = User::withTrashed()->findOrFail($id);

        $this->authorize('view', $usuario);

        $usuario->load(['roles', 'creador', 'actualizador', 'eliminador']);

        return Inertia::render('usuarios/Show', [
            'user' => $usuario,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $usuario)
    {
        if ($usuario->trashed()) {
            abort(403, 'No se puede editar un usuario inactivo. Debe activarlo primero.');
        }

        $this->authorize('update', $usuario);

        $usuario->load('roles');

        $autenticado = Auth::user();
        $editandoPropioUsuario = $autenticado->id === $usuario->id;

        $rolesQuery = Role::select('id', 'name');

        if ($editandoPropioUsuario && $autenticado->hasRole('super-admin')) {
            $rolesQuery->whereNotIn('name', []);
        } else {
            $rolesQuery->whereNotIn('name', ['super-admin']);
        }

        return Inertia::render('usuarios/Edit', [
            'user'  => $usuario,
            'roles' => $rolesQuery->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $usuario)
    {
        $this->authorize('update', $usuario);

        DB::beginTransaction();

        try {
            $data = [
                'name'            => $request->name,
                'email'           => $request->email,
                'telefono'        => $request->telefono,
                'actualizado_por' => Auth::id(),
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            if ($usuario->trashed()) {
                $usuario->restore();
                $usuario->update(array_merge($data, ['eliminado_por' => null]));
            } else {
                $usuario->update($data);
            }

            $usuario->syncRoles($request->roles ?? []);

            if ($request->boolean('logout_sessions')) {
                $usuario->update(['sessions_invalidated_at' => now()]);
            }

            DB::commit();

            return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Error al actualizar el usuario: '.$e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(User $usuario)
    {
        if ($usuario->trashed()) {
            abort(403, 'El usuario ya está inactivo.');
        }

        $this->authorize('delete', $usuario);

        DB::beginTransaction();

        try {
            $usuario->update(['eliminado_por' => Auth::id()]);
            $usuario->delete();

            DB::commit();

            return redirect()->route('usuarios.index')->with('success', 'Usuario desactivado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Error al desactivar el usuario: '.$e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore($id)
    {
        $usuario = User::withTrashed()->findOrFail($id);

        if (! $usuario->trashed()) {
            abort(403, 'El usuario ya está activo.');
        }

        $this->authorize('update', $usuario);

        DB::beginTransaction();

        try {
            $usuario->restore();
            $usuario->update(['eliminado_por' => null, 'actualizado_por' => Auth::id()]);

            DB::commit();

            return redirect()->route('usuarios.index')->with('success', 'Usuario reactivado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Error al reactivar el usuario: '.$e->getMessage()]);
        }
    }

    /**
     * Buscar usuarios para selects/autocomplete.
     */
    public function search(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $searchTerm = $request->get('q', '');
        $roles = $request->get('roles', []);

        $query = User::query()
            ->with('roles:id,name')
            ->whereNull('deleted_at');

        if (! Auth::user()->hasRole('super-admin')) {
            $query->whereDoesntHave('roles', fn ($r) => $r->where('name', 'super-admin'));
        }

        if (! empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('telefono', 'like', "%{$searchTerm}%");
            });
        }

        if (! empty($roles) && is_array($roles)) {
            $query->whereHas('roles', fn ($q) => $q->whereIn('name', $roles));
        }

        return response()->json(
            $query->select('id', 'name', 'email', 'telefono')->orderBy('name')->limit(20)->get()
        );
    }

    /**
     * Cerrar todas las sesiones de un usuario específico.
     */
    public function logoutUser(User $usuario)
    {
        $this->authorize('logoutUser', $usuario);

        $usuario->update(['sessions_invalidated_at' => now()]);

        return back()->with('success', 'Sesiones del usuario cerradas exitosamente.');
    }
}
