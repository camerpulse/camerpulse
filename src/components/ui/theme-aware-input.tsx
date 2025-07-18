import * as React from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

export interface ThemeAwareInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'sacred' | 'noble' | 'ethereal'
}

const ThemeAwareInput = React.forwardRef<HTMLInputElement, ThemeAwareInputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const { currentTheme } = useTheme()
    
    const getThemeClasses = () => {
      const baseClasses = "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
      
      if (currentTheme.id === 'lux-aeterna') {
        switch (variant) {
          case 'sacred':
            return `${baseClasses} bg-gradient-to-r from-blue-950/50 to-purple-950/50 border border-yellow-400/30 text-yellow-100 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 placeholder:text-yellow-200/60 animate-eternal-glow`
          case 'noble':
            return `${baseClasses} bg-white/10 backdrop-blur-sm border border-white/20 text-white focus-visible:ring-white/50 focus-visible:border-white/50 placeholder:text-white/60 hover:bg-white/15`
          case 'ethereal':
            return `${baseClasses} bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-400/30 text-purple-100 focus-visible:ring-purple-400 focus-visible:border-purple-400 placeholder:text-purple-200/60 animate-ethereal-float`
          default:
            return `${baseClasses} bg-gradient-to-r from-blue-950/70 to-purple-950/70 border border-yellow-400/50 text-yellow-200 focus-visible:ring-yellow-400 animate-patriotic-pulse`
        }
      } else if (currentTheme.id === 'emergence-2035') {
        return `${baseClasses} bg-card border border-cm-green/20 text-foreground focus-visible:ring-cm-green focus-visible:border-cm-green animate-heartbeat`
      }
      
      // Default theme
      return `${baseClasses} border border-input bg-background text-foreground focus-visible:ring-ring`
    }

    return (
      <input
        type={type}
        className={cn(getThemeClasses(), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
ThemeAwareInput.displayName = "ThemeAwareInput"

export { ThemeAwareInput }