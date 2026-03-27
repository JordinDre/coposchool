<?php

namespace Database\Factories;

use App\Models\Departamento;
use App\Models\Pais;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Departamento>
 */
class DepartamentoFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Departamento::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->state(),
            'pais_id' => Pais::factory(),
            'creado_por' => 1,
            'actualizado_por' => 1,
            'eliminado_por' => null,
        ];
    }
}
