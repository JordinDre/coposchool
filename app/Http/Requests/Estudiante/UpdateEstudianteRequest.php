<?php

namespace App\Http\Requests\Estudiante;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEstudianteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('editar usuarios');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = (int) $this->route('estudiante');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($userId): void {
                    $exists = User::whereHas('roles', fn ($q) => $q->where('name', 'estudiante'))
                        ->whereNull('deleted_at')
                        ->whereRaw('LOWER(name) = LOWER(?)', [$value])
                        ->where('id', '!=', $userId)
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
