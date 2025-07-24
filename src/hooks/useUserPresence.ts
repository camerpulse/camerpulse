import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  device_info: Record<string, any>;
}

export const useUserPresence = () => {
  const [userPresences, setUserPresences] = useState<Record<string, UserPresence>>({});
  const [isLoading, setIsLoading] = useState(true);

  const updatePresence = useCallback(async (status: UserPresence['status']) => {
    try {
      const { error } = await supabase.rpc('update_user_presence', {
        p_status: status,
        p_device_info: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, []);

  const loadPresences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*');

      if (error) throw error;

      const presenceMap = data.reduce((acc, presence) => {
        acc[presence.user_id] = presence;
        return acc;
      }, {} as Record<string, UserPresence>);

      setUserPresences(presenceMap);
    } catch (error) {
      console.error('Error loading presences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPresences();

    // Set user as online when component mounts
    updatePresence('online');

    // Subscribe to presence changes
    const channel = supabase
      .channel('user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          if (presence) {
            setUserPresences(prev => ({
              ...prev,
              [presence.user_id]: presence
            }));
          }

          if (payload.eventType === 'DELETE' && payload.old) {
            setUserPresences(prev => {
              const newPresences = { ...prev };
              delete newPresences[(payload.old as UserPresence).user_id];
              return newPresences;
            });
          }
        }
      )
      .subscribe();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence('offline');
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updatePresence, loadPresences]);

  const getUserPresence = useCallback((userId: string): UserPresence | null => {
    return userPresences[userId] || null;
  }, [userPresences]);

  const getOnlineUsers = useCallback((): string[] => {
    return Object.values(userPresences)
      .filter(presence => presence.status === 'online')
      .map(presence => presence.user_id);
  }, [userPresences]);

  return {
    userPresences,
    isLoading,
    updatePresence,
    getUserPresence,
    getOnlineUsers
  };
};