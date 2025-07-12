import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ThemeConfig {
  id: string
  name: string
  description: string
  isActive: boolean
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    card: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  components: {
    showCivicBanner: boolean
    showMonumentBackground: boolean
    showHeartbeatLogo: boolean
    showPartyGrid: boolean
    partyGridColumns: {
      desktop: number
      mobile: number
    }
  }
}

const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default CamerPulse',
  description: 'Standard CamerPulse theme',
  isActive: true,
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    background: 'hsl(var(--background))',
    card: 'hsl(var(--card))',
    text: 'hsl(var(--foreground))'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  components: {
    showCivicBanner: false,
    showMonumentBackground: false,
    showHeartbeatLogo: false,
    showPartyGrid: false,
    partyGridColumns: { desktop: 3, mobile: 1 }
  }
}

const emergence2035Theme: ThemeConfig = {
  id: 'emergence-2035',
  name: 'Emergence 2035',
  description: 'National pride and civic progress theme reflecting Cameroon\'s vision for 2035',
  isActive: false,
  colors: {
    primary: 'hsl(12, 100%, 45%)', // Cameroon Red
    secondary: 'hsl(145, 100%, 35%)', // Cameroon Green  
    accent: 'hsl(48, 100%, 50%)', // Cameroon Yellow
    background: 'hsl(0, 0%, 98%)',
    card: 'hsl(0, 0%, 100%)',
    text: 'hsl(0, 0%, 15%)'
  },
  fonts: {
    heading: 'Poppins',
    body: 'Inter'
  },
  components: {
    showCivicBanner: true,
    showMonumentBackground: true,
    showHeartbeatLogo: true,
    showPartyGrid: true,
    partyGridColumns: { desktop: 4, mobile: 2 }
  }
}

interface ThemeContextType {
  currentTheme: ThemeConfig
  availableThemes: ThemeConfig[]
  switchTheme: (themeId: string) => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme)
  const [availableThemes] = useState<ThemeConfig[]>([defaultTheme, emergence2035Theme])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActiveTheme()
  }, [])

  useEffect(() => {
    applyThemeToDocument(currentTheme)
  }, [currentTheme])

  const loadActiveTheme = async () => {
    try {
      setIsLoading(true)
      
      // Try to load active theme from database
      const { data, error } = await supabase
        .from('politica_ai_config')
        .select('config_value')
        .eq('config_key', 'active_theme')
        .single()

      if (!error && data?.config_value) {
        const themeId = data.config_value as string
        const theme = availableThemes.find(t => t.id === themeId)
        if (theme) {
          setCurrentTheme({ ...theme, isActive: true })
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchTheme = async (themeId: string) => {
    try {
      const newTheme = availableThemes.find(t => t.id === themeId)
      if (!newTheme) return

      // Update database
      await supabase
        .from('politica_ai_config')
        .upsert({
          config_key: 'active_theme',
          config_value: themeId,
          description: `Active theme: ${newTheme.name}`,
          is_active: true
        })

      // Update local state
      setCurrentTheme({ ...newTheme, isActive: true })
      
    } catch (error) {
      console.error('Error switching theme:', error)
      throw error
    }
  }

  const applyThemeToDocument = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-background', theme.colors.background)
    root.style.setProperty('--theme-card', theme.colors.card)
    root.style.setProperty('--theme-text', theme.colors.text)
    
    // Apply fonts
    root.style.setProperty('--theme-font-heading', theme.fonts.heading)
    root.style.setProperty('--theme-font-body', theme.fonts.body)
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme.id}`)
  }

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    switchTheme,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}