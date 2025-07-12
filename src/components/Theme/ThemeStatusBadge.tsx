import React from 'react'
import { Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeStatusBadgeProps {
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const ThemeStatusBadge: React.FC<ThemeStatusBadgeProps> = ({ 
  className, 
  position = 'top-right' 
}) => {
  const { currentTheme } = useTheme()

  // Only show for special themes
  if (currentTheme.id === 'default') return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const getThemeIcon = () => {
    switch (currentTheme.id) {
      case 'emergence-2035':
        return <Star className="h-4 w-4 text-theme-accent fill-current animate-pulse-heartbeat" />
      default:
        return <Crown className="h-4 w-4 text-theme-primary" />
    }
  }

  const getThemeColors = () => {
    if (currentTheme.id === 'emergence-2035') {
      return {
        bg: 'bg-gradient-to-r from-theme-primary/90 via-theme-accent/90 to-theme-secondary/90',
        border: 'border-theme-accent/30',
        text: 'text-white'
      }
    }
    return {
      bg: 'bg-theme-primary/90',
      border: 'border-theme-primary/30',
      text: 'text-white'
    }
  }

  const colors = getThemeColors()

  return (
    <div className={cn(
      "fixed z-50 pointer-events-none",
      positionClasses[position],
      className
    )}>
      <div className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-full",
        "backdrop-blur-sm border shadow-lg",
        colors.bg,
        colors.border,
        colors.text,
        "animate-fade-in-up"
      )}>
        {getThemeIcon()}
        
        <span className={cn(
          "text-xs font-medium",
          "font-[family-name:var(--theme-font-body)]"
        )}>
          {currentTheme.name}
        </span>

        {/* Patriotic pulse effect for Emergence 2035 */}
        {currentTheme.id === 'emergence-2035' && (
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-theme-primary/20 via-theme-accent/20 to-theme-secondary/20",
            "animate-ping"
          )} />
        )}
      </div>
    </div>
  )
}