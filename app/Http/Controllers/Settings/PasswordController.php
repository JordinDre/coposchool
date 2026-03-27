<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
            'logout_sessions' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Si se marcó la opción de cerrar sesiones, eliminar todas las sesiones excepto la actual
        if ($request->boolean('logout_sessions')) {
            $currentSessionId = $request->session()->getId();

            // Eliminar sesiones con user_id establecido
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();

            // También eliminar sesiones con user_id NULL que puedan pertenecer al usuario
            // Esto se hace deserializando el payload para buscar el ID del usuario
            $sessions = DB::table('sessions')
                ->whereNull('user_id')
                ->where('id', '!=', $currentSessionId)
                ->get();

            foreach ($sessions as $session) {
                try {
                    $payload = unserialize(base64_decode($session->payload));
                    // El ID del usuario autenticado está en login_web_* donde * es el ID del usuario
                    if (isset($payload['login_web_'.$user->id])) {
                        DB::table('sessions')->where('id', $session->id)->delete();
                    }
                } catch (\Exception $e) {
                    // Si hay error al deserializar, ignorar esta sesión
                    continue;
                }
            }
        }

        return back();
    }
}
