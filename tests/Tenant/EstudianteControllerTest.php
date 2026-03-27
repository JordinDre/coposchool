<?php

use App\Http\Requests\Estudiante\StoreEstudianteRequest;
use App\Http\Requests\Estudiante\UpdateEstudianteRequest;
use App\Models\Seccion;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(Tests\TenantTestCase::class);

// ─── Helper ───────────────────────────────────────────────────────────────────

function estAdmin(array $permissions): User
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

function estudianteRole(): Role
{
    return Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);
}

// ─── Seccion sync — model-level ───────────────────────────────────────────────
// These tests verify the sync behaviour applied by the controller,
// operating directly on the model to avoid HTTP/middleware complexity.

test('syncing a single seccion_id enrolls the student in exactly that seccion', function () {
    estudianteRole();

    $seccionA = Seccion::create(['nombre' => 'A', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);
    $seccionB = Seccion::create(['nombre' => 'B', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);

    $admin = User::factory()->create();
    $admin->assignRole('administrador');

    $estudiante = User::factory()->create();
    $estudiante->assignRole('estudiante');

    // Enroll in A first
    $estudiante->secciones()->sync([$seccionA->id]);

    // Simulate the controller update: switch to B
    $estudiante->secciones()->sync([$seccionB->id]);

    $enrolled = $estudiante->secciones()->pluck('secciones.id')->toArray();
    expect($enrolled)->toBe([$seccionB->id]);
});

test('syncing an empty array removes all enrollments', function () {
    estudianteRole();

    $seccion = Seccion::create(['nombre' => 'A', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);

    $admin = User::factory()->create();
    $admin->assignRole('administrador');

    $estudiante = User::factory()->create();
    $estudiante->assignRole('estudiante');
    $estudiante->secciones()->sync([$seccion->id]);

    // Simulate null seccion_id in controller: sync([])
    $estudiante->secciones()->sync([]);

    expect($estudiante->secciones()->count())->toBe(0);
});

// ─── update via HTTP ──────────────────────────────────────────────────────────

test('update replaces the estudiante seccion via HTTP', function () {
    $admin = estAdmin(['editar usuarios', 'ver usuarios']);

    $seccionA = Seccion::create(['nombre' => 'A', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);
    $seccionB = Seccion::create(['nombre' => 'B', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);

    $role = estudianteRole();
    $estudiante = User::factory()->create();
    $estudiante->assignRole($role);
    $estudiante->secciones()->sync([$seccionA->id]);

    $this->actingAs($admin)
        ->tenantPut("/estudiantes/{$estudiante->id}", [
            'name' => $estudiante->name,
            'email' => $estudiante->email,
            'seccion_id' => $seccionB->id,
        ])
        ->assertRedirect(route('estudiantes.index'));

    $enrolled = $estudiante->fresh()->secciones()->pluck('secciones.id')->toArray();
    expect($enrolled)->toBe([$seccionB->id]);
});

test('update with null seccion_id removes all enrollments via HTTP', function () {
    $admin = estAdmin(['editar usuarios', 'ver usuarios']);

    $seccion = Seccion::create(['nombre' => 'A', 'ciclo' => 'basico', 'ciclo_escolar' => 2025]);

    $role = estudianteRole();
    $estudiante = User::factory()->create();
    $estudiante->assignRole($role);
    $estudiante->secciones()->sync([$seccion->id]);

    $this->actingAs($admin)
        ->tenantPut("/estudiantes/{$estudiante->id}", [
            'name' => $estudiante->name,
            'email' => $estudiante->email,
            'seccion_id' => null,
        ])
        ->assertRedirect(route('estudiantes.index'));

    expect($estudiante->fresh()->secciones()->count())->toBe(0);
});

// ─── Request validation rules ────────────────────────────────────────────────

test('StoreEstudianteRequest requires nullable integer seccion_id that exists in secciones', function () {
    $rules = (new StoreEstudianteRequest)->rules();
    $ruleStr = implode(',', $rules['seccion_id']);

    expect($ruleStr)
        ->toContain('nullable')
        ->toContain('integer')
        ->toContain('exists:secciones,id');
});

test('UpdateEstudianteRequest requires nullable integer seccion_id that exists in secciones', function () {
    $request = new UpdateEstudianteRequest;
    $request->merge(['seccion_id' => null]);

    $rules = $request->rules();
    $ruleStr = implode(',', $rules['seccion_id']);

    expect($ruleStr)
        ->toContain('nullable')
        ->toContain('integer')
        ->toContain('exists:secciones,id');
});
