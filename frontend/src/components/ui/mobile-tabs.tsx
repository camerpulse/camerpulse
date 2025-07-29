import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const MobileTabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const MobileTabs = ({ defaultValue, value, onValueChange, children, className }: MobileTabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  
  const currentValue = value !== undefined ? value : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <MobileTabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </MobileTabsContext.Provider>
  )
}

interface MobileTabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MobileTabsList = React.forwardRef<HTMLDivElement, MobileTabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full rounded-lg bg-muted p-1 overflow-x-auto scrollbar-hide",
          "gap-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileTabsList.displayName = "MobileTabsList"

interface MobileTabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

const MobileTabsTrigger = React.forwardRef<HTMLButtonElement, MobileTabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(MobileTabsContext)
    const isSelected = selectedValue === value

    return (
      <button
        ref={ref}
        className={cn(
          "flex-1 min-w-0 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium",
          "transition-all duration-200",
          "min-h-[44px] flex items-center justify-center",
          isSelected
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          className
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
MobileTabsTrigger.displayName = "MobileTabsTrigger"

interface MobileTabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const MobileTabsContent = React.forwardRef<HTMLDivElement, MobileTabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(MobileTabsContext)
    
    if (selectedValue !== value) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("mt-4 focus-visible:outline-none", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileTabsContent.displayName = "MobileTabsContent"

export { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent }