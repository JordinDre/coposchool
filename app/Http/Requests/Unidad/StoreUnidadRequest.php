<?php

namespace App\Http\Requests\Unidad;

use App\Models\Unidad;
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
            'ciclo_escolar' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'fecha_inicio'  => ['nullable', 'date'],
            'fecha_fin'     => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateDateOverlap($validator);
        });
    }

    private function validateDateOverlap($validator): void
    {
        $inicio = $this->fecha_inicio;
        $fin    = $this->fecha_fin;

        if (! $inicio || ! $fin) {
            return;
        }

        $overlaps = Unidad::whereNull('deleted_at')
            ->where('fecha_inicio', '<=', $fin)
            ->where('fecha_fin', '>=', $inicio)
            ->exists();

        if ($overlaps) {
            $validator->errors()->add(
                'fecha_inicio',
                'Las fechas se solapan con otra unidad ya registrada.'
            );
        }
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la unidad es obligatorio.',
            'orden.required'  => 'El orden es obligatorio.',
        ];
    }
}
