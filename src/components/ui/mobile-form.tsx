import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const MobileForm = React.forwardRef<HTMLFormElement, MobileFormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          "space-y-6 p-4 sm:p-6", // Mobile padding
          className
        )}
        {...props}
      >
        {children}
      </form>
    )
  }
)
MobileForm.displayName = "MobileForm"

interface MobileFormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}

const MobileFormField = ({ label, children, required, className }: MobileFormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <Input
        type={type}
        className={cn(
          "h-12 text-base", // Mobile-friendly height and text size
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileInput.displayName = "MobileInput"

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const MobileTextarea = React.forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        className={cn(
          "min-h-[96px] text-base resize-none", // Mobile-friendly sizing
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileTextarea.displayName = "MobileTextarea"

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant = "default", size = "lg", children, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "min-h-[48px] text-base font-medium", // 48px minimum for mobile touch targets
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
MobileButton.displayName = "MobileButton"

export { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton }