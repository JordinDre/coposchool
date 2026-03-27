import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return;
        }

        // Si ya se intersectó y es triggerOnce, no crear observer
        if (hasIntersected && triggerOnce) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isElementIntersecting = entry.isIntersecting;
                setIsIntersecting(isElementIntersecting);

                if (isElementIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            {
                threshold,
                rootMargin,
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, hasIntersected, triggerOnce]);

    return { elementRef, isIntersecting, hasIntersected };
}
