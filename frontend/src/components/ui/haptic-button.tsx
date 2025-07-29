import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useVibration } from "@/hooks/useVibration"

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  hapticFeedback?: boolean
  hapticType?: 'click' | 'success' | 'error' | 'longPress'
}

const HapticButton = React.forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    children, 
    onClick,
    hapticFeedback = true,
    hapticType = 'click',
    ...props 
  }, ref) => {
    const { vibrateClick, vibrateSuccess, vibrateError, vibrateLongPress } = useVibration()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      if (hapticFeedback) {
        switch (hapticType) {
          case 'click':
            vibrateClick()
            break
          case 'success':
            vibrateSuccess()
            break
          case 'error':
            vibrateError()
            break
          case 'longPress':
            vibrateLongPress()
            break
        }
      }

      // Call original onClick handler
      onClick?.(e)
    }

    return (
      <Button
        className={cn(
          "transition-all duration-150",
          "active:scale-95", // Mobile press feedback
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
HapticButton.displayName = "HapticButton"

export { HapticButton }