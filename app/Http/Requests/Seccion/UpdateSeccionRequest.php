<?php

namespace App\Http\Requests\Seccion;

use App\Models\Seccion;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSeccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('editar seccion');
    }

    public function rules(): array
    {
        return [
            'nombre'              => ['required', 'string', 'max:100'],
            'ciclo'               => ['required', 'string', 'in:pre-primaria,kinder,primaria,basico,diversificado'],
            'ciclo_escolar'       => ['required', 'integer', 'min:2000', 'max:2100'],
            'descripcion'         => ['nullable', 'string', 'max:500'],
            'materias'            => ['nullable', 'array'],
            'materias.*.materia_id'    => ['required', 'exists:materias,id'],
            'materias.*.catedratico_id' => ['nullable', 'exists:users,id'],
            'estudiantes'         => ['nullable', 'array'],
            'estudiantes.*'       => ['exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'        => 'El nombre de la sección es obligatorio.',
            'ciclo.required'         => 'El ciclo es obligatorio.',
            'ciclo.in'               => 'El ciclo seleccionado no es válido.',
            'ciclo_escolar.required' => 'El ciclo escolar es obligatorio.',
        ];
    }
}
