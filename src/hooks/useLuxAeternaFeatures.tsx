import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/integrations/supabase/client'

interface CivicAchievement {
  id: string
  title: string
  description: string
  unlockedAt: Date
}

interface LuxAeternaFeatures {
  achievements: CivicAchievement[]
  nationalMood: 'hopeful' | 'concerned' | 'celebrating' | 'unified'
  isSpecialEvent: boolean
  patrioticQuote: string
  addAchievement: (achievement: Omit<CivicAchievement, 'id' | 'unlockedAt'>) => void
  triggerCelebration: () => void
}

export const useLuxAeternaFeatures = (): LuxAeternaFeatures => {
  const { currentTheme } = useTheme()
  const [achievements, setAchievements] = useState<CivicAchievement[]>([])
  const [nationalMood, setNationalMood] = useState<'hopeful' | 'concerned' | 'celebrating' | 'unified'>('hopeful')
  const [isSpecialEvent, setIsSpecialEvent] = useState(false)
  const [patrioticQuote] = useState(() => {
    const quotes = [
      "Together we build a stronger Cameroon - Ensemble nous construisons un Cameroun plus fort",
      "Unity in diversity, strength in harmony - Unité dans la diversité, force dans l'harmonie",
      "Hope lights the path to progress - L'espoir éclaire le chemin du progrès",
      "One people, one destiny, endless possibilities - Un peuple, un destin, des possibilités infinies",
      "In truth and justice we trust - En vérité et justice nous croyons"
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  })

  // Monitor national sentiment from our intelligence data
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const checkNationalMood = async () => {
      try {
        const { data: sentimentData } = await supabase
          .from('camerpulse_intelligence_regional_sentiment')
          .select('overall_sentiment, dominant_emotions')
          .order('created_at', { ascending: false })
          .limit(5)

        if (sentimentData && sentimentData.length > 0) {
          const avgSentiment = sentimentData.reduce((sum, item) => 
            sum + (item.overall_sentiment || 0), 0) / sentimentData.length

          const dominantEmotions = sentimentData.flatMap(item => 
            item.dominant_emotions || [])

          if (avgSentiment > 0.6) {
            setNationalMood('celebrating')
          } else if (avgSentiment > 0.2) {
            setNationalMood('hopeful')
          } else if (avgSentiment < -0.3) {
            setNationalMood('concerned')
          } else {
            setNationalMood('unified')
          }
        }
      } catch (error) {
        console.error('Error checking national mood:', error)
      }
    }

    checkNationalMood()
    const interval = setInterval(checkNationalMood, 300000) // Check every 5 minutes
    
    return () => clearInterval(interval)
  }, [currentTheme.id])

  // Check for special events
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const checkSpecialEvents = async () => {
      try {
        const { data: events } = await supabase
          .from('civic_service_events')
          .select('event_type, severity')
          .eq('is_active', true)
          .in('event_category', ['national_celebration', 'unity_day', 'achievement'])

        setIsSpecialEvent(events && events.length > 0)
      } catch (error) {
        console.error('Error checking special events:', error)
      }
    }

    checkSpecialEvents()
  }, [currentTheme.id])

  const addAchievement = (achievement: Omit<CivicAchievement, 'id' | 'unlockedAt'>) => {
    const newAchievement: CivicAchievement = {
      ...achievement,
      id: crypto.randomUUID(),
      unlockedAt: new Date()
    }
    
    setAchievements(prev => [...prev, newAchievement])
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('lux-aeterna-achievements')
    const existingAchievements = stored ? JSON.parse(stored) : []
    localStorage.setItem('lux-aeterna-achievements', 
      JSON.stringify([...existingAchievements, newAchievement]))
  }

  const triggerCelebration = () => {
    // Dispatch custom event for celebration effects
    window.dispatchEvent(new CustomEvent('lux-aeterna-celebration', {
      detail: { timestamp: Date.now() }
    }))
  }

  // Load achievements from localStorage
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const stored = localStorage.getItem('lux-aeterna-achievements')
    if (stored) {
      try {
        const parsedAchievements = JSON.parse(stored)
        setAchievements(parsedAchievements)
      } catch (error) {
        console.error('Error loading achievements:', error)
      }
    }
  }, [currentTheme.id])

  return {
    achievements,
    nationalMood,
    isSpecialEvent,
    patrioticQuote,
    addAchievement,
    triggerCelebration
  }
}