import React from 'react'
import { Users, TrendingUp, Shield, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImpactMetricsProps {
  className?: string
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ className }) => {
  const metrics = [
    {
      title: "Civic Engagement",
      value: "2.3M",
      change: "+23%",
      description: "Active citizens this month",
      icon: Users,
      color: "primary"
    },
    {
      title: "Political Transparency", 
      value: "89%",
      change: "+12%",
      description: "National transparency score",
      icon: Shield,
      color: "secondary"
    },
    {
      title: "Democratic Growth",
      value: "156%",
      change: "+45%", 
      description: "Debate participation",
      icon: TrendingUp,
      color: "accent"
    },
    {
      title: "Social Impact",
      value: "4.7/5",
      change: "+0.8",
      description: "Citizen satisfaction rating",
      icon: Award,
      color: "primary"
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'from-primary/5 to-primary/10',
          border: 'border-primary/20',
          icon: 'text-primary',
          value: 'text-primary',
          badge: 'bg-primary/10 border-primary/20 text-primary'
        }
      case 'secondary':
        return {
          bg: 'from-secondary/5 to-secondary/10',
          border: 'border-secondary/20',
          icon: 'text-secondary-foreground',
          value: 'text-secondary-foreground',
          badge: 'bg-secondary/10 border-secondary/20 text-secondary-foreground'
        }
      case 'accent':
        return {
          bg: 'from-accent/5 to-accent/10',
          border: 'border-accent/20',
          icon: 'text-accent',
          value: 'text-accent',
          badge: 'bg-accent/10 border-accent/20 text-accent'
        }
      default:
        return {
          bg: 'from-primary/5 to-primary/10',
          border: 'border-primary/20',
          icon: 'text-primary',
          value: 'text-primary',
          badge: 'bg-primary/10 border-primary/20 text-primary'
        }
    }
  }

  return (
    <section className={cn("py-16 bg-background", className)}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold text-foreground mb-4",
            "font-['Playfair_Display',serif]"
          )}>
            Measured Democratic Impact
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Real-time data reflecting civic engagement and democratic progress in Cameroon
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            const colors = getColorClasses(metric.color)
            
            return (
              <div
                key={index}
                className={cn(
                  "relative p-6 rounded-xl border",
                  "bg-gradient-to-br",
                  colors.bg,
                  colors.border,
                  "hover:shadow-xl transition-all duration-300 group",
                  "overflow-hidden"
                )}
              >
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                  <IconComponent className="w-full h-full" />
                </div>

                <div className="relative">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={cn("h-8 w-8", colors.icon)} />
                    <span className={cn(
                      "text-sm font-bold px-2 py-1 rounded-full border",
                      colors.badge
                    )}>
                      {metric.change}
                    </span>
                  </div>

                  {/* Value */}
                  <div className={cn(
                    "text-3xl font-bold mb-2",
                    colors.value,
                    "font-['Playfair_Display',serif]"
                  )}>
                    {metric.value}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-foreground mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {metric.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* National Progress Bar */}
        <div className={cn(
          "relative p-8 rounded-2xl",
          "bg-gradient-to-r from-card via-background to-card",
          "border border-border shadow-lg"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={cn(
                "text-2xl font-bold text-foreground",
                "font-['Playfair_Display',serif]"
              )}>
                Emergence 2035 Progress
              </h3>
              <p className="text-foreground/70">
                National development objectives
              </p>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-3xl font-bold text-primary",
                "font-['Playfair_Display',serif]"
              )}>
                73%
              </div>
              <div className="text-sm text-foreground/60">
                Objectives achieved
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-1000 relative"
                style={{ width: '73%' }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-slide-shine" />
              </div>
            </div>
            
            {/* Milestone markers */}
            <div className="flex justify-between mt-2 text-xs text-foreground/60">
              <span>2020</span>
              <span>2025</span>
              <span>2030</span>
              <span className="font-bold text-primary">2035</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}