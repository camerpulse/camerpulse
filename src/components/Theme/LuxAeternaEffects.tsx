import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface LuxAeternaEffectsProps {
  children: React.ReactNode
}

export const LuxAeternaEffects: React.FC<LuxAeternaEffectsProps> = ({ children }) => {
  const { currentTheme } = useTheme()
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day')
  const [isNationalEvent, setIsNationalEvent] = useState(false)

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 8) setTimeOfDay('dawn')
      else if (hour >= 8 && hour < 17) setTimeOfDay('day')
      else if (hour >= 17 && hour < 20) setTimeOfDay('dusk')
      else setTimeOfDay('night')
    }

    const checkNationalEvents = () => {
      const today = new Date()
      const month = today.getMonth() + 1
      const day = today.getDate()
      
      // Check for Cameroon national holidays
      const nationalDays = [
        { month: 1, day: 1 }, // New Year
        { month: 2, day: 11 }, // Youth Day
        { month: 5, day: 1 }, // Labor Day
        { month: 5, day: 20 }, // National Day
        { month: 8, day: 15 }, // Assumption
        { month: 12, day: 25 }, // Christmas
      ]
      
      setIsNationalEvent(nationalDays.some(event => 
        event.month === month && event.day === day
      ))
    }

    updateTimeOfDay()
    checkNationalEvents()

    const interval = setInterval(updateTimeOfDay, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [currentTheme.id])

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const root = document.documentElement

    // Time-based color variations
    switch (timeOfDay) {
      case 'dawn':
        root.style.setProperty('--lux-primary-variant', '25 85% 55%') // Warm sunrise gold
        root.style.setProperty('--lux-accent-variant', '15 90% 65%') // Peachy dawn
        break
      case 'day':
        root.style.setProperty('--lux-primary-variant', '45 95% 60%') // Bright golden hope
        root.style.setProperty('--lux-accent-variant', '355 85% 45%') // Noble red
        break
      case 'dusk':
        root.style.setProperty('--lux-primary-variant', '35 90% 50%') // Sunset amber
        root.style.setProperty('--lux-accent-variant', '280 70% 60%') // Twilight purple
        break
      case 'night':
        root.style.setProperty('--lux-primary-variant', '45 70% 40%') // Subdued gold
        root.style.setProperty('--lux-accent-variant', '220 80% 30%') // Deep night blue
        break
    }

    // National event special effects
    if (isNationalEvent) {
      root.style.setProperty('--lux-celebration-glow', '0 0 30px hsl(45 95% 70% / 0.6)')
      root.style.setProperty('--lux-special-animation', 'pulse-celebration 3s ease-in-out infinite')
    } else {
      root.style.setProperty('--lux-celebration-glow', 'none')
      root.style.setProperty('--lux-special-animation', 'none')
    }
  }, [timeOfDay, isNationalEvent, currentTheme.id])

  if (currentTheme.id !== 'lux-aeterna') return <>{children}</>

  return (
    <div className={`
      lux-aeterna-effects
      ${timeOfDay === 'dawn' ? 'dawn-mode' : ''}
      ${timeOfDay === 'day' ? 'day-mode' : ''}
      ${timeOfDay === 'dusk' ? 'dusk-mode' : ''}
      ${timeOfDay === 'night' ? 'night-mode' : ''}
      ${isNationalEvent ? 'celebration-mode' : ''}
    `}>
      {children}
      
      {/* Ambient light overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-20">
        <div className={`
          w-full h-full transition-all duration-1000
          ${timeOfDay === 'dawn' ? 'bg-gradient-to-b from-orange-200/30 to-transparent' : ''}
          ${timeOfDay === 'day' ? 'bg-gradient-to-b from-yellow-100/20 to-transparent' : ''}
          ${timeOfDay === 'dusk' ? 'bg-gradient-to-b from-purple-200/30 to-transparent' : ''}
          ${timeOfDay === 'night' ? 'bg-gradient-to-b from-blue-900/40 to-transparent' : ''}
        `} />
      </div>

      {/* National event celebration overlay */}
      {isNationalEvent && (
        <div className="fixed inset-0 pointer-events-none z-20">
          <div className="w-full h-full bg-gradient-radial from-yellow-300/10 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </div>
  )
}