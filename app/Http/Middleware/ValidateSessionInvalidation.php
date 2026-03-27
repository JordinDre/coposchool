<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ValidateSessionInvalidation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            // CRÍTICO: Recargar usuario desde la BD en cada request.
            // Auth::user() cachea el modelo en memoria y nunca ve cambios hechos
            // por otro proceso (como el admin cerrando la sesión remotamente).
            $user = User::withTrashed()->find(Auth::id());

            if (! $user) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login');
            }

            // 1. Si el usuario ha sido marcado como eliminado (soft delete)
            if ($user->deleted_at) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors(['session' => 'Tu cuenta ha sido desactivada o eliminada.']);
            }

            // 2. Si existe una orden de invalidación de sesiones (Cierre remoto)
            if ($user->sessions_invalidated_at) {
                $sessionCreatedAt = session('auth_session_created_at');
                $invalidatedAt = $user->sessions_invalidated_at->timestamp;

                // Si la sesión no tiene fecha de creación o si es anterior a la invalidación
                if (! $sessionCreatedAt || (int) $sessionCreatedAt < $invalidatedAt) {
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->withErrors(['session' => 'Tu sesión ha sido cerrada remotamente por seguridad.']);
                }
            }
        }

        return $next($request);
    }
}
