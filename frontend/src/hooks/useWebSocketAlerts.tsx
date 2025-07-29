import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface WebSocketAlertOptions {
  onUrgentAlert?: (alert: any) => void
  onElectionUpdate?: (update: any) => void
  onCivicWarning?: (warning: any) => void
}

export const useWebSocketAlerts = ({
  onUrgentAlert,
  onElectionUpdate,
  onCivicWarning
}: WebSocketAlertOptions = {}) => {
  const channelRef = useRef<any>(null)

  const handleAlert = useCallback((payload: any) => {
    const { eventType, data } = payload
    
    switch (eventType) {
      case 'urgent_alert':
        onUrgentAlert?.(data)
        // Show browser notification for urgent alerts
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Urgent Alert', {
            body: data.message,
            icon: '/icon-192.png',
            badge: '/icon-192.png'
          })
        }
        break
      
      case 'election_update':
        onElectionUpdate?.(data)
        break
      
      case 'civic_warning':
        onCivicWarning?.(data)
        break
    }
  }, [onUrgentAlert, onElectionUpdate, onCivicWarning])

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Subscribe to real-time alerts channel
    channelRef.current = supabase
      .channel('civic-alerts')
      .on('broadcast', { event: 'urgent_alert' }, handleAlert)
      .on('broadcast', { event: 'election_update' }, handleAlert)
      .on('broadcast', { event: 'civic_warning' }, handleAlert)
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [handleAlert])

  const sendTestAlert = useCallback(async () => {
    await supabase.channel('civic-alerts').send({
      type: 'broadcast',
      event: 'urgent_alert',
      payload: {
        eventType: 'urgent_alert',
        data: {
          message: 'Test urgent alert from CamerPulse',
          severity: 'high',
          timestamp: new Date().toISOString()
        }
      }
    })
  }, [])

  return { sendTestAlert }
}