import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationCenterProps {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  setNotifications
}) => {

  // Background notification processing
  useEffect(() => {
    const processNotifications = async () => {
      try {
        // Process any pending notifications via Edge Function
        await supabase.functions.invoke('process-notification', {
          body: { action: 'process_pending' }
        });
      } catch (error) {
        console.error('Error processing notifications:', error);
      }
    };

    // Process notifications every 30 seconds
    const interval = setInterval(processNotifications, 30000);
    
    // Process immediately on mount
    processNotifications();

    return () => clearInterval(interval);
  }, []);

  // Background notification management - no visible UI
  return null;
};