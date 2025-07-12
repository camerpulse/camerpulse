import React from 'react'
import { Star, Shield, Users, TrendingUp, Quote, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PresidentialHeroProps {
  className?: string
}

export const PresidentialHero: React.FC<PresidentialHeroProps> = ({ className }) => {
  return (
    <section className={cn(
      "relative overflow-hidden bg-gradient-to-br from-theme-background via-theme-card to-theme-background",
      "border-b border-theme-accent/10",
      className
    )}>
      {/* Presidential Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="presidential-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z" 
                    fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#presidential-pattern)"/>
        </svg>
      </div>

      <div className="relative container mx-auto px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* National Emblem */}
          <div className="flex justify-center mb-8">
            <div className={cn(
              "relative p-6 rounded-full",
              "bg-gradient-to-br from-theme-primary via-theme-accent to-theme-secondary",
              "shadow-2xl"
            )}>
              <Star className="h-16 w-16 text-white fill-current animate-pulse-heartbeat" />
              
              {/* Radiating rings of power */}
              <div className="absolute inset-0 rounded-full border-2 border-theme-accent/30 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-theme-primary/20 animate-pulse" />
              <div className="absolute -inset-8 rounded-full border border-theme-secondary/15 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Presidential Heading */}
          <div className="space-y-4">
            <h1 className={cn(
              "text-5xl md:text-6xl lg:text-7xl font-bold text-theme-text",
              "font-[family-name:var(--theme-font-heading)]",
              "leading-tight tracking-tight"
            )}>
              <span className="block text-theme-primary">CAMERPULSE</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-medium text-theme-text/80 mt-2">
                La Voix du Peuple
              </span>
            </h1>
            
            <div className={cn(
              "inline-flex items-center px-6 py-3 mt-6",
              "bg-gradient-to-r from-theme-primary/10 via-theme-accent/10 to-theme-secondary/10",
              "border border-theme-accent/20 rounded-full",
              "text-theme-text font-medium"
            )}>
              <Shield className="h-5 w-5 mr-3 text-theme-primary" />
              ÉMERGENCE 2035
              <Star className="h-4 w-4 ml-3 text-theme-accent fill-current" />
            </div>
          </div>

          {/* Presidential Quote */}
          <div className={cn(
            "relative p-8 mx-auto max-w-3xl",
            "bg-gradient-to-r from-theme-card via-theme-background to-theme-card",
            "border border-theme-accent/20 rounded-2xl shadow-xl"
          )}>
            <Quote className="h-8 w-8 text-theme-accent/60 mb-4" />
            <blockquote className={cn(
              "text-xl md:text-2xl text-theme-text/90 italic leading-relaxed",
              "font-[family-name:var(--theme-font-heading)]"
            )}>
              "Unis dans la diversité, nous bâtissons une nation où chaque voix compte, 
              où la transparence guide nos actions, et où l'émergence de 2035 devient réalité."
            </blockquote>
            <footer className="mt-6 text-theme-text/70 font-medium">
              — Vision Cameroun 2035
            </footer>
          </div>

          {/* Power Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { number: "10M+", label: "Citoyens Connectés", icon: Users },
              { number: "237", label: "Circonscriptions", icon: Shield },
              { number: "85%", label: "Transparence", icon: TrendingUp },
              { number: "2035", label: "Vision Émergence", icon: Star }
            ].map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div 
                  key={index}
                  className={cn(
                    "p-6 text-center",
                    "bg-gradient-to-br from-theme-card to-theme-background",
                    "border border-theme-accent/10 rounded-xl",
                    "hover:shadow-lg transition-all duration-300",
                    "group"
                  )}
                >
                  <IconComponent className="h-8 w-8 mx-auto mb-3 text-theme-primary group-hover:scale-110 transition-transform" />
                  <div className={cn(
                    "text-2xl md:text-3xl font-bold text-theme-primary",
                    "font-[family-name:var(--theme-font-heading)]"
                  )}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-theme-text/70 font-medium mt-1">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Call to Democratic Action */}
          <div className="pt-8">
            <button className={cn(
              "group relative inline-flex items-center px-8 py-4",
              "bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary",
              "text-white font-bold text-lg rounded-xl",
              "shadow-xl hover:shadow-2xl",
              "transition-all duration-300 transform hover:scale-105",
              "font-[family-name:var(--theme-font-heading)]"
            )}>
              <span>REJOINDRE LE MOUVEMENT</span>
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              
              {/* Power pulse effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary" />
    </section>
  )
}