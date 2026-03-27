<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Spatie\Permission\Models\Role;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('crear usuarios');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'roles' => [
                'required',
                'array',
                'min:1',
                function ($attribute, $value, $fail) {
                    $roleNames = Role::whereIn('id', $value)->pluck('name')->toArray();
                    $restricted = array_intersect($roleNames, ['super-admin']);
                    if (! empty($restricted)) {
                        $fail('No está permitido asignar el rol super-admin desde esta interfaz.');
                    }
                },
            ],
            'roles.*' => ['exists:roles,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
            'roles.required' => 'Debe asignar al menos un rol al usuario.',
            'roles.min' => 'Debe asignar al menos un rol al usuario.',
            'roles.*.exists' => 'Uno o más roles seleccionados no son válidos.',
        ];
    }
}
