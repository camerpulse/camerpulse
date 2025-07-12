import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MobileList = React.forwardRef<HTMLDivElement, MobileListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileList.displayName = "MobileList"

interface MobileListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  active?: boolean
  clickable?: boolean
}

const MobileListItem = React.forwardRef<HTMLDivElement, MobileListItemProps>(
  ({ className, children, active, clickable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/50",
          "min-h-[64px]", // Mobile-friendly touch target
          clickable && "cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors",
          active && "bg-primary/10 border-primary/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileListItem.displayName = "MobileListItem"

interface MobileListContentProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  trailing?: React.ReactNode
}

const MobileListContent = React.forwardRef<HTMLDivElement, MobileListContentProps>(
  ({ className, title, subtitle, description, icon, trailing, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 flex-1 min-w-0", className)}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground truncate">{title}</h4>
            {trailing && (
              <div className="flex-shrink-0 ml-2">
                {trailing}
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)
MobileListContent.displayName = "MobileListContent"

export { MobileList, MobileListItem, MobileListContent }