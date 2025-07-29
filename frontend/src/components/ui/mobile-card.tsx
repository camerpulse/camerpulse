import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mobile-card rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200",
          "hover:shadow-md hover:border-border/60",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCard.displayName = "MobileCard"

interface MobileCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MobileCardHeader = React.forwardRef<HTMLDivElement, MobileCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 sm:p-6", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCardHeader.displayName = "MobileCardHeader"

interface MobileCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MobileCardContent = React.forwardRef<HTMLDivElement, MobileCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 sm:p-6 pt-0", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCardContent.displayName = "MobileCardContent"

interface MobileCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const MobileCardTitle = React.forwardRef<HTMLHeadingElement, MobileCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
MobileCardTitle.displayName = "MobileCardTitle"

export { MobileCard, MobileCardHeader, MobileCardContent, MobileCardTitle }