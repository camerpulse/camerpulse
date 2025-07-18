import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const themeAwareBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Theme-aware variants
        sacred: "", // Will be set dynamically for lux aeterna
        noble: "",  // Will be set dynamically for lux aeterna
        divine: "", // Will be set dynamically for lux aeterna
        ethereal: "", // Will be set dynamically for lux aeterna
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ThemeAwareBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof themeAwareBadgeVariants> {}

function ThemeAwareBadge({ className, variant, ...props }: ThemeAwareBadgeProps) {
  const { currentTheme } = useTheme()
  
  const getThemeSpecificClass = () => {
    if (currentTheme.id === 'lux-aeterna') {
      switch (variant) {
        case 'sacred':
          return "bg-gradient-lux-primary text-white border-yellow-400/30 shadow-lux-divine animate-eternal-glow"
        case 'noble':
          return "bg-gradient-lux-noble text-yellow-200 border-yellow-400/50 shadow-lux-sacred animate-divine-ascension"
        case 'divine':
          return "bg-gradient-lux-divine text-black border-yellow-500/60 shadow-lux-ethereal animate-sacred-pulse"
        case 'ethereal':
          return "bg-white/10 backdrop-blur-sm text-white border-white/30 shadow-lux-celebration animate-ethereal-float"
        default:
          return "bg-gradient-patriotic text-white border-yellow-400/40 animate-patriotic-pulse"
      }
    } else if (currentTheme.id === 'emergence-2035') {
      switch (variant) {
        case 'sacred':
        case 'noble':
        case 'divine':
        case 'ethereal':
          return "bg-gradient-civic text-white border-cm-green/40 animate-heartbeat"
        default:
          return ""
      }
    }
    
    return ""
  }

  return (
    <div 
      className={cn(
        themeAwareBadgeVariants({ 
          variant: ['sacred', 'noble', 'divine', 'ethereal'].includes(variant || '') ? 'default' : variant 
        }), 
        getThemeSpecificClass(),
        className
      )} 
      {...props} 
    />
  )
}

export { ThemeAwareBadge, themeAwareBadgeVariants }