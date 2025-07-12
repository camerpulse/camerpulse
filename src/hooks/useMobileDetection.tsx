import { useState, useEffect } from 'react'

interface MobileDetectionResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  isStandalone: boolean
  userAgent: string
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>({
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

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS
    const isTablet = /iPad/.test(userAgent) || (isAndroid && !/Mobile/.test(userAgent))
    const isDesktop = !isMobile && !isTablet

    // PWA detection
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://')

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Screen size detection
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

    // Listen for resize events
    const handleResize = () => {
      setDetection(prev => ({
        ...prev,
        screenSize: getScreenSize()
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return detection
}