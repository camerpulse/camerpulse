import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReadStatus {
  message_id: string;
  user_id: string;
  read_at: string;
  delivered_at: string;
}

export const useReadReceipts = (messageIds: string[]) => {
  const [readStatuses, setReadStatuses] = useState<Record<string, ReadStatus[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const markMessageRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase.rpc('mark_message_read', {
        p_message_id: messageId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const loadReadStatuses = useCallback(async () => {
    if (messageIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('message_read_status_enhanced')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;

      const statusMap = data.reduce((acc, status) => {
        if (!acc[status.message_id]) {
          acc[status.message_id] = [];
        }
        acc[status.message_id].push(status);
        return acc;
      }, {} as Record<string, ReadStatus[]>);

      setReadStatuses(statusMap);
    } catch (error) {
      console.error('Error loading read statuses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messageIds]);

  useEffect(() => {
    loadReadStatuses();

    if (messageIds.length === 0) return;

    // Subscribe to read status changes
    const channel = supabase
      .channel('read-receipts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_read_status_enhanced',
          filter: `message_id=in.(${messageIds.join(',')})`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const status = payload.new as ReadStatus;
            setReadStatuses(prev => ({
              ...prev,
              [status.message_id]: [
                ...(prev[status.message_id] || []).filter(s => s.user_id !== status.user_id),
                status
              ]
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds, loadReadStatuses]);

  const getMessageReadCount = useCallback((messageId: string): number => {
    return readStatuses[messageId]?.length || 0;
  }, [readStatuses]);

  const getMessageReadUsers = useCallback((messageId: string): string[] => {
    return readStatuses[messageId]?.map(status => status.user_id) || [];
  }, [readStatuses]);

  const isMessageReadBy = useCallback((messageId: string, userId: string): boolean => {
    return readStatuses[messageId]?.some(status => status.user_id === userId) || false;
  }, [readStatuses]);

  return {
    readStatuses,
    isLoading,
    markMessageRead,
    getMessageReadCount,
    getMessageReadUsers,
    isMessageReadBy
  };
};