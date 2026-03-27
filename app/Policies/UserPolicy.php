<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('ver usuarios');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->can('ver usuarios');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear usuarios');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->can('editar usuarios');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Refrescar el modelo desde la base de datos para obtener el estado actual
        $model->refresh();

        // Un usuario no puede eliminarse a sí mismo
        if ($user->id === $model->id) {
            return false;
        }

        return $user->can('desactivar usuarios');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->can('editar usuarios');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false; // No permitir eliminación permanente
    }

    /**
     * Determine whether the user can close sessions of another user.
     */
    public function logoutUser(User $user, User $model): bool
    {
        // Refrescar el modelo desde la base de datos para obtener el estado actual
        $model->refresh();

        // Un usuario no puede cerrar sus propias sesiones desde aquí
        if ($user->id === $model->id) {
            return false;
        }

        // No permitir cerrar sesiones de usuarios administradores
        if ($model->hasAnyRole(['administrador', 'super-admin'])) {
            return false;
        }

        return $user->can('cerrar sesiones');
    }
}
