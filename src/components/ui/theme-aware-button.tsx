import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const themeAwareButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Theme-aware variants that adapt to current theme
        primary: "", // Will be set dynamically
        accent: "",  // Will be set dynamically
        sacred: "",  // Will be set dynamically for lux aeterna
        noble: "",   // Will be set dynamically for lux aeterna
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ThemeAwareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themeAwareButtonVariants> {
  asChild?: boolean
}

const ThemeAwareButton = React.forwardRef<HTMLButtonElement, ThemeAwareButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { currentTheme } = useTheme()
    const Comp = asChild ? Slot : "button"
    
    const getThemeSpecificClass = () => {
      if (currentTheme.id === 'lux-aeterna') {
        switch (variant) {
          case 'primary':
            return "bg-gradient-lux-primary text-white hover:shadow-lux-divine animate-eternal-glow"
          case 'accent':
            return "bg-gradient-lux-divine text-black hover:shadow-lux-sacred animate-sacred-pulse"
          case 'sacred':
            return "bg-gradient-lux-noble text-yellow-200 hover:shadow-lux-ethereal border border-yellow-400/30 animate-divine-ascension"
          case 'noble':
            return "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:shadow-lux-celebration animate-ethereal-float"
          default:
            return ""
        }
      } else if (currentTheme.id === 'emergence-2035') {
        switch (variant) {
          case 'primary':
            return "bg-gradient-civic text-white hover:shadow-elegant animate-heartbeat"
          case 'accent':
            return "bg-gradient-flag text-white hover:shadow-green animate-pulse-heartbeat"
          default:
            return ""
        }
      }
      
      // Default theme variants
      switch (variant) {
        case 'primary':
          return "bg-primary text-primary-foreground hover:bg-primary/90"
        case 'accent':
          return "bg-accent text-accent-foreground hover:bg-accent/90"
        default:
          return ""
      }
    }

    return (
      <Comp
        className={cn(
          themeAwareButtonVariants({ variant: variant === 'primary' || variant === 'accent' || variant === 'sacred' || variant === 'noble' ? 'default' : variant, size }),
          getThemeSpecificClass(),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
ThemeAwareButton.displayName = "ThemeAwareButton"

export { ThemeAwareButton, themeAwareButtonVariants }