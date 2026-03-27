<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PreventBackHistory
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Si la respuesta es una instancia de Response y no es un archivo binario
        if ($response instanceof \Symfony\Component\HttpFoundation\Response) {
            // Protección agresiva contra historial y caché (Back button protection)
            $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');

            // Seguridad adicional (Blindaje)
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

            // Si el usuario NO está autenticado, forzar limpieza de caché en cada respuesta
            // para evitar que el navegador "recuerde" estados de sesión previos
            if (! Auth::check()) {
                $response->headers->set('Clear-Site-Data', '"cache"');
            }
        }

        return $response;
    }
}
