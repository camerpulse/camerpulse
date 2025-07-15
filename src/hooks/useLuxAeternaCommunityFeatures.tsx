import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CommunityEvent {
  id: string
  type: 'national_celebration' | 'unity_moment' | 'hope_wave' | 'civic_triumph'
  participants: number
  intensity: number
  duration: number
  timestamp: Date
}

interface ThemePreferences {
  soundEnabled: boolean
  gesturesEnabled: boolean
  voiceEnabled: boolean
  particleIntensity: number
  weatherEffects: boolean
  accessibilityMode: 'standard' | 'high_contrast' | 'reduced_motion'
}

export const useLuxAeternaCommunityFeatures = () => {
  const { currentTheme } = useTheme()
  const [activeEvents, setActiveEvents] = useState<CommunityEvent[]>([])
  const [sharedMoments, setSharedMoments] = useState<number>(0)
  const [preferences, setPreferences] = useState<ThemePreferences>({
    soundEnabled: false,
    gesturesEnabled: true,
    voiceEnabled: false,
    particleIntensity: 0.5,
    weatherEffects: true,
    accessibilityMode: 'standard'
  })

  // Community synchronization
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Simulate community events
    const eventTypes: CommunityEvent['type'][] = [
      'national_celebration',
      'unity_moment', 
      'hope_wave',
      'civic_triumph'
    ]

    const createCommunityEvent = (): CommunityEvent => ({
      id: crypto.randomUUID(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      participants: Math.floor(Math.random() * 10000) + 1000,
      intensity: Math.random() * 0.8 + 0.2,
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      timestamp: new Date()
    })

    // Add random community events
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        const newEvent = createCommunityEvent()
        setActiveEvents(prev => [...prev, newEvent])
        
        // Trigger community effect
        window.dispatchEvent(new CustomEvent('lux-community-event', {
          detail: newEvent
        }))

        // Remove event after its duration
        setTimeout(() => {
          setActiveEvents(prev => prev.filter(e => e.id !== newEvent.id))
        }, newEvent.duration * 1000)
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(eventInterval)
  }, [currentTheme.id])

  // Cross-platform sync simulation
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('lux-aeterna-preferences')
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs))
      } catch (error) {
        console.warn('Error loading theme preferences:', error)
      }
    }

    // Simulate sync with other devices
    const syncInterval = setInterval(() => {
      // In a real implementation, this would sync with a backend
      const simulatedSharedMoments = Math.floor(Math.random() * 1000) + 5000
      setSharedMoments(simulatedSharedMoments)
    }, 30000)

    return () => clearInterval(syncInterval)
  }, [currentTheme.id])

  // Save preferences
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    localStorage.setItem('lux-aeterna-preferences', JSON.stringify(preferences))
  }, [preferences, currentTheme.id])

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const triggerCommunityMoment = (type: CommunityEvent['type']) => {
    if (currentTheme.id !== 'lux-aeterna') return

    const event: CommunityEvent = {
      id: crypto.randomUUID(),
      type,
      participants: 1, // Started by current user
      intensity: 1.0,
      duration: 60,
      timestamp: new Date()
    }

    setActiveEvents(prev => [...prev, event])
    
    // Broadcast to community
    window.dispatchEvent(new CustomEvent('lux-community-moment', {
      detail: event
    }))

    setTimeout(() => {
      setActiveEvents(prev => prev.filter(e => e.id !== event.id))
    }, event.duration * 1000)
  }

  const joinCommunityEvent = (eventId: string) => {
    setActiveEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, participants: event.participants + 1 }
          : event
      )
    )
  }

  // Performance optimization based on device
  const getOptimizedSettings = () => {
    const isLowEndDevice = navigator.hardwareConcurrency <= 2
    const hasLimitedMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4
    const isSlowConnection = (navigator as any).connection?.effectiveType === 'slow-2g' || 
                            (navigator as any).connection?.effectiveType === '2g'

    if (isLowEndDevice || hasLimitedMemory || isSlowConnection) {
      return {
        particleCount: 25, // Reduced from 50
        animationDuration: 'slow',
        weatherEffects: false,
        backgroundComplexity: 'simple'
      }
    }

    return {
      particleCount: 50,
      animationDuration: 'normal',
      weatherEffects: true,
      backgroundComplexity: 'full'
    }
  }

  return {
    activeEvents,
    sharedMoments,
    preferences,
    updatePreferences,
    triggerCommunityMoment,
    joinCommunityEvent,
    optimizedSettings: getOptimizedSettings(),
    isSupported: currentTheme.id === 'lux-aeterna'
  }
}