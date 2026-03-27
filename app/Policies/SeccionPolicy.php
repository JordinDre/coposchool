<?php

namespace App\Policies;

use App\Models\Seccion;
use App\Models\User;

class SeccionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('listar secciones');
    }

    public function view(User $user, Seccion $seccion): bool
    {
        return $user->can('ver seccion');
    }

    public function create(User $user): bool
    {
        return $user->can('crear seccion');
    }

    public function update(User $user, Seccion $seccion): bool
    {
        return $user->can('editar seccion');
    }

    public function delete(User $user, Seccion $seccion): bool
    {
        return $user->can('eliminar seccion');
    }

    public function restore(User $user, Seccion $seccion): bool
    {
        return $user->can('editar seccion');
    }

    public function forceDelete(User $user, Seccion $seccion): bool
    {
        return false;
    }
}
