<?php

use Spatie\Permission\Models\Role;

$role = Role::where('name', 'catedratico')->first();
if ($role) {
    $permissions = ['ver tareas', 'crear tareas', 'editar tareas', 'eliminar tareas', 'calificar tareas'];
    $role->givePermissionTo($permissions);
    echo "Permisos asignados al rol catedratico exitosamente.\n";
} else {
    echo "Rol catedratico no encontrado.\n";
}
