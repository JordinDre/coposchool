<?php

namespace App\Http\Requests\Catedratico;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreCatedraticoRequest extends FormRequest
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
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
