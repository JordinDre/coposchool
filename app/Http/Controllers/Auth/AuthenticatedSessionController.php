<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response|RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        $response = Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ])->toResponse($request);

        $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');

        return $response;
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Registrar el inicio de la sesión para validaciones de cierre remoto
        $request->session()->put('auth_session_created_at', now()->timestamp);

        return redirect()->intended(route('dashboard', absolute: false))
            ->withHeaders([
                'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => 'Fri, 01 Jan 1990 00:00:00 GMT',
                'Clear-Site-Data' => '"cache", "storage"',
            ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $redirectPath = '/login';
        if ($request->get('redirect_to') === 'ecommerce') {
            $redirectPath = '/';
        }

        // Forzar una recarga completa del navegador al cerrar sesión para limpiar el estado de Inertia
        // y asegurar que se borren todos los datos del sitio (caché, almacenamiento, etc.)
        $response = response('', 409)
            ->header('X-Inertia-Location', $redirectPath);

        $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
        $response->headers->set('Clear-Site-Data', '"cache", "storage", "executionContexts", "cookies"');

        return $response;
    }
}
