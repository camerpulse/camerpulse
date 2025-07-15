import { useEffect, useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface AmbientSoundConfig {
  enabled: boolean
  volume: number
  currentTrack: 'nature' | 'anthem' | 'silence'
}

export const useLuxAeternaAmbientSound = () => {
  const { currentTheme } = useTheme()
  const [config, setConfig] = useState<AmbientSoundConfig>({
    enabled: false,
    volume: 0.3,
    currentTrack: 'nature'
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sound track URLs (using royalty-free sounds)
  const soundTracks = {
    nature: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfCjF+zPLYiTYEGGm88OOeXA4EQavb9MFuIgU5ktfyy3kpBiJ9xtDhcz8GUqPl8cJuHwU2jdj0wW4iEDOD1OzKdCgGHTOFpP',
    anthem: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfCjF+zPLYiTYEGGm88OOeXA4EQavb9MFuIgU5ktfyy3kpBiJ9xtDhcz8GUqPl8cJuHwU2jdj0wW4iEDOD1OzKdCgGHTOFpR',
    silence: ''
  }

  const toggleSound = () => {
    if (currentTheme.id !== 'lux-aeterna') return
    
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }))
  }

  const changeTrack = (track: 'nature' | 'anthem' | 'silence') => {
    if (currentTheme.id !== 'lux-aeterna') return
    
    setConfig(prev => ({ ...prev, currentTrack: track }))
  }

  const setVolume = (volume: number) => {
    setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }))
  }

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna' || !config.enabled) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    // Create audio element for ambient sound
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = true
      audioRef.current.preload = 'auto'
    }

    const audio = audioRef.current
    audio.volume = config.volume
    
    if (config.currentTrack !== 'silence') {
      audio.src = soundTracks[config.currentTrack]
      audio.play().catch(console.warn) // Browser may block autoplay
    }

    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [currentTheme.id, config.enabled, config.currentTrack, config.volume])

  return {
    config,
    toggleSound,
    changeTrack,
    setVolume,
    isSupported: currentTheme.id === 'lux-aeterna'
  }
}