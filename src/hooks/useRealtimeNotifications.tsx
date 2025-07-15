import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const showNotification = useCallback((title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title,
      description,
      variant,
      duration: 5000,
    });
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscriptions for various notification sources
    const messagesChannel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const message = payload.new;
          showNotification(
            'New Message',
            `You have a new message from ${message.sender_id}`,
            'default'
          );
        }
      )
      .subscribe();

    // Listen for civic alerts
    const alertsChannel = supabase
      .channel('civic-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camerpulse_intelligence_alerts'
        },
        (payload) => {
          const alert = payload.new;
          if (alert.severity === 'high' || alert.severity === 'critical') {
            showNotification(
              `🚨 ${alert.alert_type.toUpperCase()} Alert`,
              alert.title,
              alert.severity === 'critical' ? 'destructive' : 'default'
            );
          }
        }
      )
      .subscribe();

    // Listen for poll responses/updates if user is poll creator
    const pollsChannel = supabase
      .channel('poll-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_responses'
        },
        async (payload) => {
          const response = payload.new;
          // Check if user is the poll creator
          const { data: poll } = await supabase
            .from('polls')
            .select('creator_id, title')
            .eq('id', response.poll_id)
            .single();
          
          if (poll?.creator_id === user.id) {
            showNotification(
              'New Poll Vote',
              `Someone voted on your poll: ${poll.title}`,
              'default'
            );
          }
        }
      )
      .subscribe();

    // Listen for premium subscription updates
    const subscriptionChannel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.subscribed) {
            showNotification(
              '✨ Premium Activated',
              'Welcome to CamerPulse Premium! You now have access to all premium features.',
              'default'
            );
          } else if (payload.eventType === 'UPDATE') {
            const isSubscribed = payload.new.subscribed;
            showNotification(
              isSubscribed ? '✨ Premium Activated' : '📱 Premium Expired',
              isSubscribed ? 'Your premium subscription is now active!' : 'Your premium subscription has expired.',
              isSubscribed ? 'default' : 'destructive'
            );
          }
        }
      )
      .subscribe();

    // Listen for election/disinformation alerts
    const electionAlertsChannel = supabase
      .channel('election-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'election_disinformation_alerts'
        },
        (payload) => {
          const alert = payload.new;
          showNotification(
            '⚠️ Election Alert',
            `Disinformation detected: ${alert.disinformation_category}`,
            'destructive'
          );
        }
      )
      .subscribe();

    // Listen for fusion alerts (critical civic events)
    const fusionAlertsChannel = supabase
      .channel('fusion-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'civic_fusion_alerts'
        },
        (payload) => {
          const alert = payload.new;
          if (alert.alert_severity === 'high' || alert.alert_severity === 'critical') {
            showNotification(
              `🔥 ${alert.alert_type.toUpperCase()}`,
              alert.alert_title,
              alert.alert_severity === 'critical' ? 'destructive' : 'default'
            );
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(subscriptionChannel);
      supabase.removeChannel(electionAlertsChannel);
      supabase.removeChannel(fusionAlertsChannel);
    };
  }, [user, showNotification]);

  return null;
};