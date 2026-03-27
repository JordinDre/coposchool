<?php

use App\Models\Seccion;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(Tests\TenantTestCase::class);

// ─── Helper ───────────────────────────────────────────────────────────────────

function seccionAdmin(array $permissions): User
{
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    $role = Role::firstOrCreate(['name' => 'administrador', 'guard_name' => 'web']);

    foreach ($permissions as $perm) {
        $permission = Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        $role->givePermissionTo($permission);
    }

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

// ─── resolveRouteBinding ──────────────────────────────────────────────────────

test('resolveRouteBinding finds active secciones', function () {
    $seccion = Seccion::create([
        'nombre'        => 'Sección A',
        'ciclo'         => 'basico',
        'ciclo_escolar' => 2025,
    ]);

    $found = (new Seccion)->resolveRouteBinding($seccion->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($seccion->id);
});

test('resolveRouteBinding finds soft-deleted secciones', function () {
    $seccion = Seccion::create([
        'nombre'        => 'Sección Eliminada',
        'ciclo'         => 'basico',
        'ciclo_escolar' => 2025,
    ]);
    $seccion->delete();

    $found = (new Seccion)->resolveRouteBinding($seccion->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($seccion->id)
        ->and($found->trashed())->toBeTrue();
});

// ─── inscribir — 404 for soft-deleted ────────────────────────────────────────

test('inscribir returns 404 for a soft-deleted seccion', function () {
    $user = seccionAdmin(['editar seccion', 'ver seccion']);

    $seccion = Seccion::create([
        'nombre'        => 'Sección Borrada',
        'ciclo'         => 'basico',
        'ciclo_escolar' => 2025,
    ]);
    $seccion->delete();

    $this->actingAs($user)
        ->tenantGet("/secciones/{$seccion->id}/inscribir")
        ->assertNotFound();
});

test('asignarMaterias returns 404 for a soft-deleted seccion', function () {
    $user = seccionAdmin(['editar seccion', 'ver seccion']);

    $seccion = Seccion::create([
        'nombre'        => 'Sección Borrada',
        'ciclo'         => 'basico',
        'ciclo_escolar' => 2025,
    ]);
    $seccion->delete();

    $this->actingAs($user)
        ->tenantGet("/secciones/{$seccion->id}/materias")
        ->assertNotFound();
});

test('inscribir is accessible for an active seccion', function () {
    $user = seccionAdmin(['editar seccion', 'ver seccion']);

    $seccion = Seccion::create([
        'nombre'        => 'Sección Activa',
        'ciclo'         => 'basico',
        'ciclo_escolar' => 2025,
    ]);

    $this->actingAs($user)
        ->tenantGet("/secciones/{$seccion->id}/inscribir")
        ->assertOk();
});
