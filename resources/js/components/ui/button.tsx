import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:text-white dark:hover:bg-input/50 dark:hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:text-white dark:hover:bg-accent/50 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline dark:text-white",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 md:h-9",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 md:h-8",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4 md:h-10",
        icon: "size-10 md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonColor =
  | "blue" | "green" | "amber" | "red" | "gray"
  | "sky" | "indigo" | "violet" | "rose"

const solidColor: Record<ButtonColor, string> = {
  blue:   "bg-blue-600 text-white hover:bg-blue-600/90 focus-visible:ring-blue-500/50 dark:bg-blue-600 dark:text-white",
  green:  "bg-emerald-600 text-white hover:bg-emerald-600/90 focus-visible:ring-emerald-500/50 dark:text-white",
  amber:  "bg-amber-600 text-white hover:bg-amber-600/90 focus-visible:ring-amber-500/50 dark:text-white",
  red:    "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-500/50 dark:text-white",
  gray:   "bg-gray-600 text-white hover:bg-gray-600/90 focus-visible:ring-gray-500/50 dark:text-white",
  sky:    "bg-sky-600 text-white hover:bg-sky-600/90 focus-visible:ring-sky-500/50 dark:text-white",
  indigo: "bg-indigo-600 text-white hover:bg-indigo-600/90 focus-visible:ring-indigo-500/50 dark:text-white",
  violet: "bg-violet-600 text-white hover:bg-violet-600/90 focus-visible:ring-violet-500/50 dark:text-white",
  rose:   "bg-rose-600 text-white hover:bg-rose-600/90 focus-visible:ring-rose-500/50 dark:text-white",
}

const outlineColor: Record<ButtonColor, string> = {
  blue:   "border border-blue-600 text-blue-700 hover:bg-blue-50 dark:text-white dark:hover:bg-blue-950/20 dark:hover:text-white",
  green:  "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-white dark:hover:bg-emerald-950/20 dark:hover:text-white",
  amber:  "border border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-white dark:hover:bg-amber-950/20 dark:hover:text-white",
  red:    "border border-red-600 text-red-700 hover:bg-red-50 dark:text-white dark:hover:bg-red-950/20 dark:hover:text-white",
  gray:   "border border-gray-600 text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-900/40 dark:hover:text-white",
  sky:    "border border-sky-600 text-sky-700 hover:bg-sky-50 dark:text-white dark:hover:bg-sky-950/20 dark:hover:text-white",
  indigo: "border border-indigo-600 text-indigo-700 hover:bg-indigo-50 dark:text-white dark:hover:bg-indigo-950/20 dark:hover:text-white",
  violet: "border border-violet-600 text-violet-700 hover:bg-violet-50 dark:text-white dark:hover:bg-violet-950/20 dark:hover:text-white",
  rose:   "border border-rose-600 text-rose-700 hover:bg-rose-50 dark:text-white dark:hover:bg-rose-950/20 dark:hover:text-white",
}

const ghostColor: Record<ButtonColor, string> = {
  blue:   "text-blue-700 hover:bg-blue-50 dark:text-white dark:hover:bg-blue-950/20 dark:hover:text-white",
  green:  "text-emerald-700 hover:bg-emerald-50 dark:text-white dark:hover:bg-emerald-950/20 dark:hover:text-white",
  amber:  "text-amber-700 hover:bg-amber-50 dark:text-white dark:hover:bg-amber-950/20 dark:hover:text-white",
  red:    "text-red-700 hover:bg-red-50 dark:text-white dark:hover:bg-red-950/20 dark:hover:text-white",
  gray:   "text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-900/40 dark:hover:text-white",
  sky:    "text-sky-700 hover:bg-sky-50 dark:text-white dark:hover:bg-sky-950/20 dark:hover:text-white",
  indigo: "text-indigo-700 hover:bg-indigo-50 dark:text-white dark:hover:bg-indigo-950/20 dark:hover:text-white",
  violet: "text-violet-700 hover:bg-violet-50 dark:text-white dark:hover:bg-violet-950/20 dark:hover:text-white",
  rose:   "text-rose-700 hover:bg-rose-50 dark:text-white dark:hover:bg-rose-950/20 dark:hover:text-white",
}

const linkColor: Record<ButtonColor, string> = {
  blue:   "text-blue-600 hover:underline dark:text-white",
  green:  "text-emerald-600 hover:underline dark:text-white",
  amber:  "text-amber-600 hover:underline dark:text-white",
  red:    "text-red-600 hover:underline dark:text-white",
  gray:   "text-gray-600 hover:underline dark:text-white",
  sky:    "text-sky-600 hover:underline dark:text-white",
  indigo: "text-indigo-600 hover:underline dark:text-white",
  violet: "text-violet-600 hover:underline dark:text-white",
  rose:   "text-rose-600 hover:underline dark:text-white",
}

function classesForColor(
  variant: VariantProps<typeof buttonVariants>["variant"] = "default",
  color?: ButtonColor
) {
  if (!color) return ""
  switch (variant) {
    case "default": return solidColor[color]
    case "outline": return outlineColor[color]
    case "ghost":   return ghostColor[color]
    case "link":    return linkColor[color]
    default:        return ""
  }
}

// Props del hijo que vamos a clonar (sin any)
type ClonableProps = {
  className?: string
  children?: React.ReactNode
  "aria-busy"?: boolean
} & Record<string, unknown>

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza estilando a un único hijo (ej. <Link/>) sin wrappers extra */
    asChild?: boolean
    /** Color (aplica a default/outline/ghost/link) */
    color?: ButtonColor
    /** Estado de carga con spinner */
    loading?: boolean
    /** Texto alternativo mientras carga */
    loadingText?: string
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      asChild = false,
      color,
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    // ✅ asegura que siempre haya variant para aplicar color
    const resolvedVariant = variant ?? "default"

    const cls = cn(
      buttonVariants({ variant: resolvedVariant, size }),
      classesForColor(resolvedVariant, color),
      className
    )

    // --- MODO "AS CHILD": clonamos un ÚNICO elemento hijo (sin any) ---
    if (asChild) {
      const count = React.Children.count(children)

      if (count === 1 && React.isValidElement<ClonableProps>(children)) {
        const onlyChild = children
        const childClass = cn(children.props.className, cls)

        const childContent = (
          <>
            {loading && <Loader2 aria-hidden className="animate-spin" />}
            {loading && loadingText ? loadingText : children.props.children ?? children}
          </>
        )

        return React.cloneElement<ClonableProps>(onlyChild, {
          ...children.props,
          className: childClass,
          "aria-busy": loading || children.props["aria-busy"],
          children: childContent,
        })
      }

      // Si NO es un único ReactElement, renderiza un span seguro
      return (
        <span className={cls} aria-busy={loading}>
          {loading && <Loader2 aria-hidden className="animate-spin" />}
          {loading && loadingText ? loadingText : children}
        </span>
      )
    }

    // --- MODO BOTÓN NATIVO ---
    return (
      <button
        ref={ref}
        data-slot="button"
        data-loading={loading ? "true" : "false"}
        aria-busy={loading}
        disabled={disabled || loading}
        className={cls}
        {...props}
      >
        {loading && <Loader2 aria-hidden className="animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </button>
    )
  }
)

export { buttonVariants }
