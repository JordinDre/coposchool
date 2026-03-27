<?php

namespace App\Http\Requests\Estudiante;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreEstudianteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('crear usuarios');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail): void {
                    $exists = User::whereHas('roles', fn ($q) => $q->where('name', 'estudiante'))
                        ->whereNull('deleted_at')
                        ->whereRaw('LOWER(name) = LOWER(?)', [$value])
                        ->exists();

                    if ($exists) {
                        $fail('Ya existe un estudiante con ese nombre.');
                    }
                },
            ],
            'telefono' => ['nullable', 'string', 'max:50'],
            'seccion_id' => ['required', 'integer', 'exists:secciones,id'],
        ];
    }
}
