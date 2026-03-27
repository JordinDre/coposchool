// resources/js/layouts/app-layout.tsx
import FlashToaster from '@/components/ui/flash-toaster';
import { Toaster } from '@/components/ui/sonner';
import { useCurrencySymbol } from '@/hooks/use-currency-symbol';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    // Actualizar el símbolo de moneda global basado en la configuración
    useCurrencySymbol();

    // Prevenir que las páginas se muestren desde el caché del navegador (bfcache)
    // al presionar el botón de "atrás" después de cerrar sesión.
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                window.location.reload();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    return (
        <>
            {/* Toaster global + listener de flashes */}
            <Toaster richColors closeButton position="bottom-right" theme="light" duration={5000} />
            <FlashToaster />

            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
