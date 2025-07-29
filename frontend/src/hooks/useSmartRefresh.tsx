import { useEffect, useCallback, useState } from 'react'
import { useRefresh } from '@/contexts/RefreshContext'

interface UseSmartRefreshOptions {
  component: string
  refreshFn: () => Promise<void>
  enabled?: boolean
  immediate?: boolean
}

export const useSmartRefresh = ({
  component,
  refreshFn,
  enabled = true,
  immediate = true
}: UseSmartRefreshOptions) => {
  const { registerComponent, unregisterComponent, manualRefresh, state, getNextRefreshTime } = useRefresh()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const wrappedRefreshFn = useCallback(async () => {
    if (isRefreshing) return // Prevent overlapping refreshes
    
    setIsRefreshing(true)
    try {
      await refreshFn()
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshFn, isRefreshing])

  const manualTrigger = useCallback(async () => {
    await manualRefresh(component)
  }, [component, manualRefresh])

  useEffect(() => {
    if (enabled) {
      registerComponent(component, wrappedRefreshFn)
      
      // Immediate refresh if requested
      if (immediate && !state.lastRefresh[component]) {
        wrappedRefreshFn()
      }
    }

    return () => {
      if (enabled) {
        unregisterComponent(component)
      }
    }
  }, [enabled, component, wrappedRefreshFn, registerComponent, unregisterComponent, immediate, state.lastRefresh])

  return {
    isRefreshing,
    lastRefresh: state.lastRefresh[component] || null,
    refreshCount: state.refreshCounts[component] || 0,
    error: state.errors[component] || null,
    nextRefresh: getNextRefreshTime(component),
    manualRefresh: manualTrigger
  }
}