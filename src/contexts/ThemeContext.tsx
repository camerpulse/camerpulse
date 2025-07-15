import * as React from 'react'
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
  description: 'Professional Cameroon civic democracy theme with national colors and enhanced styling',
  isActive: false,
  colors: {
    primary: 'hsl(var(--primary))', // Will use CSS variables
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    background: 'hsl(var(--background))',
    card: 'hsl(var(--card))',
    text: 'hsl(var(--foreground))'
  },
  fonts: {
    heading: 'Playfair Display',
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

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeConfig>(defaultTheme)
  const [availableThemes] = React.useState<ThemeConfig[]>([defaultTheme, emergence2035Theme])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadActiveTheme()
  }, [])

  React.useEffect(() => {
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
        .maybeSingle()

      console.log('Theme loading:', { data, error })

      if (!error && data?.config_value) {
        const themeId = String(data.config_value).replace(/"/g, '') // Remove quotes if present
        console.log('Found theme ID:', themeId)
        const theme = availableThemes.find(t => t.id === themeId)
        if (theme) {
          console.log('Setting theme:', theme.name)
          setCurrentTheme({ ...theme, isActive: true })
        }
      } else {
        console.log('No theme found in database, using default')
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
    
    // Apply Cameroon flag colors directly to CSS variables for Emergence 2035
    if (theme.id === 'emergence-2035') {
      root.style.setProperty('--primary', '12 85% 35%') // Cameroon Red
      root.style.setProperty('--secondary', '145 75% 25%') // Cameroon Green
      root.style.setProperty('--accent', '48 95% 45%') // Cameroon Yellow
      root.style.setProperty('--background', '0 0% 97%')
      root.style.setProperty('--card', '0 0% 99%')
      root.style.setProperty('--foreground', '0 0% 8%')
    } else {
      // Default theme colors
      root.style.setProperty('--primary', '142 69% 40%')
      root.style.setProperty('--secondary', '210 40% 98%')
      root.style.setProperty('--accent', '46 100% 60%')
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--foreground', '222 84% 5%')
    }
    
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