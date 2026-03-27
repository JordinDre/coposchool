import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const [isVisible, setIsVisible] = useState(true);
    const { url } = usePage();

    useEffect(() => {
        // Solo resetear visibilidad al cambiar de página, no en la carga inicial
        if (url !== window.location.pathname) {
            setIsVisible(false);

            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [url]);

    return (
        <div className={`transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {children}
        </div>
    );
}
