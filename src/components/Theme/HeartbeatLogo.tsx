import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeartbeatLogoProps {
  className?: string
  showAnimation?: boolean
}

export const HeartbeatLogo: React.FC<HeartbeatLogoProps> = ({ 
  className, 
  showAnimation = true 
}) => {
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (showAnimation && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true)
      }, 500) // Start animation after component mounts
      return () => clearTimeout(timer)
    }
  }, [showAnimation, hasAnimated])

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Main Logo with Heartbeat */}
      <div className="relative flex items-center justify-center">
        {/* Star from Cameroon flag */}
        <div className={cn(
          "relative",
          showAnimation && "animate-pulse-heartbeat"
        )}>
          <Star 
            className={cn(
              "h-16 w-16 text-theme-accent fill-current",
              "drop-shadow-lg",
              showAnimation && hasAnimated && "animate-heartbeat"
            )} 
          />
          
          {/* Heartbeat line overlay */}
          <svg 
            className="absolute inset-0 h-16 w-16 pointer-events-none"
            viewBox="0 0 64 64"
          >
            <path
              d="M 8 32 L 16 32 L 20 24 L 24 40 L 28 16 L 32 48 L 36 20 L 40 36 L 44 32 L 56 32"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className={cn(
                "text-theme-primary opacity-80",
                showAnimation && hasAnimated && "animate-heartbeat-line"
              )}
            />
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      <div className="text-center">
        <h1 className={cn(
          "text-4xl md:text-5xl lg:text-6xl font-bold",
          "bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary bg-clip-text text-transparent",
          "font-[family-name:var(--theme-font-heading)]",
          "tracking-tight",
          showAnimation && hasAnimated && "animate-fade-in-up"
        )}>
          CamerPulse
        </h1>
        
        <p className={cn(
          "text-lg md:text-xl text-theme-text/80 mt-2",
          "font-[family-name:var(--theme-font-body)]",
          showAnimation && hasAnimated && "animate-fade-in-up animation-delay-300"
        )}>
          Le Pouls Civique du Cameroun 🇨🇲
        </p>
        
        {/* Emergence 2035 Badge */}
        <div className={cn(
          "inline-flex items-center px-4 py-2 mt-3",
          "bg-gradient-to-r from-theme-primary/10 to-theme-secondary/10",
          "border border-theme-accent/30 rounded-full",
          "text-theme-text/70 text-sm font-medium",
          showAnimation && hasAnimated && "animate-fade-in-up animation-delay-500"
        )}>
          <Star className="h-4 w-4 mr-2 text-theme-accent" />
          Emergence 2035
        </div>
      </div>
    </div>
  )
}