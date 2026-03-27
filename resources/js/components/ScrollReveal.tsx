import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    threshold?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export default function ScrollReveal({ children, delay = 0, duration = 400, className = '', direction = 'up', threshold = 0.01 }: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.IntersectionObserver) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // No desconectamos para que pueda re-activarse si el usuario vuelve a la sección
                } else {
                    // Opcional: resetear visibilidad cuando sale de vista para que re-anime al volver
                    // Pero para evitar saltos raros al navegar, solo reseteamos si está lo suficientemente lejos
                    if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
                        setIsVisible(false);
                    }
                }
            },
            {
                threshold,
                rootMargin: '0px', // Sin margen extra para que la animación ocurra justo al entrar
            },
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold]);

    const getTransform = () => {
        if (isVisible) return 'translate(0, 0)';

        switch (direction) {
            case 'up':
                return 'translate(0, 40px)';
            case 'down':
                return 'translate(0, -40px)';
            case 'left':
                return 'translate(40px, 0)';
            case 'right':
                return 'translate(-40px, 0)';
            case 'fade':
                return 'translate(0, 0)';
            default:
                return 'translate(0, 40px)';
        }
    };

    return (
        <div
            ref={elementRef}
            className={`cubic-bezier(0.16, 1, 0.3, 1) transition-all ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transitionDuration: `${duration}ms`,
                transitionDelay: isVisible ? `${delay}ms` : '0ms',
                willChange: 'transform, opacity',
            }}
        >
            {children}
        </div>
    );
}
