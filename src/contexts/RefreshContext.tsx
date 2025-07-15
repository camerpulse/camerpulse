import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface RefreshConfig {
  sentiment_streams: number
  trend_radar: number
  election_alerts: number
  civic_warnings: number
  official_profiles: number
  party_statistics: number
  dashboard_widgets: number
  admin_metrics: number
}

export interface RefreshState {
  isActive: boolean
  lastRefresh: Record<string, Date>
  refreshCounts: Record<string, number>
  errors: Record<string, string | null>
}

interface RefreshContextType {
  config: RefreshConfig
  state: RefreshState
  updateConfig: (newConfig: Partial<RefreshConfig>) => void
  toggleAutoRefresh: () => void
  manualRefresh: (component: string) => void
  registerComponent: (component: string, refreshFn: () => Promise<void>) => void
  unregisterComponent: (component: string) => void
  getNextRefreshTime: (component: string) => Date | null
}

const defaultConfig: RefreshConfig = {
  sentiment_streams: 15000,     // 15 seconds
  trend_radar: 15000,          // 15 seconds
  election_alerts: 10000,      // 10 seconds
  civic_warnings: 10000,       // 10 seconds
  official_profiles: 21600000, // 6 hours
  party_statistics: 3600000,   // 1 hour
  dashboard_widgets: 30000,    // 30 seconds
  admin_metrics: 60000         // 60 seconds
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RefreshConfig>(defaultConfig)
  const [state, setState] = useState<RefreshState>({
    isActive: true,
    lastRefresh: {},
    refreshCounts: {},
    errors: {}
  })

  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({})
  const componentHandlers = useRef<Record<string, () => Promise<void>>>({})
  const isTabVisible = useRef(true)

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isTabVisible.current
      isTabVisible.current = !document.hidden
      
      if (!wasVisible && isTabVisible.current && state.isActive) {
        // Tab became visible again, restart all intervals
        restartAllIntervals()
      } else if (!isTabVisible.current) {
        // Tab hidden, pause sentiment and trend intervals only
        pauseTabSensitiveComponents()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isActive])

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('camerpulse-refresh-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse refresh config:', error)
      }
    }
  }, [])

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('camerpulse-refresh-config', JSON.stringify(config))
  }, [config])

  const logRefreshEvent = useCallback(async (component: string, success: boolean, error?: string) => {
    const now = new Date()
    
    setState(prev => ({
      ...prev,
      lastRefresh: { ...prev.lastRefresh, [component]: now },
      refreshCounts: { 
        ...prev.refreshCounts, 
        [component]: (prev.refreshCounts[component] || 0) + 1 
      },
      errors: { ...prev.errors, [component]: error || null }
    }))

    // Log to Supabase for admin monitoring
    try {
      await supabase.from('system_refresh_logs').insert({
        component_name: component,
        refresh_time: now.toISOString(),
        success,
        error_message: error || null,
        interval_ms: config[component as keyof RefreshConfig]
      })
    } catch (logError) {
      console.warn('Failed to log refresh event:', logError)
    }
  }, [config])

  const executeRefresh = useCallback(async (component: string) => {
    const handler = componentHandlers.current[component]
    if (!handler) return

    try {
      await handler()
      await logRefreshEvent(component, true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await logRefreshEvent(component, false, errorMessage)
      console.error(`Refresh failed for ${component}:`, error)
    }
  }, [logRefreshEvent])

  const startInterval = useCallback((component: string) => {
    const interval = config[component as keyof RefreshConfig]
    if (!interval || !state.isActive) return

    // Clear existing interval
    if (intervalRefs.current[component]) {
      clearInterval(intervalRefs.current[component])
    }

    // For tab-sensitive components, check visibility
    const isTabSensitive = ['sentiment_streams', 'trend_radar'].includes(component)
    if (isTabSensitive && !isTabVisible.current) return

    intervalRefs.current[component] = setInterval(() => {
      if (state.isActive && (isTabVisible.current || !isTabSensitive)) {
        executeRefresh(component)
      }
    }, interval)
  }, [config, state.isActive, executeRefresh])

  const pauseTabSensitiveComponents = useCallback(() => {
    const tabSensitive = ['sentiment_streams', 'trend_radar']
    tabSensitive.forEach(component => {
      if (intervalRefs.current[component]) {
        clearInterval(intervalRefs.current[component])
        delete intervalRefs.current[component]
      }
    })
  }, [])

  const restartAllIntervals = useCallback(() => {
    Object.keys(componentHandlers.current).forEach(component => {
      startInterval(component)
    })
  }, [startInterval])

  const updateConfig = useCallback((newConfig: Partial<RefreshConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      
      // Restart intervals for updated components
      Object.keys(newConfig).forEach(component => {
        if (componentHandlers.current[component]) {
          startInterval(component)
        }
      })
      
      return updated
    })
  }, [startInterval])

  const toggleAutoRefresh = useCallback(() => {
    setState(prev => {
      const newIsActive = !prev.isActive
      
      if (newIsActive) {
        // Restart all intervals
        restartAllIntervals()
      } else {
        // Clear all intervals
        Object.values(intervalRefs.current).forEach(clearInterval)
        intervalRefs.current = {}
      }
      
      return { ...prev, isActive: newIsActive }
    })
  }, [restartAllIntervals])

  const manualRefresh = useCallback(async (component: string) => {
    await executeRefresh(component)
  }, [executeRefresh])

  const registerComponent = useCallback((component: string, refreshFn: () => Promise<void>) => {
    componentHandlers.current[component] = refreshFn
    
    if (state.isActive) {
      startInterval(component)
    }
  }, [state.isActive, startInterval])

  const unregisterComponent = useCallback((component: string) => {
    // Clear interval
    if (intervalRefs.current[component]) {
      clearInterval(intervalRefs.current[component])
      delete intervalRefs.current[component]
    }
    
    // Remove handler
    delete componentHandlers.current[component]
  }, [])

  const getNextRefreshTime = useCallback((component: string): Date | null => {
    const lastRefresh = state.lastRefresh[component]
    const interval = config[component as keyof RefreshConfig]
    
    if (!lastRefresh || !interval) return null
    
    return new Date(lastRefresh.getTime() + interval)
  }, [state.lastRefresh, config])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval)
    }
  }, [])

  const contextValue: RefreshContextType = {
    config,
    state,
    updateConfig,
    toggleAutoRefresh,
    manualRefresh,
    registerComponent,
    unregisterComponent,
    getNextRefreshTime
  }

  return (
    <RefreshContext.Provider value={contextValue}>
      {children}
    </RefreshContext.Provider>
  )
}

export const useRefresh = () => {
  const context = useContext(RefreshContext)
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider')
  }
  return context
}