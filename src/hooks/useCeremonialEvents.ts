import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CeremonialEvent {
  id: string;
  village_id: string;
  user_id: string;
  ceremony_name: string;
  description?: string;
  ceremony_type: 'traditional' | 'religious' | 'seasonal' | 'lifecycle';
  event_date?: string;
  is_annual: boolean;
  lunar_calendar_based: boolean;
  duration_days: number;
  preparation_days: number;
  location?: string;
  required_materials: any[];
  ritual_steps: any[];
  participants_roles: any[];
  cultural_significance?: string;
  historical_notes?: string;
  modern_adaptations?: string;
  photos?: string[];
  videos?: string[];
  audio_recordings?: string[];
  is_public: boolean;
  is_sacred: boolean;
  access_restrictions?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendance_count: number;
  created_at: string;
  updated_at: string;
}

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
        })
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