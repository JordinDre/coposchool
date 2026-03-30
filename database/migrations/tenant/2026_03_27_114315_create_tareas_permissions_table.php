<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permissions = [
            'ver tareas',
            'crear tareas',
            'calificar tareas',
            'editar tareas',
            'eliminar tareas',
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $rolAdmin = Role::where('name', 'super-admin')->first();
        if ($rolAdmin) {
            $rolAdmin->givePermissionTo($permissions);
        }

        $rolCatedratico = Role::where('name', 'catedratico')->first();
        if ($rolCatedratico) {
            $rolCatedratico->givePermissionTo($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissions = [
            'ver tareas',
            'crear tareas',
            'calificar tareas',
            'editar tareas',
            'eliminar tareas',
        ];

        foreach ($permissions as $p) {
            Permission::where('name', $p)->where('guard_name', 'web')->delete();
        }
    }
};
