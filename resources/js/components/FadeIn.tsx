import { useEffect, useState } from 'react';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export default function FadeIn({ children, delay = 0, duration = 600, className = '' }: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`transition-all ease-out ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: `${duration}ms`,
            }}
        >
            {children}
        </div>
    );
}
