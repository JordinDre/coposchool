// Input.tsx
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string; // <- ahora string
  required?: boolean;
  autoExpand?: boolean; // Nueva prop para auto-expansión
  minHeight?: number;
  maxHeight?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", required, autoExpand = false, minHeight = 40, maxHeight = 200, value, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shouldUseTextarea = autoExpand && type === "text";

    // Ajustar altura del textarea cuando autoExpand está activo
    useEffect(() => {
      if (shouldUseTextarea && textareaRef.current) {
        const textarea = textareaRef.current;
        // Resetear altura para recalcular
        textarea.style.height = 'auto';
        
        // Calcular altura basada en el contenido
        // Si hay valor, usar scrollHeight; si está vacío, usar minHeight
        const hasValue = textarea.value && textarea.value.trim().length > 0;
        let scrollHeight = textarea.scrollHeight;
        
        // Si está vacío, asegurar que tenga al menos la altura mínima
        if (!hasValue) {
          scrollHeight = Math.max(scrollHeight, minHeight);
        }
        
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      }
    }, [value, shouldUseTextarea, minHeight, maxHeight]);
    
    // También ajustar cuando el componente se monta
    useEffect(() => {
      if (shouldUseTextarea && textareaRef.current) {
        // Pequeño delay para asegurar que el DOM esté actualizado
        const timeoutId = setTimeout(() => {
          if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const hasValue = textarea.value && textarea.value.trim().length > 0;
            let scrollHeight = textarea.scrollHeight;
            
            if (!hasValue) {
              scrollHeight = Math.max(scrollHeight, minHeight);
            }
            
            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
          }
        }, 10);
        return () => clearTimeout(timeoutId);
      }
    }, [shouldUseTextarea, minHeight, maxHeight]);

    // Si autoExpand está activo y es tipo text, usar textarea
    if (shouldUseTextarea) {
      return (
        <div className="relative w-full">
          <textarea
            required={required}
            aria-invalid={!!error}
            className={cn(
              "peer border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              error && "border-destructive",
              className
            )}
            ref={textareaRef}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={1}
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: `${maxHeight}px`,
              lineHeight: '1.5rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
            }}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />

          {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
      );
    }

    // Comportamiento normal para inputs que no necesitan auto-expansión
    return (
      <div className="relative w-full">
        <input
          type={type}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "peer border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            error && "border-destructive",
            className
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />

        {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";


export { Input };
