<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear el primer super-admin
        // Se deshabilitan FK temporalmente porque creado_por/actualizado_por se auto-referencian
        // y en una base de datos vacía (migrate:fresh) todavía no existe ningún usuario.
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $user = User::firstOrCreate(
            ['email' => 'jordindredev@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Pass1234.'),
                'email_verified_at' => now(),
                'creado_por' => 1,
                'actualizado_por' => 1,
                'eliminado_por' => null,
            ]
        );

        // Garantizar que se auto-referencia al propio ID
        $user->update(['creado_por' => $user->id, 'actualizado_por' => $user->id]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Asignar rol super-admin solo si no lo tiene
        if (! $user->hasRole('super-admin')) {
            $user->assignRole('super-admin');
        }
    }
}
