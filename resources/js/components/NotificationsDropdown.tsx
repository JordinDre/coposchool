import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { AlertTriangle, Bell, Check, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    data: {
        producto_nombre: string;
        producto_codigo: string;
        bodega_nombre: string;
        existencia: number;
        stock_minimo: number;
        mensaje: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsDropdownProps {
    initialCount?: number;
}

export default function NotificationsDropdown({ initialCount = 0 }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(initialCount);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Cargar notificaciones no leídas
    const loadUnreadNotifications = useCallback(async () => {
        try {
            const response = await fetch('/notificaciones/unread');
            const data = await response.json();
            setNotifications(data.notificaciones);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    // Marcar notificación como leída
    const markAsRead = async (notificationId: string) => {
        try {
            router.post(
                `/notificaciones/${notificationId}/mark-as-read`,
                {},
                {
                    onSuccess: () => {
                        setNotifications((prev) =>
                            prev.map((notif) => (notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif)),
                        );
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    },
                    onError: (errors) => {
                        console.error('Error marking notification as read:', errors);
                    },
                },
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        try {
            setLoading(true);
            const response = await fetch('/notificaciones/mark-all-as-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setNotifications((prev) => prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar notificación
    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/notificaciones/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        loadUnreadNotifications();
    }, [loadUnreadNotifications]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    // Memoizar el contador para evitar re-renders innecesarios
    const displayCount = useMemo(() => {
        return unreadCount > 99 ? '99+' : unreadCount;
    }, [unreadCount]);

    return (
        <div className="relative">
            <Button
                variant={isOpen ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative rounded-xl p-3 transition-all duration-200"
            >
                <Bell className={`h-5 w-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:bg-red-600">
                        {displayCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Notificaciones</h3>
                                    <p className="text-xs text-gray-600">{unreadCount > 0 ? `${unreadCount} no leídas` : 'Todas leídas'}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="rounded-full p-1">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Botones de acción debajo del título */}
                        <div className="mt-3 flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="rounded-full border-green-200 px-3 py-1 text-xs text-green-600 hover:border-green-300 hover:bg-green-50"
                                >
                                    <Check className="mr-1 h-3 w-3" />
                                    Marcar todas
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                    <Bell className="h-8 w-8 text-slate-300" />
                                </div>
                                <h4 className="mb-1 font-medium text-slate-900">No hay notificaciones</h4>
                                <p className="text-sm text-slate-600">Cuando tengas notificaciones, aparecerán aquí</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border-b border-gray-100 p-5 transition-all duration-200 hover:bg-slate-50 ${
                                        !notification.read_at
                                            ? 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                    !notification.read_at ? 'bg-amber-100' : 'bg-slate-100'
                                                }`}
                                            >
                                                <AlertTriangle className={`h-5 w-5 ${!notification.read_at ? 'text-amber-600' : 'text-slate-400'}`} />
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900">Stock Mínimo</h4>
                                                {!notification.read_at && <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>}
                                            </div>

                                            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-700">{notification.data.mensaje}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="max-w-32 truncate text-slate-600">{notification.data.producto_codigo}</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {!notification.read_at && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="h-8 w-8 rounded-full border-emerald-200 p-0 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="h-8 w-8 rounded-full border-rose-200 p-0 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/notificaciones')}
                            className="w-full rounded-lg border-slate-200 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            Ver todas las notificaciones
                        </Button>
                    </div>
                </div>
            )}

            {/* Overlay para cerrar el dropdown al hacer clic fuera */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
