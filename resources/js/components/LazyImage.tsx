import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

export default function LazyImage({ src, alt, className = '', placeholder }: LazyImageProps) {
    const [isInView, setIsInView] = useState(false);
    const [hasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            },
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);
    // Si hay error, mostrar placeholder
    if (hasError) {
        return (
            <div ref={imgRef} className={className}>
                {placeholder || (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={imgRef} className={className}>
            {!isInView ? (
                // Placeholder mientras no está en viewport
                placeholder || (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )
            ) : (
                // Imagen real - sin estados de carga
                <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />
            )}
        </div>
    );
}
