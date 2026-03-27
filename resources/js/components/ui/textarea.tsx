import * as React from "react"
import { useEffect } from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & {
    autoExpand?: boolean;
    minHeight?: number;
    maxHeight?: number;
  }
>(({ className, autoExpand = false, minHeight, maxHeight = 200, value, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref || internalRef) as React.RefObject<HTMLTextAreaElement>;

  useEffect(() => {
    if (autoExpand && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const calculatedMinHeight = minHeight || 40;
      const newHeight = Math.min(Math.max(scrollHeight, calculatedMinHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value, autoExpand, minHeight, maxHeight, textareaRef]);

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[100px] md:text-sm",
        autoExpand && "resize-none overflow-hidden",
        className
      )}
      ref={textareaRef}
      value={value}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
