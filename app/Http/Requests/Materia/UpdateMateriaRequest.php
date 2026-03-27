<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMateriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('editar materia');
    }

    public function rules(): array
    {
        $materia = $this->route('materia');

        return [
            'nombre'      => ['required', 'string', 'max:100'],
            'codigo'      => ['nullable', 'string', 'max:20', Rule::unique('materias', 'codigo')->ignore($materia)],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la materia es obligatorio.',
            'codigo.unique'   => 'Este código ya está en uso.',
        ];
    }
}
