<?php

namespace App\Policies;

use App\Models\Nota;
use App\Models\User;

class NotaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('listar notas') || $user->can('ver mis notas');
    }

    public function view(User $user, Nota $nota): bool
    {
        if ($user->can('ver nota')) {
            return true;
        }

        // Estudiante puede ver sus propias notas
        if ($user->can('ver mis notas') && $nota->estudiante_id === $user->id) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('crear nota');
    }

    public function update(User $user, Nota $nota): bool
    {
        if (! $user->can('editar nota')) {
            return false;
        }

        // Catedrático solo puede editar notas que él registró
        if ($user->hasRole('catedratico') && $nota->catedratico_id !== $user->id) {
            return false;
        }

        return true;
    }

    public function delete(User $user, Nota $nota): bool
    {
        return $user->can('eliminar nota');
    }

    public function forceDelete(User $user, Nota $nota): bool
    {
        return false;
    }
}
