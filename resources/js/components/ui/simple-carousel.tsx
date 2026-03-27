
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming cn utility is available, otherwise define it or skip

interface SimpleCarouselProps {
    images?: string[];
    items?: React.ReactNode[];
    className?: string;
    autoplayInterval?: number;
}

export function SimpleCarousel({ images = [], items, className, autoplayInterval = 5000 }: SimpleCarouselProps) {
    const count = items ? items.length : images.length;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const scrollTo = useCallback((index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const width = container.clientWidth;
        container.scrollTo({
            left: width * index,
            behavior: 'smooth',
        });
        setCurrentIndex(index);
    }, []);

    const handlePrev = useCallback(() => {
        const newIndex = currentIndex === 0 ? count - 1 : currentIndex - 1;
        scrollTo(newIndex);
    }, [currentIndex, count, scrollTo]);

    const handleNext = useCallback(() => {
        const newIndex = currentIndex === count - 1 ? 0 : currentIndex + 1;
        scrollTo(newIndex);
    }, [currentIndex, count, scrollTo]);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const width = container.clientWidth;
        // Basic detection
        const newIndex = Math.round(container.scrollLeft / width);
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex]);

    // Autoplay
    useEffect(() => {
        if (isHovered || count <= 1) return;
        const interval = setInterval(handleNext, autoplayInterval);
        return () => clearInterval(interval);
    }, [handleNext, isHovered, count, autoplayInterval]);

    if (count === 0) return null;

    return (
        <div 
            className={cn("group relative w-full overflow-hidden", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items ? items.map((node, index) => (
                    <div key={index} className="relative h-full w-full flex-shrink-0 snap-center bg-muted/20">
                        {node}
                    </div>
                )) : images.map((src, index) => (
                    <div key={index} className="relative h-full w-full flex-shrink-0 snap-center bg-muted/20">
                        <img
                            src={src}
                            alt={`Banner ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {count > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute z-50 left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-opacity"
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute z-50 right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-opacity"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                    
                    <div className="absolute z-50 bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {Array.from({ length: count }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollTo(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    idx === currentIndex ? "w-8 bg-white" : "bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
