<?php

namespace App\Http\Requests\Unidad;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('crear unidad');
    }

    public function rules(): array
    {
        return [
            'nombre'        => ['required', 'string', 'max:100'],
            'descripcion'   => ['nullable', 'string', 'max:500'],
            'orden'         => ['required', 'integer', 'min:1', 'max:20'],
            'ciclo_escolar' => ['required', 'integer', 'min:2000', 'max:2100'],
            'fecha_inicio'  => ['nullable', 'date'],
            'fecha_fin'     => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'        => 'El nombre de la unidad es obligatorio.',
            'orden.required'         => 'El orden es obligatorio.',
            'ciclo_escolar.required' => 'El ciclo escolar es obligatorio.',
        ];
    }
}
