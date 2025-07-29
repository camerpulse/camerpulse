import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CeremonialEvent = Database['public']['Tables']['ceremonial_events']['Row'];

export const useCeremonialEvents = (villageId: string) => {
  const [events, setEvents] = useState<CeremonialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ceremonial_events')
        .select('*')
        .eq('village_id', villageId)
        .eq('is_public', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents((data as CeremonialEvent[]) || []);
    } catch (error) {
      console.error('Error fetching ceremonial events:', error);
      toast({
        title: "Error",
        description: "Failed to load ceremonial events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitEvent = async (eventData: Partial<CeremonialEvent>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit ceremonial events",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('ceremonial_events')
        .insert({
          ...eventData,
          village_id: villageId,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data as CeremonialEvent, ...prev]);
      toast({
        title: "Success",
        description: "Ceremonial event submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error submitting ceremonial event:', error);
      toast({
        title: "Error",
        description: "Failed to submit ceremonial event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CeremonialEvent>) => {
    try {
      const { data, error } = await supabase
        .from('ceremonial_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? data as CeremonialEvent : event
      ));

      toast({
        title: "Success",
        description: "Ceremonial event updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating ceremonial event:', error);
      toast({
        title: "Error",
        description: "Failed to update ceremonial event",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchEvents();
    }
  }, [villageId]);

  return {
    events,
    loading,
    submitEvent,
    updateEvent,
    refetch: fetchEvents,
  };
};