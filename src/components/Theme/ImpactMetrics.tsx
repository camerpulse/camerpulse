import React from 'react'
import { Users, TrendingUp, Shield, Award, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImpactMetricsProps {
  className?: string
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ className }) => {
  const metrics = [
    {
      title: "Engagement Civique",
      value: "2.3M",
      change: "+23%",
      description: "Citoyens actifs ce mois",
      icon: Users,
      color: "primary"
    },
    {
      title: "Transparence Politique",
      value: "89%",
      change: "+12%",
      description: "Score de transparence national",
      icon: Shield,
      color: "secondary"
    },
    {
      title: "Croissance Démocratique",
      value: "156%",
      change: "+45%",
      description: "Participation aux débats",
      icon: TrendingUp,
      color: "accent"
    },
    {
      title: "Impact Social",
      value: "4.7/5",
      change: "+0.8",
      description: "Note de satisfaction citoyenne",
      icon: Award,
      color: "primary"
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'from-theme-primary/5 to-theme-primary/10',
          border: 'border-theme-primary/20',
          icon: 'text-theme-primary',
          value: 'text-theme-primary'
        }
      case 'secondary':
        return {
          bg: 'from-theme-secondary/5 to-theme-secondary/10',
          border: 'border-theme-secondary/20',
          icon: 'text-theme-secondary',
          value: 'text-theme-secondary'
        }
      case 'accent':
        return {
          bg: 'from-theme-accent/5 to-theme-accent/10',
          border: 'border-theme-accent/20',
          icon: 'text-theme-accent',
          value: 'text-theme-accent'
        }
      default:
        return {
          bg: 'from-theme-primary/5 to-theme-primary/10',
          border: 'border-theme-primary/20',
          icon: 'text-theme-primary',
          value: 'text-theme-primary'
        }
    }
  }

  return (
    <section className={cn("py-16 bg-theme-background", className)}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold text-theme-text mb-4",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            Impact Démocratique Mesuré
          </h2>
          <p className="text-lg text-theme-text/70 max-w-2xl mx-auto">
            Des données en temps réel qui reflètent l'engagement civique et le progrès démocratique du Cameroun
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
                      "text-sm font-bold px-2 py-1 rounded-full",
                      "bg-theme-card border",
                      colors.border,
                      colors.value
                    )}>
                      {metric.change}
                    </span>
                  </div>

                  {/* Value */}
                  <div className={cn(
                    "text-3xl font-bold mb-2",
                    colors.value,
                    "font-[family-name:var(--theme-font-heading)]"
                  )}>
                    {metric.value}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-theme-text mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-sm text-theme-text/60">
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
          "bg-gradient-to-r from-theme-card via-theme-background to-theme-card",
          "border border-theme-accent/20 shadow-lg"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={cn(
                "text-2xl font-bold text-theme-text",
                "font-[family-name:var(--theme-font-heading)]"
              )}>
                Progrès Émergence 2035
              </h3>
              <p className="text-theme-text/70">
                Objectifs de développement national
              </p>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-3xl font-bold text-theme-primary",
                "font-[family-name:var(--theme-font-heading)]"
              )}>
                73%
              </div>
              <div className="text-sm text-theme-text/60">
                Objectifs atteints
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-theme-text/10 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary rounded-full transition-all duration-1000 relative"
                style={{ width: '73%' }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-slide-shine" />
              </div>
            </div>
            
            {/* Milestone markers */}
            <div className="flex justify-between mt-2 text-xs text-theme-text/60">
              <span>2020</span>
              <span>2025</span>
              <span>2030</span>
              <span className="font-bold text-theme-primary">2035</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}