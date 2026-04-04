// Input.tsx
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  required?: boolean;
  autoExpand?: boolean;
  minHeight?: number;
  maxHeight?: number;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", required, autoExpand = false, minHeight = 40, maxHeight = 200, value, onChange, leftIcon: LeftIcon, rightIcon: RightIcon, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shouldUseTextarea = autoExpand && type === "text";

    // ... (rest of effects)
    useEffect(() => {
      if (shouldUseTextarea && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const hasValue = textarea.value && textarea.value.trim().length > 0;
        let scrollHeight = textarea.scrollHeight;
        if (!hasValue) scrollHeight = Math.max(scrollHeight, minHeight);
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      }
    }, [value, shouldUseTextarea, minHeight, maxHeight]);

    useEffect(() => {
      if (shouldUseTextarea && textareaRef.current) {
        const timeoutId = setTimeout(() => {
          if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const hasValue = textarea.value && textarea.value.trim().length > 0;
            let scrollHeight = textarea.scrollHeight;
            if (!hasValue) scrollHeight = Math.max(scrollHeight, minHeight);
            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
          }
        }, 10);
        return () => clearTimeout(timeoutId);
      }
    }, [shouldUseTextarea, minHeight, maxHeight]);

    if (shouldUseTextarea) {
      return (
        <div className="relative w-full">
          {LeftIcon && (
            <LeftIcon className="absolute top-3 left-3 size-4 text-muted-foreground transition-colors peer-focus:text-foreground" />
          )}
          <textarea
            required={required}
            aria-invalid={!!error}
            className={cn(
              "peer border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              error && "border-destructive",
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              className
            )}
            ref={textareaRef}
            value={value}
            onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
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
          {RightIcon && (
            <RightIcon className="absolute top-3 right-3 size-4 text-muted-foreground transition-colors peer-focus:text-foreground" />
          )}
          {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
      );
    }

    return (
      <div className="relative w-full">
        {LeftIcon && (
          <LeftIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground transition-colors peer-focus:text-foreground" />
        )}
        <input
          type={type}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "peer border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            error && "border-destructive",
            LeftIcon && "pl-10",
            RightIcon && "pr-10",
            className
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />
        {RightIcon && (
          <RightIcon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 transform text-muted-foreground transition-colors peer-focus:text-foreground" />
        )}
        {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";


export { Input };
