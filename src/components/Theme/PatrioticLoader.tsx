import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatrioticLoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const PatrioticLoader: React.FC<PatrioticLoaderProps> = ({ 
  className, 
  size = 'md',
  text = "Chargement..." 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Animated Cameroon Star */}
      <div className="relative">
        <Star 
          className={cn(
            sizeClasses[size],
            "text-theme-accent fill-current animate-heartbeat"
          )} 
        />
        
        {/* Pulse rings */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-theme-primary/30",
          "animate-ping"
        )} />
        <div className={cn(
          "absolute inset-2 rounded-full border border-theme-secondary/40",
          "animate-pulse"
        )} />
      </div>

      {/* Loading text with flag gradient */}
      <p className={cn(
        "text-sm font-medium text-gradient-flag",
        "font-[family-name:var(--theme-font-body)]"
      )}>
        {text}
      </p>

      {/* Progress dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              "bg-gradient-to-r from-theme-primary to-theme-secondary",
              "animate-pulse"
            )}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}