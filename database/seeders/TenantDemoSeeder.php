<?php

namespace Database\Seeders;

use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de demostración para el tenant.
 * Crea secciones, materias, unidades, catedráticos, estudiantes y notas de prueba.
 *
 * Ejecutar con:
 *   php artisan tenants:run "db:seed --class=TenantDemoSeeder"
 *
 * O en un tenant específico:
 *   php artisan tenants:run "db:seed --class=TenantDemoSeeder" --tenants=ineb
 */
class TenantDemoSeeder extends Seeder
{
    private const CICLO = 2026;

    public function run(): void
    {
        // Disable activity logging during seeding
        config(['activitylog.enabled' => false]);

        $this->command?->info('Sembrando datos de demostración...');

        $this->seedMaterias();
        $this->seedUnidades();
        $this->seedSecciones();
        $this->seedCatedraticos();
        $this->seedEstudiantes();
        $this->assignMateriasASecciones();
        $this->enrollEstudiantes();
        $this->seedNotas();

        config(['activitylog.enabled' => true]);

        $this->command?->info('¡Datos de demostración creados exitosamente!');
    }

    // ── Materias ──────────────────────────────────────────────────

    private function seedMaterias(): void
    {
        $materias = [
            ['nombre' => 'Matemática',                'codigo' => 'MAT'],
            ['nombre' => 'Comunicación y Lenguaje',   'codigo' => 'CL'],
            ['nombre' => 'Ciencias Naturales',        'codigo' => 'CN'],
            ['nombre' => 'Ciencias Sociales',         'codigo' => 'CS'],
            ['nombre' => 'Física',                    'codigo' => 'FIS'],
            ['nombre' => 'Química',                   'codigo' => 'QUI'],
            ['nombre' => 'Inglés',                    'codigo' => 'ING'],
            ['nombre' => 'Educación Física',          'codigo' => 'EF'],
        ];

        foreach ($materias as $materia) {
            Materia::firstOrCreate(['codigo' => $materia['codigo']], [
                'nombre' => $materia['nombre'],
            ]);
        }

        $this->command?->line('  ✓ Materias creadas');
    }

    // ── Unidades ──────────────────────────────────────────────────

    private function seedUnidades(): void
    {
        $unidades = [
            ['nombre' => 'Primera Unidad',  'orden' => 1, 'descripcion' => 'Enero – Marzo',        'fecha_inicio' => '2026-01-12', 'fecha_fin' => '2026-03-27'],
            ['nombre' => 'Segunda Unidad',  'orden' => 2, 'descripcion' => 'Abril – Junio',         'fecha_inicio' => '2026-03-30', 'fecha_fin' => '2026-06-12'],
            ['nombre' => 'Tercera Unidad',  'orden' => 3, 'descripcion' => 'Julio – Septiembre',    'fecha_inicio' => '2026-07-06', 'fecha_fin' => '2026-09-11'],
            ['nombre' => 'Cuarta Unidad',   'orden' => 4, 'descripcion' => 'Octubre – Noviembre',   'fecha_inicio' => '2026-09-14', 'fecha_fin' => '2026-11-06'],
        ];

        foreach ($unidades as $unidad) {
            Unidad::withoutTrashed()->updateOrCreate(
                ['nombre' => $unidad['nombre'], 'ciclo_escolar' => self::CICLO],
                [
                    'orden' => $unidad['orden'],
                    'descripcion' => $unidad['descripcion'],
                    'ciclo_escolar' => self::CICLO,
                    'fecha_inicio' => $unidad['fecha_inicio'],
                    'fecha_fin' => $unidad['fecha_fin'],
                ]
            );
        }

        $this->command?->line('  ✓ Unidades creadas');
    }

    // ── Secciones ─────────────────────────────────────────────────

    private function seedSecciones(): void
    {
        $secciones = [
            ['nombre' => 'Primero Básico A',   'ciclo' => 'basico',       'ciclo_escolar' => self::CICLO],
            ['nombre' => 'Primero Básico B',   'ciclo' => 'basico',       'ciclo_escolar' => self::CICLO],
            ['nombre' => 'Segundo Básico A',   'ciclo' => 'basico',       'ciclo_escolar' => self::CICLO],
            ['nombre' => 'Tercero Básico A',   'ciclo' => 'basico',       'ciclo_escolar' => self::CICLO],
            ['nombre' => 'Cuarto Bachillerato', 'ciclo' => 'diversificado', 'ciclo_escolar' => self::CICLO],
        ];

        foreach ($secciones as $seccion) {
            Seccion::firstOrCreate(
                ['nombre' => $seccion['nombre'], 'ciclo_escolar' => self::CICLO],
                $seccion
            );
        }

        $this->command?->line('  ✓ Secciones creadas');
    }

