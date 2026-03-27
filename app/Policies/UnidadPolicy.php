<?php

namespace App\Policies;

use App\Models\Unidad;
use App\Models\User;

class UnidadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('listar unidades');
    }

    public function view(User $user, Unidad $unidad): bool
    {
        return $user->can('ver unidad');
    }

    public function create(User $user): bool
    {
        return $user->can('crear unidad');
    }

    public function update(User $user, Unidad $unidad): bool
    {
        return $user->can('editar unidad');
    }

    public function delete(User $user, Unidad $unidad): bool
    {
        return $user->can('eliminar unidad');
    }

    public function restore(User $user, Unidad $unidad): bool
    {
        return $user->can('editar unidad');
    }

    public function forceDelete(User $user, Unidad $unidad): bool
    {
        return false;
    }
}
