import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface MobileFABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  position?: "bottom-right" | "bottom-left" | "bottom-center"
  size?: "default" | "lg"
}

const MobileFAB = React.forwardRef<HTMLButtonElement, MobileFABProps>(
  ({ className, icon = <Plus className="h-6 w-6" />, position = "bottom-right", size = "default", ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4", 
      "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
    }

    const sizeClasses = {
      "default": "h-14 w-14",
      "lg": "h-16 w-16"
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "fixed z-50 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 hover:scale-110 active:scale-95",
          "border-2 border-primary/20",
          positionClasses[position],
          sizeClasses[size],
          className
        )}
        size="icon"
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
MobileFAB.displayName = "MobileFAB"

export { MobileFAB }