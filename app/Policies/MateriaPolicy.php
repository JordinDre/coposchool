<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\User;

class MateriaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('listar materias');
    }

    public function view(User $user, Materia $materia): bool
    {
        return $user->can('ver materia');
    }

    public function create(User $user): bool
    {
        return $user->can('crear materia');
    }

    public function update(User $user, Materia $materia): bool
    {
        return $user->can('editar materia');
    }

    public function delete(User $user, Materia $materia): bool
    {
        return $user->can('eliminar materia');
    }

    public function restore(User $user, Materia $materia): bool
    {
        return $user->can('editar materia');
    }

    public function forceDelete(User $user, Materia $materia): bool
    {
        return false;
    }
}
