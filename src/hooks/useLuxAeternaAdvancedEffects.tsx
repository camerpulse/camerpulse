import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface WeatherEffect {
  type: 'sunny' | 'rainy' | 'harmattan' | 'clear'
  intensity: number
  season: 'dry' | 'wet'
}

interface GestureState {
  isListening: boolean
  lastGesture: string | null
  gestureCount: number
}

export const useLuxAeternaAdvancedEffects = () => {
  const { currentTheme } = useTheme()
  const [weather, setWeather] = useState<WeatherEffect>({
    type: 'clear',
    intensity: 0.5,
    season: 'dry'
  })
  const [gesture, setGesture] = useState<GestureState>({
    isListening: false,
    lastGesture: null,
    gestureCount: 0
  })
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [region, setRegion] = useState<string>('Centre')

  // Weather simulation based on Cameroon seasons
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const updateWeather = () => {
      const month = new Date().getMonth() + 1
      const isDrySeason = month >= 11 || month <= 3
      
      setWeather(prev => ({
        ...prev,
        season: isDrySeason ? 'dry' : 'wet',
        type: isDrySeason ? 'sunny' : Math.random() > 0.7 ? 'rainy' : 'clear',
        intensity: Math.random() * 0.8 + 0.2
      }))
    }

    updateWeather()
    const interval = setInterval(updateWeather, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [currentTheme.id])

  // Gesture recognition
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna' || !gesture.isListening) return

    let startX = 0, startY = 0
    let endX = 0, endY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (distance > 100) { // Minimum swipe distance
        let detectedGesture = ''
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          detectedGesture = deltaX > 0 ? 'swipe-right' : 'swipe-left'
        } else {
          detectedGesture = deltaY > 0 ? 'swipe-down' : 'swipe-up'
        }
        
        // Special patterns
        if (detectedGesture === 'swipe-up') {
          triggerPatrioticEffect()
        } else if (detectedGesture === 'swipe-right') {
          triggerUnityEffect()
        }
        
        setGesture(prev => ({
          ...prev,
          lastGesture: detectedGesture,
          gestureCount: prev.gestureCount + 1
        }))
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentTheme.id, gesture.isListening])

  // Voice recognition
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna' || !voiceEnabled) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = SpeechRecognition ? new SpeechRecognition() : null
    
    if (!recognition) return

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      
      if (transcript.includes('lux aeterna')) {
        triggerVoiceActivation()
      } else if (transcript.includes('unity') || transcript.includes('unité')) {
        triggerUnityEffect()
      } else if (transcript.includes('hope') || transcript.includes('espoir')) {
        triggerHopeEffect()
      }
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [currentTheme.id, voiceEnabled])

  // Regional customization
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Detect user's region (simplified)
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Simplified region detection for Cameroon
        if (latitude > 7 && longitude < 12) setRegion('Nord')
        else if (latitude > 5 && longitude > 14) setRegion('Est')
        else if (latitude < 4 && longitude > 11) setRegion('Sud')
        else if (longitude < 10) setRegion('Ouest')
        else setRegion('Centre')
      },
      () => setRegion('Centre') // Default fallback
    )
  }, [currentTheme.id])

  const triggerPatrioticEffect = () => {
    window.dispatchEvent(new CustomEvent('lux-patriotic-gesture', {
      detail: { type: 'patriotic', timestamp: Date.now() }
    }))
  }

  const triggerUnityEffect = () => {
    window.dispatchEvent(new CustomEvent('lux-unity-effect', {
      detail: { type: 'unity', timestamp: Date.now() }
    }))
  }

  const triggerHopeEffect = () => {
    window.dispatchEvent(new CustomEvent('lux-hope-effect', {
      detail: { type: 'hope', timestamp: Date.now() }
    }))
  }

  const triggerVoiceActivation = () => {
    window.dispatchEvent(new CustomEvent('lux-voice-activation', {
      detail: { command: 'lux-aeterna', timestamp: Date.now() }
    }))
  }

  const enableGestureListening = () => {
    setGesture(prev => ({ ...prev, isListening: true }))
  }

  const disableGestureListening = () => {
    setGesture(prev => ({ ...prev, isListening: false }))
  }

  const toggleVoiceRecognition = () => {
    setVoiceEnabled(!voiceEnabled)
  }

  return {
    weather,
    gesture,
    voiceEnabled,
    region,
    enableGestureListening,
    disableGestureListening,
    toggleVoiceRecognition,
    triggerPatrioticEffect,
    triggerUnityEffect,
    triggerHopeEffect,
    isSupported: currentTheme.id === 'lux-aeterna'
  }
}