import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AutoExpandInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
    error?: string;
    required?: boolean;
    minHeight?: number;
    maxHeight?: number;
}

/**
 * Componente Input que se expande automáticamente cuando el contenido es largo.
 * Usa un textarea internamente para permitir expansión vertical.
 */
const AutoExpandInput = React.forwardRef<HTMLTextAreaElement, AutoExpandInputProps>(
    ({ className, error, required, minHeight = 40, maxHeight = 200, value, onChange, ...props }, ref) => {
        const internalRef = useRef<HTMLTextAreaElement>(null);
        const textareaRef = (ref || internalRef) as React.RefObject<HTMLTextAreaElement>;

        useEffect(() => {
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                textarea.style.height = 'auto';
                const scrollHeight = textarea.scrollHeight;
                const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
                textarea.style.height = `${newHeight}px`;
                textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
            }
        }, [value, minHeight, maxHeight, textareaRef]);

        return (
            <div className="relative w-full">
                <textarea
                    required={required}
                    aria-invalid={!!error}
                    className={cn(
                        "peer border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        error && "border-destructive",
                        className
                    )}
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    rows={1}
                    style={{
                        minHeight: `${minHeight}px`,
                        maxHeight: `${maxHeight}px`,
                    }}
                    {...props}
                />

                {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
            </div>
        );
    }
);

AutoExpandInput.displayName = "AutoExpandInput";

export { AutoExpandInput };