    // ── Catedráticos ──────────────────────────────────────────────

    private function seedCatedraticos(): void
    {
        $catedraticos = [
            ['name' => 'Prof. Carlos Méndez',   'email' => 'carlos.mendez@demo.edu.gt'],
            ['name' => 'Profa. Ana López',       'email' => 'ana.lopez@demo.edu.gt'],
            ['name' => 'Prof. José Ramírez',     'email' => 'jose.ramirez@demo.edu.gt'],
            ['name' => 'Profa. María García',    'email' => 'maria.garcia@demo.edu.gt'],
        ];

        $adminId = User::where('email', 'admin@gmail.com')->value('id') ?? 1;

        foreach ($catedraticos as $data) {
            $user = User::firstOrCreate(['email' => $data['email']], [
                'name' => $data['name'],
                'password' => Hash::make('Pass1234.'),
                'creado_por' => $adminId,
                'actualizado_por' => $adminId,
            ]);

            if (! $user->hasRole('catedratico')) {
                $user->assignRole('catedratico');
            }
        }

        $this->command?->line('  ✓ Catedráticos creados');
    }

    // ── Estudiantes ───────────────────────────────────────────────

    private function seedEstudiantes(): void
    {
        $estudiantes = [
            // Sección A - Primero Básico (10 estudiantes)
            ['name' => 'Alejandro García Pérez',     'email' => 'alejandro.garcia@demo.edu.gt'],
            ['name' => 'Brenda López Morales',        'email' => 'brenda.lopez@demo.edu.gt'],
            ['name' => 'Carlos Herrera Soto',         'email' => 'carlos.herrera@demo.edu.gt'],
            ['name' => 'Diana Ramírez Cruz',          'email' => 'diana.ramirez@demo.edu.gt'],
            ['name' => 'Eduardo Fuentes Lima',        'email' => 'eduardo.fuentes@demo.edu.gt'],
            ['name' => 'Fabiola Castillo Ramos',      'email' => 'fabiola.castillo@demo.edu.gt'],
            ['name' => 'Gabriela Moreno Díaz',        'email' => 'gabriela.moreno@demo.edu.gt'],
            ['name' => 'Héctor Velásquez Torres',     'email' => 'hector.velasquez@demo.edu.gt'],
            ['name' => 'Iris Sandoval Juárez',        'email' => 'iris.sandoval@demo.edu.gt'],
            ['name' => 'Jorge Monzón Aguilar',        'email' => 'jorge.monzon@demo.edu.gt'],

            // Sección B - Primero Básico (8 estudiantes)
            ['name' => 'Karla Orellana Pac',          'email' => 'karla.orellana@demo.edu.gt'],
            ['name' => 'Luis Ajpop Coy',              'email' => 'luis.ajpop@demo.edu.gt'],
            ['name' => 'Mónica Barrios Pop',          'email' => 'monica.barrios@demo.edu.gt'],
            ['name' => 'Nelson Tubac Tzul',           'email' => 'nelson.tubac@demo.edu.gt'],
            ['name' => 'Olga Cux Xoquic',             'email' => 'olga.cux@demo.edu.gt'],
            ['name' => 'Pedro Guarchaj Ixcoy',        'email' => 'pedro.guarchaj@demo.edu.gt'],
            ['name' => 'Rebeca Ixcoy Tzep',           'email' => 'rebeca.ixcoy@demo.edu.gt'],
            ['name' => 'Samuel Quixpez Batz',         'email' => 'samuel.quixpez@demo.edu.gt'],

            // Segundo Básico (7 estudiantes)
            ['name' => 'Tania Ajú Canil',             'email' => 'tania.aju@demo.edu.gt'],
            ['name' => 'Ulises Chitay Puac',          'email' => 'ulises.chitay@demo.edu.gt'],
            ['name' => 'Verónica Acabal Batz',        'email' => 'veronica.acabal@demo.edu.gt'],
            ['name' => 'Walter Toj Xuc',              'email' => 'walter.toj@demo.edu.gt'],
            ['name' => 'Xiomara Tzul Sajbín',         'email' => 'xiomara.tzul@demo.edu.gt'],
            ['name' => 'Yolanda Menchú Tum',          'email' => 'yolanda.menchu@demo.edu.gt'],
            ['name' => 'Zulma Cojtí Cumatz',          'email' => 'zulma.cojti@demo.edu.gt'],

            // Tercero Básico (6 estudiantes)
            ['name' => 'Abel Aj Xol',                 'email' => 'abel.aj@demo.edu.gt'],
            ['name' => 'Blanca Cucul Choc',           'email' => 'blanca.cucul@demo.edu.gt'],
            ['name' => 'César Caal Juc',              'email' => 'cesar.caal@demo.edu.gt'],
            ['name' => 'Dora Maas Chub',              'email' => 'dora.maas@demo.edu.gt'],
            ['name' => 'Edgar Coc Chub',              'email' => 'edgar.coc@demo.edu.gt'],
            ['name' => 'Flor Ical Beb',               'email' => 'flor.ical@demo.edu.gt'],

            // Cuarto Bachillerato (5 estudiantes)
            ['name' => 'Gonzalo Choc Beb',            'email' => 'gonzalo.choc@demo.edu.gt'],
            ['name' => 'Hilda Tec Rax',               'email' => 'hilda.tec@demo.edu.gt'],
            ['name' => 'Iván Caal Tuc',               'email' => 'ivan.caal@demo.edu.gt'],
            ['name' => 'Julia Pop Coc',               'email' => 'julia.pop@demo.edu.gt'],
            ['name' => 'Kevin Chub Xol',              'email' => 'kevin.chub@demo.edu.gt'],
        ];

        $adminId = User::where('email', 'admin@gmail.com')->value('id') ?? 1;

        foreach ($estudiantes as $data) {
            $user = User::firstOrCreate(['email' => $data['email']], [
                'name' => $data['name'],
                'password' => Hash::make('Pass1234.'),
                'creado_por' => $adminId,
                'actualizado_por' => $adminId,
            ]);

            if (! $user->hasRole('estudiante')) {
                $user->assignRole('estudiante');
            }
        }

        $this->command?->line('  ✓ Estudiantes creados');
    }

