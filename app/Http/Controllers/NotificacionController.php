<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    /**
     * Obtiene las notificaciones del usuario autenticado.
     */
    public function index()
    {
        $usuario = Auth::user();

        $notificaciones = $usuario->notifications()
            ->latest()
            ->paginate(15);

        return Inertia::render('notificaciones/Index', [
            'notificaciones' => $notificaciones->items(),
            'meta' => [
                'page' => $notificaciones->currentPage(),
                'perPage' => $notificaciones->perPage(),
                'total' => $notificaciones->total(),
                'lastPage' => $notificaciones->lastPage(),
            ],
        ]);
    }

    /**
     * Obtiene las notificaciones no leídas del usuario.
     */
    public function unread()
    {
        $usuario = Auth::user();

        $notificaciones = $usuario->unreadNotifications()
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'notificaciones' => $notificaciones,
            'count' => $usuario->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marca una notificación como leída.
     */
    public function markAsRead(string $id)
    {
        $usuario = Auth::user();
        $notificacion = $usuario->notifications()->findOrFail($id);
        $notificacion->markAsRead();

        return back()->with('success', 'Notificación marcada como leída');
    }

    /**
     * Marca todas las notificaciones como leídas.
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);

        return back()->with('success', 'Todas las notificaciones marcadas como leídas');
    }

    /**
     * Elimina una notificación.
     */
    public function destroy(string $id)
    {
        $usuario = Auth::user();
        $usuario->notifications()->findOrFail($id)->delete();

        return back()->with('success', 'Notificación eliminada');
    }

    /**
     * Elimina todas las notificaciones del usuario.
     */
    public function deleteAll()
    {
        Auth::user()->notifications()->delete();

        return back()->with('success', 'Todas las notificaciones eliminadas');
    }
}
