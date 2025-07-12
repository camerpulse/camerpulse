import React from 'react'
import { Star, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type ToastType = 'success' | 'error' | 'info' | 'patriotic'

interface PatrioticToastProps {
  type: ToastType
  title: string
  description?: string
  onClose?: () => void
  className?: string
}

export const PatrioticToast: React.FC<PatrioticToastProps> = ({
  type,
  title,
  description,
  onClose,
  className
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-theme-secondary" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-theme-primary" />
      case 'info':
        return <Info className="h-5 w-5 text-theme-accent" />
      case 'patriotic':
        return <Star className="h-5 w-5 text-theme-accent fill-current animate-pulse-heartbeat" />
      default:
        return <Info className="h-5 w-5 text-theme-accent" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-theme-secondary/30'
      case 'error':
        return 'border-theme-primary/30'
      case 'info':
        return 'border-theme-accent/30'
      case 'patriotic':
        return 'border-gradient-flag'
      default:
        return 'border-theme-accent/30'
    }
  }

  const getBackgroundGradient = () => {
    if (type === 'patriotic') {
      return 'bg-gradient-to-r from-theme-primary/5 via-theme-accent/5 to-theme-secondary/5'
    }
    return 'bg-theme-card'
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border p-4 shadow-lg",
      "backdrop-blur-sm",
      getBorderColor(),
      getBackgroundGradient(),
      "animate-fade-in-up",
      className
    )}>
      {/* Patriotic pattern background */}
      {type === 'patriotic' && (
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="40" height="40" className="w-full h-full">
            <defs>
              <pattern id="patriotic-toast-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 3 L22 12 L31 12 L24 17 L26 26 L20 21 L14 26 L16 17 L9 12 L18 12 Z" 
                      fill="currentColor" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#patriotic-toast-pattern)"/>
          </svg>
        </div>
      )}

      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h4 className={cn(
            "text-sm font-semibold text-theme-text",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            {title}
          </h4>
          
          {description && (
            <p className={cn(
              "text-sm text-theme-text/70",
              "font-[family-name:var(--theme-font-body)]"
            )}>
              {description}
            </p>
          )}

          {/* Patriotic footer */}
          {type === 'patriotic' && (
            <div className="pt-2 flex items-center space-x-2 text-xs text-theme-text/50">
              <Star className="h-3 w-3 text-theme-accent fill-current" />
              <span>Emergence 2035</span>
            </div>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-theme-text/40 hover:text-theme-text"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Helper hook for showing patriotic toasts
export const usePatrioticToast = () => {
  // This would integrate with your existing toast system
  // For now, it's a placeholder for the structure
  const showPatrioticToast = (title: string, description?: string) => {
    // Implementation would depend on your toast provider
    console.log('Patriotic Toast:', { title, description })
  }

  return { showPatrioticToast }
}