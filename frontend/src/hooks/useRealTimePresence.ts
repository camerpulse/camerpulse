import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'away' | 'offline';
  last_seen?: string;
}

export const useRealTimePresence = (userId?: string) => {
  const { user } = useAuth();
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('presence_tracker', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(userId => ({
          user_id: userId,
          online_at: new Date().toISOString(),
          status: 'online' as const,
          ...state[userId][0]
        }));
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            status: 'online',
          });
        }
      });

    // Track specific user presence if userId provided
    if (userId) {
      const userChannel = supabase.channel(`user_${userId}_presence`);
      userChannel.subscribe();
    }

    return () => {
      channel.unsubscribe();
    };
  }, [user, userId]);

  const updateStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;

    try {
      const channel = supabase.channel('presence_tracker');
      await channel.track({
        user_id: user.id,
        status,
        online_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const getUserPresence = (targetUserId: string): UserPresence | null => {
    return onlineUsers.find(u => u.user_id === targetUserId) || null;
  };

  return {
    presence,
    onlineUsers,
    updateStatus,
    getUserPresence,
    isOnline: (targetUserId: string) => 
      onlineUsers.some(u => u.user_id === targetUserId && u.status === 'online')
  };
};