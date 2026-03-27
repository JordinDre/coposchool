<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ConfiguracionUpdateRequest;
use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    /**
     * Muestra el formulario de configuración de la empresa.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/company', [
            'configuracion' => Configuracion::first() ?? new Configuracion,
        ]);
    }

    /**
     * Actualiza la configuración de la empresa.
     */
    public function update(ConfiguracionUpdateRequest $request): RedirectResponse
    {
        $config = Configuracion::firstOrNew();
        $config->fill($request->validated());
        $config->save();

        return to_route('configuracion.edit')->with('success', 'Configuración actualizada.');
    }
}
