import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLuxAeternaAdvancedEffects } from '@/hooks/useLuxAeternaAdvancedEffects'

export const LuxAeternaWeatherEffects: React.FC = () => {
  const { currentTheme } = useTheme()
  const { weather } = useLuxAeternaAdvancedEffects()
  const [rainDrops, setRainDrops] = useState<Array<{ id: number; x: number; delay: number }>>([])
  const [dustParticles, setDustParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    if (weather.type === 'rainy') {
      // Generate rain drops
      const drops = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2
      }))
      setRainDrops(drops)
    } else {
      setRainDrops([])
    }

    if (weather.type === 'harmattan' || (weather.season === 'dry' && weather.intensity > 0.6)) {
      // Generate harmattan dust
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1
      }))
      setDustParticles(particles)
    } else {
      setDustParticles([])
    }
  }, [currentTheme.id, weather])

  if (currentTheme.id !== 'lux-aeterna') return null

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {/* Rain Effect */}
      {weather.type === 'rainy' && (
        <div className="absolute inset-0">
          {rainDrops.map(drop => (
            <div
              key={drop.id}
              className="absolute w-0.5 h-8 bg-blue-300/30 animate-bounce"
              style={{
                left: `${drop.x}%`,
                animationDuration: '1s',
                animationDelay: `${drop.delay}s`,
                transform: 'rotate(15deg)'
              }}
            />
          ))}
        </div>
      )}

      {/* Harmattan Dust Effect */}
      {(weather.type === 'harmattan' || (weather.season === 'dry' && weather.intensity > 0.6)) && (
        <div className="absolute inset-0">
          {dustParticles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-yellow-200/20 animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}

      {/* Sunny Rays Effect */}
      {weather.type === 'sunny' && weather.season === 'dry' && (
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-radial from-yellow-300/20 to-transparent rounded-full animate-pulse" />
          <div className="absolute top-5 right-5 w-2 h-20 bg-yellow-300/30 rotate-45 animate-pulse" />
          <div className="absolute top-8 right-12 w-2 h-16 bg-yellow-300/25 rotate-12 animate-pulse" />
          <div className="absolute top-12 right-8 w-2 h-24 bg-yellow-300/20 -rotate-12 animate-pulse" />
        </div>
      )}
    </div>
  )
}