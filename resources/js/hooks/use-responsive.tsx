import { useEffect, useState } from 'react';

// Hook para detectar el tamaño de pantalla y orientación
export function useResponsive() {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenSize({ width, height });

            // Detectar orientación
            setIsLandscape(width > height);
            setIsPortrait(width <= height);

            // Detectar breakpoints
            if (width < 640) {
                setIsMobile(true);
                setIsTablet(false);
                setIsDesktop(false);
                setBreakpoint('sm');
            } else if (width < 768) {
                setIsMobile(false);
                setIsTablet(true);
                setIsDesktop(false);
                setBreakpoint('sm');
            } else if (width < 1024) {
                setIsMobile(false);
                setIsTablet(true);
                setIsDesktop(false);
                setBreakpoint('md');
            } else if (width < 1280) {
                setIsMobile(false);
                setIsTablet(false);
                setIsDesktop(true);
                setBreakpoint('lg');
            } else if (width < 1536) {
                setIsMobile(false);
                setIsTablet(false);
                setIsDesktop(true);
                setBreakpoint('xl');
            } else {
                setIsMobile(false);
                setIsTablet(false);
                setIsDesktop(true);
                setBreakpoint('2xl');
            }
        };

        // Ejecutar al montar
        handleResize();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        screenSize,
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        isPortrait,
        breakpoint,
    };
}

// Hook simplificado para detectar solo móvil
export function useIsMobile() {
    const { isMobile } = useResponsive();
    return isMobile;
}

// Hook para detectar si es tablet o móvil
export function useIsMobileOrTablet() {
    const { isMobile, isTablet } = useResponsive();
    return isMobile || isTablet;
}

// Hook para detectar si es desktop
export function useIsDesktop() {
    const { isDesktop } = useResponsive();
    return isDesktop;
}

// Hook para detectar orientación
export function useOrientation() {
    const { isLandscape, isPortrait } = useResponsive();
    return { isLandscape, isPortrait };
}

// Hook para obtener el breakpoint actual
export function useBreakpoint() {
    const { breakpoint } = useResponsive();
    return breakpoint;
}

// Hook para detectar si está en un rango específico de breakpoints
export function useBreakpointRange(min: string, max?: string) {
    const { breakpoint } = useResponsive();

    const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpoints.indexOf(breakpoint);
    const minIndex = breakpoints.indexOf(min);
    const maxIndex = max ? breakpoints.indexOf(max) : breakpoints.length - 1;

    return currentIndex >= minIndex && currentIndex <= maxIndex;
}
