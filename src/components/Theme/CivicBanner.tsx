import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Flag, Users, Vote, Shield, Lightbulb, Target } from 'lucide-react'

const civicMessages = [
  {
    icon: Flag,
    text: "Votre voix façonne l'avenir du Cameroun",
    subtext: "Chaque opinion compte pour notre démocratie"
  },
  {
    icon: Users,
    text: "L'engagement civique commence par vous",
    subtext: "Soyez le changement que vous voulez voir"
  },
  {
    icon: Vote,
    text: "Transparence et responsabilité pour tous",
    subtext: "Exigeons des comptes de nos dirigeants"
  },
  {
    icon: Shield,
    text: "Protégeons notre démocratie ensemble",
    subtext: "La vigilance citoyenne est notre force"
  },
  {
    icon: Lightbulb,
    text: "L'éducation civique éclaire notre chemin",
    subtext: "Informons-nous pour mieux décider"
  },
  {
    icon: Target,
    text: "Objectif 2035: Un Cameroun prospère et juste",
    subtext: "Construisons ensemble notre vision nationale"
  }
]

interface CivicBannerProps {
  className?: string
  autoRotate?: boolean
  rotationInterval?: number
}

export const CivicBanner: React.FC<CivicBannerProps> = ({ 
  className,
  autoRotate = true,
  rotationInterval = 5000
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % civicMessages.length)
        setIsAnimating(false)
      }, 300) // Animation duration
      
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, rotationInterval])

  const currentMessage = civicMessages[currentMessageIndex]
  const IconComponent = currentMessage.icon

  return (
    <div className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-r from-theme-primary/5 via-theme-accent/5 to-theme-secondary/5",
      "border border-theme-accent/20 rounded-2xl",
      "backdrop-blur-sm",
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="60" height="60" className="w-full h-full">
          <defs>
            <pattern id="civic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 5 L35 20 L50 20 L38 30 L43 45 L30 35 L17 45 L22 30 L10 20 L25 20 Z" 
                    fill="currentColor" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#civic-pattern)"/>
        </svg>
      </div>

      <div className={cn(
        "relative p-6 md:p-8 text-center",
        "transition-all duration-300 ease-in-out",
        isAnimating && "opacity-0 transform translate-y-2"
      )}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={cn(
            "p-3 rounded-full",
            "bg-gradient-to-br from-theme-accent/20 to-theme-primary/20",
            "border border-theme-accent/30"
          )}>
            <IconComponent className="h-8 w-8 text-theme-primary" />
          </div>
        </div>

        {/* Main message */}
        <h2 className={cn(
          "text-xl md:text-2xl lg:text-3xl font-bold text-theme-text mb-2",
          "font-[family-name:var(--theme-font-heading)]"
        )}>
          {currentMessage.text}
        </h2>

        {/* Subtext */}
        <p className={cn(
          "text-theme-text/70 text-sm md:text-base",
          "font-[family-name:var(--theme-font-body)]"
        )}>
          {currentMessage.subtext}
        </p>

        {/* Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {civicMessages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMessageIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentMessageIndex
                  ? "bg-theme-accent w-6" 
                  : "bg-theme-text/20 hover:bg-theme-text/40"
              )}
              aria-label={`Show message ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 text-theme-accent/20">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div className="absolute bottom-4 right-4 text-theme-secondary/20">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  )
}