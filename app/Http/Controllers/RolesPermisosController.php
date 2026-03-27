<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesPermisosController extends Controller
{
    public function index(Request $request)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $query = Role::with('permissions')->withCount('users');

        // Aplicar filtros
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $searchField = $request->get('search_field', 'all');

            $query->where(function ($q) use ($search, $searchField) {
                if ($searchField === 'all' || empty($searchField)) {
                    // Búsqueda genérica: buscar en todos los campos
                    if (is_numeric($search)) {
                        $q->where('id', $search)
                            ->orWhere('name', 'like', '%'.$search.'%');
                    } else {
                        $q->where('name', 'like', '%'.$search.'%');
                    }
                } else {
                    // Búsqueda específica por campo
                    match ($searchField) {
                        'id' => $q->where('id', is_numeric($search) ? $search : '0'),
                        'name' => $q->where('name', 'like', '%'.$search.'%'),
                        default => $q->where('id', is_numeric($search) ? $search : '0'),
                    };
                }
            });
        }

        if ($request->has('role') && $request->role) {
            $query->where('name', $request->role);
        }

        $roles = $query->get();
        $permisos = Permission::orderBy('name')->get();

        return Inertia::render('roles-permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
            ],
        ]);
    }

    public function create()
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para crear roles.');
        }

        $permisos = Permission::orderBy('name')->get();

        return Inertia::render('roles-permisos/Create', [
            'permisos' => $permisos,
        ]);
    }

    public function show(Role $role)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para ver roles.');
        }

        $role->load('permissions')->loadCount('users');
        $permisos = Permission::orderBy('name')->get();

        return Inertia::render('roles-permisos/Show', [
            'role' => $role,
            'permisos' => $permisos,
        ]);
    }

    public function edit(Role $role)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para editar roles.');
        }

        $role->load('permissions')->loadCount('users');
        $permisos = Permission::orderBy('name')->get();

        return Inertia::render('roles-permisos/Edit', [
            'role' => $role,
            'permisos' => $permisos,
        ]);
    }

    public function store(Request $request)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para crear roles.');
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        // Limpiar cache de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('roles-permisos.index')
            ->with('success', 'Rol creado exitosamente.');
    }

    public function update(Request $request, Role $role)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para editar roles.');
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        // Limpiar cache de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('roles-permisos.index')
            ->with('success', 'Rol actualizado exitosamente.');
    }

    public function destroy(Role $role)
    {
        // Verificar que el usuario tenga rol de super-admin o admin
        if (! Auth::user()->hasRole(['super-admin', 'administrador'])) {
            abort(403, 'No tienes permisos para eliminar roles.');
        }

        // No permitir eliminar roles por seguridad
        return back()->withErrors(['error' => 'No se pueden eliminar roles por seguridad del sistema.']);
    }
}
