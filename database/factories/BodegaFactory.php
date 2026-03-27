<?php

namespace Database\Factories;

use App\Models\Municipio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bodega>
 */
class BodegaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->company,
            'tipo' => $this->faker->randomElement(['bodega', 'sucursal']),
            'telefono' => $this->faker->phoneNumber,
            'nombre_comercial' => $this->faker->company,
            'direccion' => $this->faker->address,
            'codigo_postal' => $this->faker->postcode,
            'municipio_id' => $this->faker->randomElement(Municipio::pluck('id')),
            'creado_por' => 1,
            'actualizado_por' => 1,
            'eliminado_por' => 1,
            'created_at' => $this->faker->dateTime,
            'updated_at' => $this->faker->dateTime,
        ];
    }
}
