import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <div 
      style={{ zIndex: 99999 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:pointer-events-auto",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:pointer-events-auto",
          },
        }}
        {...props}
      />
    </div>
  )
}

export { Toaster }
