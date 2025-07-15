import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/integrations/supabase/client'

interface CivicActionHighlightProps {
  children: React.ReactNode
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  isImportant?: boolean
  celebrateAction?: boolean
}

export const CivicActionHighlight: React.FC<CivicActionHighlightProps> = ({ 
  children, 
  priority = 'medium', 
  isImportant = false,
  celebrateAction = false 
}) => {
  const { currentTheme } = useTheme()
  const [shouldGlow, setShouldGlow] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Determine glow intensity based on importance
    setShouldGlow(isImportant || priority === 'high' || priority === 'urgent')
  }, [currentTheme.id, isImportant, priority])

  useEffect(() => {
    if (celebrateAction && currentTheme.id === 'lux-aeterna') {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [celebrateAction, currentTheme.id])

  if (currentTheme.id !== 'lux-aeterna') {
    return <>{children}</>
  }

  const getGlowClass = () => {
    if (!shouldGlow) return ''
    
    switch (priority) {
      case 'urgent':
        return 'shadow-[0_0_30px_hsl(355_85%_45%_/_0.6)] border-red-400/50'
      case 'high':
        return 'shadow-[0_0_25px_hsl(45_95%_60%_/_0.5)] border-yellow-400/50'
      case 'medium':
        return 'shadow-[0_0_20px_hsl(45_95%_60%_/_0.3)] border-yellow-300/30'
      default:
        return 'shadow-[0_0_15px_hsl(45_95%_60%_/_0.2)] border-yellow-200/20'
    }
  }

  return (
    <div className={`
      relative transition-all duration-500
      ${shouldGlow ? getGlowClass() : ''}
      ${showCelebration ? 'animate-pulse scale-105' : ''}
    `}>
      {children}
      
      {/* Celebration confetti effect */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 rounded-full bg-yellow-400
                animate-bounce
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Golden aura for important content */}
      {shouldGlow && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5 animate-pulse" />
        </div>
      )}
    </div>
  )
}