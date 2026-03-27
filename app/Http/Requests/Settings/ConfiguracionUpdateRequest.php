<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class ConfiguracionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'super-admin']);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre_empresa' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'favicon_url' => ['nullable', 'url', 'max:2048'],
            'codigo_establecimiento' => ['nullable', 'string', 'max:50'],
            'nivel_educativo' => ['nullable', 'string', 'in:primaria,basicos,diversificado,mixto'],
            'director_nombre' => ['nullable', 'string', 'max:255'],
            'firma_cargo' => ['nullable', 'string', 'max:100'],
            'encabezado_impresion' => ['nullable', 'string', 'max:1000'],
            'pie_impresion' => ['nullable', 'string', 'max:500'],
        ];
    }
}
