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

// ===========================================
// 🎵 CAMERPLAY MUSIC STREAMING THEMES 🎵
// ===========================================

const spotifyClassicTheme: ThemeConfig = {
  id: 'spotify-classic',
  name: 'Spotify Classic',
  description: 'Inspired by Spotify - Dark mode with vibrant green accents and modern music UI',
  isActive: false,
  colors: {
    primary: '120 93% 36%', // Spotify Green
    secondary: '0 0% 7%', // Deep Black
    accent: '120 93% 46%', // Bright Green
    background: '0 0% 6%', // Pure Black
    card: '0 0% 8%', // Dark Card
    text: '0 0% 100%' // White Text
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
    partyGridColumns: { desktop: 4, mobile: 2 }
  }
}

const appleMusicTheme: ThemeConfig = {
  id: 'apple-music',
  name: 'Apple Music',
  description: 'Clean Apple Music aesthetic with white backgrounds and colorful gradients',
  isActive: false,
  colors: {
    primary: '0 82% 60%', // Apple Red
    secondary: '0 0% 96%', // Light Gray
    accent: '225 100% 60%', // Apple Blue
    background: '0 0% 100%', // Pure White
    card: '0 0% 98%', // Off White
    text: '0 0% 8%' // Dark Text
  },
  fonts: {
    heading: 'SF Pro Display',
    body: 'SF Pro Text'
  },
  components: {
    showCivicBanner: false,
    showMonumentBackground: false,
    showHeartbeatLogo: false,
    showPartyGrid: false,
    partyGridColumns: { desktop: 3, mobile: 1 }
  }
}

const youtubeRedTheme: ThemeConfig = {
  id: 'youtube-red',
  name: 'YouTube Music',
  description: 'Bold YouTube Music theme with signature red and dark mode design',
  isActive: false,
  colors: {
    primary: '0 100% 50%', // YouTube Red
    secondary: '0 0% 12%', // Dark Gray
    accent: '0 100% 60%', // Bright Red
    background: '0 0% 7%', // Almost Black
    card: '0 0% 10%', // Dark Card
    text: '0 0% 100%' // White Text
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto'
  },
  components: {
    showCivicBanner: false,
    showMonumentBackground: false,
    showHeartbeatLogo: false,
    showPartyGrid: false,
    partyGridColumns: { desktop: 4, mobile: 2 }
  }
}

const soundcloudOrangeTheme: ThemeConfig = {
  id: 'soundcloud-orange',
  name: 'SoundCloud Pulse',
  description: 'SoundCloud inspired theme with signature orange and clean white design',
  isActive: false,
  colors: {
    primary: '16 100% 50%', // SoundCloud Orange
    secondary: '0 0% 95%', // Light Background
    accent: '16 100% 60%', // Bright Orange
    background: '0 0% 99%', // Off White
    card: '0 0% 100%', // Pure White
    text: '0 0% 13%' // Dark Text
  },
  fonts: {
    heading: 'Interstate',
    body: 'Interstate'
  },
  components: {
    showCivicBanner: false,
    showMonumentBackground: false,
    showHeartbeatLogo: false,
    showPartyGrid: false,
    partyGridColumns: { desktop: 5, mobile: 2 }
  }
}

const camerAfrobeatsTheme: ThemeConfig = {
  id: 'camer-afrobeats',
  name: 'CamerAfrobeats',
  description: 'Vibrant African-inspired theme with Cameroon flag colors and Afrobeats energy',
  isActive: false,
  colors: {
    primary: '12 85% 45%', // Cameroon Red
    secondary: '145 75% 35%', // Cameroon Green
    accent: '48 95% 55%', // Cameroon Yellow
    background: '0 0% 4%', // Deep Black
    card: '0 0% 8%', // Dark Card
    text: '48 95% 90%' // Golden White
  },
  fonts: {
    heading: 'Montserrat',
    body: 'Open Sans'
  },
  components: {
    showCivicBanner: false,
    showMonumentBackground: false,
    showHeartbeatLogo: false,
    showPartyGrid: false,
    partyGridColumns: { desktop: 4, mobile: 2 }
  }
}

const luxAeternaTheme: ThemeConfig = {
  id: 'lux-aeterna',
  name: 'Lux Aeterna',
  description: 'Eternal Light theme - A patriotic celebration of hope, unity, and the Cameroon fatherland with golden accents and noble design',
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
    partyGridColumns: { desktop: 5, mobile: 2 }
  }
}

interface ThemeContextType {
  currentTheme: ThemeConfig
  availableThemes: ThemeConfig[]
  switchTheme: (themeId: string) => Promise<void>
  isLoading: boolean
  canManageThemes: boolean
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
  const [availableThemes] = React.useState<ThemeConfig[]>([
    defaultTheme, 
    emergence2035Theme, 
    luxAeternaTheme,
    spotifyClassicTheme,
    appleMusicTheme,
    youtubeRedTheme,
    soundcloudOrangeTheme,
    camerAfrobeatsTheme
  ])
  const [isLoading, setIsLoading] = React.useState(true)
  const [canManageThemes, setCanManageThemes] = React.useState(false)

