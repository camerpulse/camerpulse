import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export const LuxAeternaParticles: React.FC = () => {
  const { currentTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200
    })

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 50 }, createParticle)
    }

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // Fade in/out effect
        const fadeProgress = particle.life / particle.maxLife
        if (fadeProgress < 0.1) {
          particle.opacity = (fadeProgress / 0.1) * 0.7
        } else if (fadeProgress > 0.9) {
          particle.opacity = (1 - fadeProgress) / 0.1 * 0.7
        }

        // Reset particle when it dies or goes off screen
        if (particle.life >= particle.maxLife || 
            particle.x < -10 || particle.x > canvas.width + 10 ||
            particle.y < -10 || particle.y > canvas.height + 10) {
          particlesRef.current[index] = createParticle()
        }
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach(particle => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        
        // Golden star particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )
        gradient.addColorStop(0, 'hsl(45, 95%, 70%)')
        gradient.addColorStop(0.7, 'hsl(45, 95%, 60%)')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add twinkling effect
        if (Math.random() < 0.1) {
          ctx.fillStyle = 'hsl(45, 95%, 85%)'
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()
      })
    }

    const animate = () => {
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentTheme.id])

  if (currentTheme.id !== 'lux-aeterna') return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}