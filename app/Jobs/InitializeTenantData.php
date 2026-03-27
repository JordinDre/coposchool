<?php

namespace App\Jobs;

use App\Models\Configuracion;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Contracts\TenantWithDatabase;

class InitializeTenantData implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public TenantWithDatabase $tenant) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (! tenancy()->initialized) {
            tenancy()->initialize($this->tenant);
        }

        config(['activitylog.enabled' => false]);

        try {
            // Crear usuario base si no existe
            $userBase = User::first();
            if (! $userBase) {
                $userBase = User::create([
                    'name'            => 'System',
                    'email'           => 'system@temp.com',
                    'password'        => Hash::make('temp'),
                    'telefono'        => null,
                    'creado_por'      => 1,
                    'actualizado_por' => 1,
                ]);
                $userBase->update([
                    'creado_por'      => $userBase->id,
                    'actualizado_por' => $userBase->id,
                ]);
            }

            // Crear usuario administrador del tenant
            $userAdmin = User::firstOrCreate(
                ['email' => 'admin@gmail.com'],
                [
                    'name'            => 'Administrador',
                    'password'        => Hash::make('Pass1234.'),
                    'telefono'        => null,
                    'creado_por'      => $userBase->id,
                    'actualizado_por' => $userBase->id,
                    'eliminado_por'   => null,
                ]
            );

            $adminRole = Role::firstOrCreate(['name' => 'administrador']);
            if (! $userAdmin->hasRole('administrador')) {
                $userAdmin->assignRole('administrador');
            }

            // Crear super-admin
            $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
            $userSuperAdmin = User::firstOrCreate(
                ['email' => 'jordindredev@gmail.com'],
                [
                    'name'            => 'Super Admin',
                    'password'        => Hash::make('Pass1234.'),
                    'telefono'        => null,
                    'creado_por'      => $userBase->id,
                    'actualizado_por' => $userBase->id,
                    'eliminado_por'   => null,
                ]
            );
            if (! $userSuperAdmin->hasRole('super-admin')) {
                $userSuperAdmin->assignRole('super-admin');
            }

            // Crear configuración inicial del tenant
            if (! Configuracion::exists()) {
                Configuracion::create([
                    'nombre_empresa' => 'COPOSCHOOL',
                ]);
            }

            // Limpiar activity_log
            DB::table('activity_log')->delete();
            if (DB::getDriverName() === 'mysql') {
                DB::statement('ALTER TABLE activity_log AUTO_INCREMENT = 1');
            } elseif (DB::getDriverName() === 'sqlite') {
                DB::statement("DELETE FROM sqlite_sequence WHERE name='activity_log'");
            }

            config(['activitylog.enabled' => true]);
        } catch (\Exception $e) {
            config(['activitylog.enabled' => true]);
            throw $e;
        }
    }
}
