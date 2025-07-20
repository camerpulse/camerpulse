import * as React from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
const { createContext, useContext, useState, useEffect } = React

interface MobileContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  isStandalone: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
  isOnline: boolean
  connectionType: string
  showMobileUI: boolean
  toggleMobileUI: () => void
}

const MobileContext = createContext<MobileContextType | undefined>(undefined)

export const useMobile = () => {
  const context = useContext(MobileContext)
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider')
  }
  return context
}

interface MobileProviderProps {
  children: React.ReactNode
}

export const MobileProvider: React.FC<MobileProviderProps> = ({ children }) => {
  const detection = useMobileDetection()
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')
  const [showMobileUI, setShowMobileUI] = useState(true)

  useEffect(() => {
    // Orientation detection
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Connection type detection
    const updateConnectionType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown')
      }
    }

    // Initial setup
    handleOrientationChange()
    updateConnectionType()

    // Event listeners
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection change listener
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnectionType)
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionType)
      }
    }
  }, [])

  const toggleMobileUI = () => {
    setShowMobileUI(prev => !prev)
  }

  const value: MobileContextType = {
    ...detection,
    orientation,
    isOnline,
    connectionType,
    showMobileUI,
    toggleMobileUI
  }

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}