  React.useEffect(() => {
    loadActiveTheme()
    checkAdminStatus()
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

  const checkAdminStatus = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setCanManageThemes(false)
        return
      }

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .eq('role', 'admin')
        .maybeSingle()

      setCanManageThemes(!!userRoles)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setCanManageThemes(false)
    }
  }

  const switchTheme = async (themeId: string) => {
    try {
      // Check if user is admin
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (roleError || !userRoles) {
        throw new Error('Only administrators can change platform themes')
      }

      const newTheme = availableThemes.find(t => t.id === themeId)
      if (!newTheme) return

      // Update platform-wide theme setting
      await supabase
        .from('politica_ai_config')
        .upsert({
          config_key: 'active_theme',
          config_value: themeId,
          description: `Platform theme: ${newTheme.name}`,
          is_active: true
        })

      // Update local state for immediate feedback
      setCurrentTheme({ ...newTheme, isActive: true })
      
    } catch (error) {
      console.error('Error switching theme:', error)
      throw error
    }
  }

  const applyThemeToDocument = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    console.log('Applying theme:', theme.name, theme.id)
    
    // Apply theme-specific colors based on theme ID
    if (theme.id === 'emergence-2035') {
      // Cameroon flag colors for Emergence 2035
      root.style.setProperty('--primary', '12 85% 35%')
      root.style.setProperty('--secondary', '145 75% 25%')
      root.style.setProperty('--accent', '48 95% 45%')
      root.style.setProperty('--background', '0 0% 97%')
      root.style.setProperty('--card', '0 0% 99%')
      root.style.setProperty('--foreground', '0 0% 8%')
      root.style.setProperty('--muted', '210 40% 95%')
      root.style.setProperty('--muted-foreground', '215 13% 65%')
      root.style.setProperty('--border', '214 32% 91%')
      root.style.setProperty('--input', '214 32% 91%')
      root.style.setProperty('--ring', '12 85% 35%')
      
    } else if (theme.id === 'lux-aeterna') {
      // Lux Aeterna - Eternal Light theme
      root.style.setProperty('--primary', '220 90% 15%')
      root.style.setProperty('--primary-foreground', '45 95% 95%')
      root.style.setProperty('--secondary', '45 95% 60%')
      root.style.setProperty('--secondary-foreground', '220 90% 15%')
      root.style.setProperty('--accent', '355 85% 45%')
      root.style.setProperty('--accent-foreground', '45 95% 95%')
      root.style.setProperty('--background', '45 25% 98%')
      root.style.setProperty('--card', '45 30% 99%')
      root.style.setProperty('--card-foreground', '220 90% 8%')
      root.style.setProperty('--foreground', '220 90% 8%')
      root.style.setProperty('--muted', '45 20% 95%')
      root.style.setProperty('--muted-foreground', '220 60% 40%')
      root.style.setProperty('--border', '45 20% 90%')
      root.style.setProperty('--input', '45 20% 90%')
      root.style.setProperty('--ring', '220 90% 15%')
      
      // Enhanced Lux Aeterna specific colors
      root.style.setProperty('--primary-glow', '45 95% 70%')
      root.style.setProperty('--lux-divine', '220 90% 20%')
      root.style.setProperty('--lux-noble', '355 85% 45%')
      root.style.setProperty('--lux-ethereal', '45 100% 85%')
      root.style.setProperty('--lux-sacred', '45 95% 60%')
      root.style.setProperty('--lux-celebration', '30 100% 65%')
      root.style.setProperty('--lux-radiance', '45 100% 95%')
      
    } else if (theme.id === 'spotify-classic') {
      // Spotify Classic Theme
      root.style.setProperty('--primary', '141 76% 48%')
      root.style.setProperty('--primary-foreground', '0 0% 100%')
      root.style.setProperty('--secondary', '0 0% 7%')
      root.style.setProperty('--secondary-foreground', '0 0% 100%')
      root.style.setProperty('--accent', '141 86% 58%')
      root.style.setProperty('--accent-foreground', '0 0% 0%')
      root.style.setProperty('--background', '0 0% 6%')
      root.style.setProperty('--card', '0 0% 8%')
      root.style.setProperty('--card-foreground', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 100%')
      root.style.setProperty('--muted', '0 0% 12%')
      root.style.setProperty('--muted-foreground', '0 0% 60%')
      root.style.setProperty('--border', '0 0% 20%')
      root.style.setProperty('--input', '0 0% 15%')
      root.style.setProperty('--ring', '141 76% 48%')
      
    } else if (theme.id === 'apple-music') {
      // Apple Music Theme
      root.style.setProperty('--primary', '0 82% 60%')
      root.style.setProperty('--primary-foreground', '0 0% 100%')
      root.style.setProperty('--secondary', '0 0% 96%')
      root.style.setProperty('--secondary-foreground', '0 0% 8%')
      root.style.setProperty('--accent', '225 100% 60%')
      root.style.setProperty('--accent-foreground', '0 0% 100%')
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--card', '0 0% 98%')
      root.style.setProperty('--card-foreground', '0 0% 8%')
      root.style.setProperty('--foreground', '0 0% 8%')
      root.style.setProperty('--muted', '0 0% 96%')
      root.style.setProperty('--muted-foreground', '0 0% 45%')
      root.style.setProperty('--border', '0 0% 90%')
      root.style.setProperty('--input', '0 0% 90%')
      root.style.setProperty('--ring', '0 82% 60%')
      
    } else if (theme.id === 'youtube-red') {
      // YouTube Music Theme
      root.style.setProperty('--primary', '0 100% 50%')
      root.style.setProperty('--primary-foreground', '0 0% 100%')
      root.style.setProperty('--secondary', '0 0% 12%')
      root.style.setProperty('--secondary-foreground', '0 0% 100%')
      root.style.setProperty('--accent', '0 100% 60%')
      root.style.setProperty('--accent-foreground', '0 0% 100%')
      root.style.setProperty('--background', '0 0% 7%')
      root.style.setProperty('--card', '0 0% 10%')
      root.style.setProperty('--card-foreground', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 100%')
      root.style.setProperty('--muted', '0 0% 15%')
      root.style.setProperty('--muted-foreground', '0 0% 60%')
      root.style.setProperty('--border', '0 0% 20%')
      root.style.setProperty('--input', '0 0% 15%')
      root.style.setProperty('--ring', '0 100% 50%')
      
    } else if (theme.id === 'soundcloud-orange') {
      // SoundCloud Theme
      root.style.setProperty('--primary', '16 100% 50%')
      root.style.setProperty('--primary-foreground', '0 0% 100%')
      root.style.setProperty('--secondary', '0 0% 95%')
      root.style.setProperty('--secondary-foreground', '0 0% 13%')
      root.style.setProperty('--accent', '16 100% 60%')
      root.style.setProperty('--accent-foreground', '0 0% 100%')
      root.style.setProperty('--background', '0 0% 99%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '0 0% 13%')
      root.style.setProperty('--foreground', '0 0% 13%')
      root.style.setProperty('--muted', '0 0% 95%')
      root.style.setProperty('--muted-foreground', '0 0% 45%')
      root.style.setProperty('--border', '0 0% 90%')
      root.style.setProperty('--input', '0 0% 90%')
      root.style.setProperty('--ring', '16 100% 50%')
      
    } else if (theme.id === 'camer-afrobeats') {
      // CamerAfrobeats Theme
      root.style.setProperty('--primary', '12 85% 45%')
      root.style.setProperty('--primary-foreground', '48 95% 90%')
      root.style.setProperty('--secondary', '145 75% 35%')
      root.style.setProperty('--secondary-foreground', '48 95% 90%')
      root.style.setProperty('--accent', '48 95% 55%')
      root.style.setProperty('--accent-foreground', '0 0% 8%')
      root.style.setProperty('--background', '0 0% 4%')
      root.style.setProperty('--card', '0 0% 8%')
      root.style.setProperty('--card-foreground', '48 95% 90%')
      root.style.setProperty('--foreground', '48 95% 90%')
      root.style.setProperty('--muted', '0 0% 12%')
      root.style.setProperty('--muted-foreground', '48 50% 60%')
      root.style.setProperty('--border', '0 0% 20%')
      root.style.setProperty('--input', '0 0% 15%')
      root.style.setProperty('--ring', '12 85% 45%')
      
    } else {
      // Default theme colors
      root.style.setProperty('--primary', '142 69% 40%')
      root.style.setProperty('--primary-foreground', '355 79% 97%')
      root.style.setProperty('--secondary', '210 40% 98%')
      root.style.setProperty('--secondary-foreground', '222 84% 5%')
      root.style.setProperty('--accent', '46 100% 60%')
      root.style.setProperty('--accent-foreground', '355 79% 97%')
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '222 84% 5%')
      root.style.setProperty('--foreground', '222 84% 5%')
      root.style.setProperty('--muted', '210 40% 96%')
      root.style.setProperty('--muted-foreground', '215 13% 65%')
      root.style.setProperty('--border', '214 32% 91%')
      root.style.setProperty('--input', '214 32% 91%')
      root.style.setProperty('--ring', '142 69% 40%')
    }
    
    // Apply fonts
    root.style.setProperty('--theme-font-heading', theme.fonts.heading)
    root.style.setProperty('--theme-font-body', theme.fonts.body)
    
    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme.id}`)
    
    console.log('Theme applied successfully:', theme.name)
  }

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    switchTheme,
    isLoading,
    canManageThemes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}