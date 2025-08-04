import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  children: ReactNode
}

export const MobileProvider = ({ children }: MobileProviderProps) => {
  const [detection, setDetection] = useState<{
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isIOS: boolean
    isAndroid: boolean
    isPWA: boolean
    isStandalone: boolean
    userAgent: string
    screenSize: 'mobile' | 'tablet' | 'desktop'
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    isStandalone: false,
    userAgent: '',
    screenSize: 'desktop'
  })
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [connectionType, setConnectionType] = useState('unknown')
  const [showMobileUI, setShowMobileUI] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Mobile detection
    const detectMobile = () => {
      const userAgent = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const isMobile = /Mobi|Android/i.test(userAgent) || isIOS
      const isTablet = /iPad/.test(userAgent) || (isAndroid && !/Mobile/.test(userAgent))
      const isDesktop = !isMobile && !isTablet

      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true ||
                    document.referrer.includes('android-app://')

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches

      const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
        const width = window.innerWidth
        if (width < 768) return 'mobile'
        if (width < 1024) return 'tablet'
        return 'desktop'
      }

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isPWA,
        isStandalone,
        userAgent,
        screenSize: getScreenSize()
      })
    }

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
    detectMobile()
    handleOrientationChange()
    updateConnectionType()

    // Resize handler for screen size changes
    const handleResize = () => {
      setDetection(prev => ({
        ...prev,
        screenSize: (() => {
          const width = window.innerWidth
          if (width < 768) return 'mobile'
          if (width < 1024) return 'tablet'
          return 'desktop'
        })()
      }))
    }

    // Event listeners
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('resize', handleResize)
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
      window.removeEventListener('resize', handleResize)
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