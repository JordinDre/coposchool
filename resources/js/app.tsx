import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { setGlobalSimboloMoneda } from './lib/utils';

import { CartProvider } from './Contexts/CartContext';

const appName =
    (typeof document !== 'undefined' && document.querySelector('meta[name="application-name"]')?.getAttribute('content')) ||
    import.meta.env.VITE_APP_NAME ||
    'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Inicializar el símbolo de moneda con 'Q' como valor por defecto
        // El hook useCurrencySymbol se encargará de actualizarlo cuando se carguen las props
        setGlobalSimboloMoneda('Q');

        root.render(
            <CartProvider>
                <App {...props} />
            </CartProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register PWA service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed — silent fallback
        });
    });
}
