import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"

const ThemeAwareCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentTheme } = useTheme();
  
  const getThemeClasses = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return "rounded-lg border bg-card text-card-foreground shadow-patriotic hover:shadow-patriotic/60 transition-all duration-300 hover:animate-eternal-glow";
      case 'emergence-2035':
        return "rounded-lg border bg-card text-card-foreground shadow-elegant hover:shadow-lg transition-all duration-300 hover:animate-heartbeat";
      default:
        return "rounded-lg border bg-card text-card-foreground shadow-sm";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(getThemeClasses(), className)}
      {...props}
    />
  )
})
ThemeAwareCard.displayName = "ThemeAwareCard"

const ThemeAwareCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentTheme } = useTheme();
  
  const getThemeClasses = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return "flex flex-col space-y-1.5 p-6 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5";
      case 'emergence-2035':
        return "flex flex-col space-y-1.5 p-6 border-b border-cm-green/20 bg-gradient-to-r from-cm-green/5 to-cm-yellow/5";
      default:
        return "flex flex-col space-y-1.5 p-6";
    }
  };

  return (
    <div ref={ref} className={cn(getThemeClasses(), className)} {...props} />
  )
})
ThemeAwareCardHeader.displayName = "ThemeAwareCardHeader"

const ThemeAwareCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { currentTheme } = useTheme();
  
  const getThemeClasses = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return "text-2xl font-semibold leading-none tracking-tight text-gradient-patriotic";
      case 'emergence-2035':
        return "text-2xl font-semibold leading-none tracking-tight text-gradient-flag";
      default:
        return "text-2xl font-semibold leading-none tracking-tight";
    }
  };

  return (
    <h3
      ref={ref}
      className={cn(getThemeClasses(), className)}
      {...props}
    />
  )
})
ThemeAwareCardTitle.displayName = "ThemeAwareCardTitle"

const ThemeAwareCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ThemeAwareCardDescription.displayName = "ThemeAwareCardDescription"

const ThemeAwareCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
ThemeAwareCardContent.displayName = "ThemeAwareCardContent"

const ThemeAwareCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentTheme } = useTheme();
  
  const getThemeClasses = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return "flex items-center p-6 pt-0 border-t border-primary/10 bg-gradient-to-r from-primary/2 to-secondary/2";
      case 'emergence-2035':
        return "flex items-center p-6 pt-0 border-t border-cm-green/10 bg-gradient-to-r from-cm-green/2 to-cm-yellow/2";
      default:
        return "flex items-center p-6 pt-0";
    }
  };

  return (
    <div ref={ref} className={cn(getThemeClasses(), className)} {...props} />
  )
})
ThemeAwareCardFooter.displayName = "ThemeAwareCardFooter"

export { 
  ThemeAwareCard, 
  ThemeAwareCardHeader, 
  ThemeAwareCardFooter, 
  ThemeAwareCardTitle, 
  ThemeAwareCardDescription, 
  ThemeAwareCardContent 
}