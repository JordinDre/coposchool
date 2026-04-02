<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DataEscuelaSeeder extends Seeder
{
    private const CICLO = 2026;

    public function run(): void
    {
        $faker = Faker::create('es_GT');
        $this->command?->info('Limpiando datos previos...');

        // ── Limpieza ──────────────────────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Nota::truncate();
        DB::table('materia_seccion')->truncate();
        DB::table('seccion_user')->truncate();
        Materia::truncate();
        Unidad::truncate();
        Seccion::truncate();

        // Delete users with role student or teacher
        User::role(['estudiante', 'catedratico'])->each(function ($user) {
            $user->delete();
        });
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command?->info('Sembrando nueva estructura escolar...');

        // ── Configuración inicial ─────────────────────────────────────
        Configuracion::firstOrCreate([], [
            'nombre_empresa' => 'CopoSchool',
            'nombre_completo' => 'Instituto Nacional de Educación Básica',
            'abreviatura' => 'INEB',
            'ciclo_actual' => self::CICLO,
            'descripcion_establecimiento' => 'Educación Básica Oficial',
            'descripcion_ciclo' => 'Ciclo Escolar '.self::CICLO,
            'nivel_educativo' => 'Básico',
            'director_nombre' => 'Director(a) General',
            'firma_cargo' => 'Director(a)',
        ]);
        $this->command?->line('  ✓ Configuración inicial creada');

        // ── Materias ──────────────────────────────────────────────────
        $materiasData = [
            ['nombre' => 'Matemática', 'codigo' => 'MAT'],
            ['nombre' => 'Cultura e Idioma Maya', 'codigo' => 'CIM'],
            ['nombre' => 'Comunicación y Lenguaje', 'codigo' => 'CL'],
            ['nombre' => 'Idioma Inglés', 'codigo' => 'ING'],
            ['nombre' => 'Ciencias Naturales', 'codigo' => 'CN'],
            ['nombre' => 'Ciencias Soc. y Form. Ciudadana', 'codigo' => 'CSFC'],
            ['nombre' => 'Educación Artística', 'codigo' => 'EA'],
            ['nombre' => 'Emprendimiento para la Productividad', 'codigo' => 'EPP'],
            ['nombre' => 'TAC (Computación)', 'codigo' => 'TAC'],
            ['nombre' => 'Educación Física', 'codigo' => 'EF'],
        ];

        foreach ($materiasData as $m) {
            Materia::create($m);
        }
        $materiaIds = Materia::pluck('id')->toArray();
        $this->command?->line('  ✓ 10 Materias creadas');

        // ── Unidades ──────────────────────────────────────────────────
        $unidadesData = [
            ['nombre' => 'I Bimestre',  'orden' => 1, 'descripcion' => 'Enero - Marzo',     'fecha_inicio' => '2026-01-12', 'fecha_fin' => '2026-03-27'],
            ['nombre' => 'II Bimestre', 'orden' => 2, 'descripcion' => 'Abril - Junio',     'fecha_inicio' => '2026-03-30', 'fecha_fin' => '2026-06-12'],
            ['nombre' => 'III Bimestre', 'orden' => 3, 'descripcion' => 'Julio - Septiembre', 'fecha_inicio' => '2026-07-06', 'fecha_fin' => '2026-09-11'],
            ['nombre' => 'IV Bimestre', 'orden' => 4, 'descripcion' => 'Octubre - Noviembre', 'fecha_inicio' => '2026-09-14', 'fecha_fin' => '2026-11-06'],
        ];

        foreach ($unidadesData as $u) {
            Unidad::create(array_merge($u, ['ciclo_escolar' => self::CICLO]));
        }
        $this->command?->line('  ✓ 4 Bimestres creados');

        // ── Secciones ─────────────────────────────────────────────────
        $grados = ['Primero Básico', 'Segundo Básico', 'Tercero Básico'];
        $letras = ['A', 'B', 'C', 'D', 'E', 'F'];
        $seccionIds = [];

        foreach ($grados as $grado) {
            foreach ($letras as $letra) {
                $seccion = Seccion::create([
                    'nombre' => "{$grado} {$letra}",
                    'ciclo' => 'basico',
                    'ciclo_escolar' => self::CICLO,
                ]);
                $seccionIds[] = $seccion->id;
            }
        }
        $this->command?->line('  ✓ 18 Secciones creadas (A-F por grado)');

        // ── Catedráticos ──────────────────────────────────────────────
        $adminId = User::where('email', 'admin@gmail.com')->value('id') ?? 1;
        $catedraticoIds = [];

        for ($i = 1; $i <= 20; $i++) {
            $user = User::create([
                'name' => 'Prof. '.$faker->name,
                'email' => "profe{$i}@escuela.edu.gt",
                'password' => Hash::make('Pass1234.'),
                'creado_por' => $adminId,
                'actualizado_por' => $adminId,
            ]);
            $user->assignRole('catedratico');
            $catedraticoIds[] = $user->id;
        }
        $this->command?->line('  ✓ 20 Catedráticos creados');

        // ── Estudiantes y Asignaciones ────────────────────────────────
        $this->command?->info('Inscribiendo estudiantes y asignando cursos (esto puede demorar)...');

        $teacherIndex = 0;
        foreach ($seccionIds as $seccionId) {
            // 20 Estudiantes por sección
            for ($j = 1; $j <= 20; $j++) {
                $student = User::create([
                    'name' => $faker->name,
                    'email' => 'estudiante_'.Str::random(8).'@escuela.edu.gt',
                    'password' => Hash::make('Pass1234.'),
                    'creado_por' => $adminId,
                    'actualizado_por' => $adminId,
                ]);
                $student->assignRole('estudiante');

                // Enrolment
                DB::table('seccion_user')->insert([
                    'seccion_id' => $seccionId,
                    'user_id' => $student->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Assign subjects to this section
            foreach ($materiaIds as $materiaId) {
                // Rotate teachers
                $teacherId = $catedraticoIds[$teacherIndex % 20];

                DB::table('materia_seccion')->insert([
                    'materia_id' => $materiaId,
                    'seccion_id' => $seccionId,
                    'catedratico_id' => $teacherId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $teacherIndex++;
            }
        }

        $this->command?->info('✓ Estudiantes (360) y asignaciones de cursos completadas.');
        $this->command?->info('¡Proceso de siembra finalizado para el ciclo '.self::CICLO.'!');
    }
}
