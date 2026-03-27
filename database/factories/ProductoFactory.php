<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Presentacion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Producto>
 */
class ProductoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = $this->faker->words(2, true);
        $codigo = strtoupper($this->faker->bothify('PROD-###-??'));

        return [
            'codigo' => $codigo,
            'nombre' => ucwords($nombre),
            'descripcion' => $this->faker->sentence(10),
            'marca_id' => Marca::factory(),
            'categoria_id' => Categoria::factory(),
            'presentacion_id' => Presentacion::factory(),
            'proveedor_id' => User::factory(),
            'precio_compra' => $this->faker->randomFloat(2, 10, 500),
            'precio_venta' => $this->faker->randomFloat(2, 20, 1000),
            'stock_minimo' => $this->faker->numberBetween(5, 20),
            'stock_maximo' => $this->faker->numberBetween(100, 500),
            'creado_por' => 1,
            'actualizado_por' => 1,
            'eliminado_por' => null,
        ];
    }

    /**
     * Estado para producto con stock bajo
     */
    public function stockBajo(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_minimo' => 10,
            'stock_maximo' => 50,
        ]);
    }

    /**
     * Estado para producto con precio alto
     */
    public function precioAlto(): static
    {
        return $this->state(fn (array $attributes) => [
            'precio_compra' => $this->faker->randomFloat(2, 500, 2000),
            'precio_venta' => $this->faker->randomFloat(2, 1000, 5000),
        ]);
    }

    /**
     * Estado para producto sin proveedor
     */
    public function sinProveedor(): static
    {
        return $this->state(fn (array $attributes) => [
            'proveedor_id' => null,
        ]);
    }
}