    // ── Asignar materias a secciones con catedráticos ─────────────

    private function assignMateriasASecciones(): void
    {
        $catedraticos = User::role('catedratico')->pluck('id')->toArray();
        [$cat1, $cat2, $cat3, $cat4] = array_pad($catedraticos, 4, $catedraticos[0]);

        $materiaIds = Materia::pluck('id', 'codigo');
        $seccionIds = Seccion::where('ciclo_escolar', self::CICLO)->pluck('id', 'nombre');

        // Materias comunes para básicos
        $materiasBasico = ['MAT', 'CL', 'CN', 'CS', 'ING', 'EF'];

        // Materias para diversificado
        $materiasDiversificado = ['MAT', 'FIS', 'QUI', 'CL', 'ING', 'EF'];

        $assignments = [
            // Primero Básico A
            'Primero Básico A' => [
                'MAT' => $cat1, 'CL' => $cat2, 'CN' => $cat3,
                'CS' => $cat4, 'ING' => $cat2, 'EF' => $cat3,
            ],
            // Primero Básico B
            'Primero Básico B' => [
                'MAT' => $cat1, 'CL' => $cat2, 'CN' => $cat3,
                'CS' => $cat4, 'ING' => $cat2, 'EF' => $cat3,
            ],
            // Segundo Básico A
            'Segundo Básico A' => [
                'MAT' => $cat1, 'CL' => $cat2, 'CN' => $cat3,
                'CS' => $cat4, 'ING' => $cat2, 'EF' => $cat3,
            ],
            // Tercero Básico A
            'Tercero Básico A' => [
                'MAT' => $cat1, 'CL' => $cat2, 'CN' => $cat3,
                'CS' => $cat4, 'ING' => $cat2, 'EF' => $cat3,
            ],
            // Cuarto Bachillerato
            'Cuarto Bachillerato' => [
                'MAT' => $cat1, 'FIS' => $cat3, 'QUI' => $cat4,
                'CL' => $cat2, 'ING' => $cat2, 'EF' => $cat3,
            ],
        ];

        foreach ($assignments as $seccionNombre => $materiasCatedraticos) {
            $seccionId = $seccionIds[$seccionNombre] ?? null;
            if (! $seccionId) {
                continue;
            }

            foreach ($materiasCatedraticos as $codigo => $catedraticoId) {
                $materiaId = $materiaIds[$codigo] ?? null;
                if (! $materiaId) {
                    continue;
                }

                DB::table('materia_seccion')->insertOrIgnore([
                    'materia_id' => $materiaId,
                    'seccion_id' => $seccionId,
                    'catedratico_id' => $catedraticoId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command?->line('  ✓ Materias asignadas a secciones');
    }

    // ── Inscribir estudiantes en secciones ────────────────────────

    private function enrollEstudiantes(): void
    {
        $seccionIds = Seccion::where('ciclo_escolar', self::CICLO)->pluck('id', 'nombre');

        // Map email → seccion
        $enrollment = [
            'Primero Básico A' => [
                'alejandro.garcia@demo.edu.gt', 'brenda.lopez@demo.edu.gt',
                'carlos.herrera@demo.edu.gt',   'diana.ramirez@demo.edu.gt',
                'eduardo.fuentes@demo.edu.gt',  'fabiola.castillo@demo.edu.gt',
                'gabriela.moreno@demo.edu.gt',  'hector.velasquez@demo.edu.gt',
                'iris.sandoval@demo.edu.gt',    'jorge.monzon@demo.edu.gt',
            ],
            'Primero Básico B' => [
                'karla.orellana@demo.edu.gt', 'luis.ajpop@demo.edu.gt',
                'monica.barrios@demo.edu.gt', 'nelson.tubac@demo.edu.gt',
                'olga.cux@demo.edu.gt',       'pedro.guarchaj@demo.edu.gt',
                'rebeca.ixcoy@demo.edu.gt',   'samuel.quixpez@demo.edu.gt',
            ],
            'Segundo Básico A' => [
                'tania.aju@demo.edu.gt',     'ulises.chitay@demo.edu.gt',
                'veronica.acabal@demo.edu.gt', 'walter.toj@demo.edu.gt',
                'xiomara.tzul@demo.edu.gt',  'yolanda.menchu@demo.edu.gt',
                'zulma.cojti@demo.edu.gt',
            ],
            'Tercero Básico A' => [
                'abel.aj@demo.edu.gt',   'blanca.cucul@demo.edu.gt',
                'cesar.caal@demo.edu.gt', 'dora.maas@demo.edu.gt',
                'edgar.coc@demo.edu.gt', 'flor.ical@demo.edu.gt',
            ],
            'Cuarto Bachillerato' => [
                'gonzalo.choc@demo.edu.gt', 'hilda.tec@demo.edu.gt',
                'ivan.caal@demo.edu.gt',    'julia.pop@demo.edu.gt',
                'kevin.chub@demo.edu.gt',
            ],
        ];

        foreach ($enrollment as $seccionNombre => $emails) {
            $seccionId = $seccionIds[$seccionNombre] ?? null;
            if (! $seccionId) {
                continue;
            }

            $userIds = User::whereIn('email', $emails)->pluck('id');

            foreach ($userIds as $userId) {
                DB::table('seccion_user')->insertOrIgnore([
                    'seccion_id' => $seccionId,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command?->line('  ✓ Estudiantes inscritos en secciones');
    }

    // ── Notas ─────────────────────────────────────────────────────

    private function seedNotas(): void
    {
        $unidades = Unidad::where('ciclo_escolar', self::CICLO)->orderBy('orden')->get();
        $secciones = Seccion::where('ciclo_escolar', self::CICLO)->with('materias', 'estudiantes')->get();

        foreach ($secciones as $seccion) {
            foreach ($seccion->materias as $materia) {
                $catedraticoId = $materia->pivot->catedratico_id;

                foreach ($seccion->estudiantes as $estudiante) {
                    foreach ($unidades as $unidad) {
                        // Skip ~10% of grades to simulate some missing grades
                        if (random_int(1, 10) === 1) {
                            continue;
                        }

                        $nota = $this->generateNota($estudiante->id);

                        Nota::firstOrCreate(
                            [
                                'estudiante_id' => $estudiante->id,
                                'materia_id' => $materia->id,
                                'unidad_id' => $unidad->id,
                                'seccion_id' => $seccion->id,
                            ],
                            [
                                'catedratico_id' => $catedraticoId,
                                'nota' => $nota,
                                'observaciones' => $nota < 60 ? 'Requiere refuerzo académico.' : null,
                            ]
                        );
                    }
                }
            }
        }

        $total = Nota::count();
        $this->command?->line("  ✓ {$total} notas creadas");
    }

    /**
     * Genera una nota con distribución realista:
     * ~10% reprobados (<60), ~20% zona baja (60-69), ~40% zona media (70-84), ~30% zona alta (85-100).
     */
    private function generateNota(int $studentId): float
    {
        // Use student ID as seed for consistent but varied grades per student
        $seed = ($studentId * 7 + random_int(0, 20)) % 100;

        return match (true) {
            $seed < 10 => round(random_int(40, 59) + (random_int(0, 99) / 100), 2),
            $seed < 30 => round(random_int(60, 69) + (random_int(0, 99) / 100), 2),
            $seed < 70 => round(random_int(70, 84) + (random_int(0, 99) / 100), 2),
            default => round(random_int(85, 100) + (random_int(0, 99) / 100), 2),
        };
    }
}
