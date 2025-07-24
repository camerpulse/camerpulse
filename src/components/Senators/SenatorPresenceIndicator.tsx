import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SenatorPresenceIndicatorProps {
  senatorId: string;
}

interface UserPresence {
  user_id: string;
  online_at: string;
  viewing_senator: string;
}

export const SenatorPresenceIndicator: React.FC<SenatorPresenceIndicatorProps> = ({
  senatorId
}) => {
  const { user } = useAuth();
  const [viewerCount, setViewerCount] = useState(0);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!senatorId) return;

    const channelName = `senator-${senatorId}`;
    const presenceChannel = supabase.channel(channelName);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState<UserPresence>();
        const viewers = Object.values(newState).flat();
        setViewerCount(viewers.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          const userStatus: UserPresence = {
            user_id: user.id,
            online_at: new Date().toISOString(),
            viewing_senator: senatorId
          };

          await presenceChannel.track(userStatus);
        }
      });

    setChannel(presenceChannel);

    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, [senatorId, user]);

  // Track profile views in analytics
  useEffect(() => {
    if (!senatorId || !user) return;

    const trackView = async () => {
      try {
        // Insert view record for analytics
        await supabase
          .from('senator_analytics')
          .insert({
            senator_id: senatorId,
            metric_type: 'profile_views',
            metric_value: 1,
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            metadata: {
              user_id: user.id,
              timestamp: new Date().toISOString()
            }
          });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [senatorId, user]);

  if (viewerCount === 0) return null;

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Eye className="h-3 w-3" />
      <span>{viewerCount}</span>
      <span className="text-xs text-muted-foreground">
        {viewerCount === 1 ? 'viewer' : 'viewers'}
      </span>
    </Badge>
  );
};