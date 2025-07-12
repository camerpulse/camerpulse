import React from 'react'
import { Crown, Zap, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PowerIndicatorProps {
  className?: string
  position?: 'fixed' | 'relative'
}

export const PowerIndicator: React.FC<PowerIndicatorProps> = ({ 
  className, 
  position = 'fixed' 
}) => {
  // Simulated real-time power metrics
  const powerMetrics = {
    influence: 89, // Democratic influence score
    engagement: 94, // Citizen engagement level
    transparency: 78, // Government transparency rating
    impact: 91 // Social impact measurement
  }

  const powerLevel = Math.round((powerMetrics.influence + powerMetrics.engagement + powerMetrics.transparency + powerMetrics.impact) / 4)

  const getPowerColor = (level: number) => {
    if (level >= 90) return 'text-theme-secondary' // Green for excellent
    if (level >= 75) return 'text-theme-accent' // Yellow for good
    return 'text-theme-primary' // Red for needs improvement
  }

  const positionClasses = position === 'fixed' ? 'fixed bottom-6 left-6 z-50' : 'relative'

  return (
    <div className={cn(positionClasses, className)}>
      <div className={cn(
        "p-4 rounded-xl backdrop-blur-sm",
        "bg-gradient-to-br from-theme-card/90 to-theme-background/90",
        "border border-theme-accent/20 shadow-xl",
        "min-w-[200px]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-theme-primary" />
            <span className={cn(
              "font-bold text-theme-text text-sm",
              "font-[family-name:var(--theme-font-heading)]"
            )}>
              POUVOIR DÉMOCRATIQUE
            </span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            getPowerColor(powerLevel),
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            {powerLevel}%
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-2">
          {[
            { label: 'Influence', value: powerMetrics.influence, icon: Zap },
            { label: 'Engagement', value: powerMetrics.engagement, icon: Users },
            { label: 'Transparence', value: powerMetrics.transparency, icon: TrendingUp }
          ].map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-3 w-3 text-theme-text/60" />
                  <span className="text-xs text-theme-text/70">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-theme-text/10 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-gradient-to-r from-theme-primary to-theme-secondary rounded-full",
                        "transition-all duration-1000"
                      )}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-bold min-w-[2rem] text-right",
                    getPowerColor(metric.value)
                  )}>
                    {metric.value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pulse effect for high power */}
        {powerLevel >= 85 && (
          <div className="absolute inset-0 rounded-xl border border-theme-secondary/30 animate-ping" />
        )}
      </div>
    </div>
  )
}