<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ========== USUARIOS ==========
        Permission::firstOrCreate(['name' => 'ver usuarios']);
        Permission::firstOrCreate(['name' => 'crear usuarios']);
        Permission::firstOrCreate(['name' => 'editar usuarios']);
        Permission::firstOrCreate(['name' => 'desactivar usuarios']);
        Permission::firstOrCreate(['name' => 'cerrar sesiones']);

        // ========== ROLES Y PERMISOS ==========
        Permission::firstOrCreate(['name' => 'gestionar roles']);

        // ========== SECCIONES ==========
        Permission::firstOrCreate(['name' => 'listar secciones']);
        Permission::firstOrCreate(['name' => 'ver seccion']);
        Permission::firstOrCreate(['name' => 'crear seccion']);
        Permission::firstOrCreate(['name' => 'editar seccion']);
        Permission::firstOrCreate(['name' => 'eliminar seccion']);

        // ========== MATERIAS ==========
        Permission::firstOrCreate(['name' => 'listar materias']);
        Permission::firstOrCreate(['name' => 'ver materia']);
        Permission::firstOrCreate(['name' => 'crear materia']);
        Permission::firstOrCreate(['name' => 'editar materia']);
        Permission::firstOrCreate(['name' => 'eliminar materia']);

        // ========== UNIDADES ==========
        Permission::firstOrCreate(['name' => 'listar unidades']);
        Permission::firstOrCreate(['name' => 'ver unidad']);
        Permission::firstOrCreate(['name' => 'crear unidad']);
        Permission::firstOrCreate(['name' => 'editar unidad']);
        Permission::firstOrCreate(['name' => 'eliminar unidad']);

        // ========== NOTAS ==========
        Permission::firstOrCreate(['name' => 'listar notas']);
        Permission::firstOrCreate(['name' => 'ver nota']);
        Permission::firstOrCreate(['name' => 'crear nota']);
        Permission::firstOrCreate(['name' => 'editar nota']);
        Permission::firstOrCreate(['name' => 'eliminar nota']);
        Permission::firstOrCreate(['name' => 'ver mis notas']);

        // ========== BOLETAS / REPORTES ==========
        Permission::firstOrCreate(['name' => 'generar boleta individual']);
        Permission::firstOrCreate(['name' => 'generar boleta seccion']);
        Permission::firstOrCreate(['name' => 'exportar notas']);

        // ========== ACTIVIDAD ==========
        Permission::firstOrCreate(['name' => 'listar actividad']);
        Permission::firstOrCreate(['name' => 'ver actividad']);

        // ===== ROLES =====
        $superAdmin   = Role::firstOrCreate(['name' => 'super-admin']);
        $administrador = Role::firstOrCreate(['name' => 'administrador']);
        $director     = Role::firstOrCreate(['name' => 'director']);
        $subdirector  = Role::firstOrCreate(['name' => 'subdirector']);
        $secretario   = Role::firstOrCreate(['name' => 'secretario']);
        $catedratico  = Role::firstOrCreate(['name' => 'catedratico']);
        $estudiante   = Role::firstOrCreate(['name' => 'estudiante']);

        // super-admin y administrador tienen todos los permisos
        $superAdmin->givePermissionTo(Permission::all());
        $administrador->givePermissionTo(Permission::all());

        // Director puede ver todo, crear/editar notas, pero no crear/editar usuarios
        $director->givePermissionTo([
            'listar secciones', 'ver seccion',
            'listar materias', 'ver materia',
            'listar unidades', 'ver unidad',
            'listar notas', 'ver nota', 'crear nota', 'editar nota',
            'generar boleta individual', 'generar boleta seccion', 'exportar notas',
            'listar actividad', 'ver actividad',
            'ver usuarios',
        ]);

        // Subdirector — igual que director más edición de secciones
        $subdirector->givePermissionTo([
            'listar secciones', 'ver seccion', 'crear seccion', 'editar seccion',
            'listar materias', 'ver materia',
            'listar unidades', 'ver unidad',
            'listar notas', 'ver nota',
            'generar boleta individual', 'generar boleta seccion', 'exportar notas',
            'ver usuarios',
        ]);

        // Secretario — gestión de secciones, estudiantes, y reportes
        $secretario->givePermissionTo([
            'listar secciones', 'ver seccion', 'crear seccion', 'editar seccion',
            'listar materias', 'ver materia', 'crear materia', 'editar materia',
            'listar unidades', 'ver unidad', 'crear unidad', 'editar unidad',
            'listar notas', 'ver nota',
            'generar boleta individual', 'generar boleta seccion', 'exportar notas',
            'ver usuarios', 'crear usuarios', 'editar usuarios',
        ]);

        // Catedrático — solo sus notas y ver secciones/materias asignadas
        $catedratico->givePermissionTo([
            'listar secciones', 'ver seccion',
            'listar materias', 'ver materia',
            'listar unidades', 'ver unidad',
            'listar notas', 'ver nota', 'crear nota', 'editar nota',
            'generar boleta individual', 'generar boleta seccion',
        ]);

        // Estudiante — solo ver sus propias notas
        $estudiante->givePermissionTo([
            'ver mis notas',
        ]);
    }
}
