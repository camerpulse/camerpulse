import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TraditionalEvent {
  id: string;
  village_id?: string;
  event_name: string;
  event_type: string;
  event_category: string;
  calendar_type: string;
  occurs_annually: boolean;
  start_date?: string;
  end_date?: string;
  duration_days: number;
  lunar_month?: number;
  lunar_day?: number;
  solar_month?: number;
  solar_day?: number;
  agricultural_season?: string;
  event_description: string;
  historical_significance?: string;
  traditional_practices: any[];
  required_preparations: any[];
  participant_roles: Record<string, any>;
  ceremonial_items: any[];
  traditional_foods: any[];
  songs_and_dances: any[];
  storytelling_elements: any[];
  dress_code?: string;
  location_details?: string;
  community_involvement_level: string;
  is_public_event: boolean;
  visitor_policy: string;
  economic_impact?: string;
  modern_adaptations?: string;
  challenges_faced?: string;
  preservation_status: string;
  next_occurrence?: string;
  organizer_contact?: string;
  photo_urls?: string[];
  video_urls?: string[];
  audio_recordings?: string[];
  is_unesco_recognized: boolean;
  related_events?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  village_id?: string;
  participation_type: string;
  role_description?: string;
  confirmed_attendance: boolean;
  attendance_year: number;
  contribution_type?: string;
  notes?: string;
  created_at: string;
}

// Get traditional calendar events
export const useTraditionalEvents = (villageId?: string, filters?: {
  event_type?: string;
  calendar_type?: string;
  upcoming_only?: boolean;
}) => {
  return useQuery({
    queryKey: ['traditional-events', villageId, filters],
    queryFn: async () => {
      let query = supabase
        .from('traditional_calendar_events')
        .select(`
          *,
          village:villages(village_name, region)
        `)
        .order('next_occurrence', { ascending: true });

      if (villageId) {
        query = query.eq('village_id', villageId);
      }

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters?.calendar_type) {
        query = query.eq('calendar_type', filters.calendar_type);
      }

      if (filters?.upcoming_only) {
        query = query.gte('next_occurrence', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Get upcoming events (next 30 days)
export const useUpcomingEvents = (villageId?: string) => {
  return useQuery({
    queryKey: ['upcoming-events', villageId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let query = supabase
        .from('traditional_calendar_events')
        .select(`
          *,
          village:villages(village_name, region)
        `)
        .gte('next_occurrence', today)
        .lte('next_occurrence', thirtyDaysFromNow)
        .eq('is_public_event', true)
        .order('next_occurrence', { ascending: true });

      if (villageId) {
        query = query.eq('village_id', villageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Get event participants
export const useEventParticipants = (eventId?: string) => {
  return useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('calendar_event_participants')
        .select(`
          *,
          village:villages(village_name, region)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

// Get user's event participations
export const useUserEventParticipations = () => {
  return useQuery({
    queryKey: ['user-event-participations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_event_participants')
        .select(`
          *,
          event:traditional_calendar_events(*),
          village:villages(village_name, region)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Create traditional event
export const useCreateTraditionalEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: Omit<TraditionalEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('traditional_calendar_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traditional-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      toast.success('Traditional event created successfully');
    },
    onError: (error) => {
      console.error('Error creating traditional event:', error);
      toast.error('Failed to create traditional event');
    },
  });
};

// Create event participation
export const useCreateEventParticipation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participationData: Omit<EventParticipant, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('calendar_event_participants')
        .insert(participationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participants'] });
      queryClient.invalidateQueries({ queryKey: ['user-event-participations'] });
      toast.success('Event participation registered successfully');
    },
    onError: (error) => {
      console.error('Error creating event participation:', error);
      toast.error('Failed to register for event');
    },
  });
};

// Get calendar insights for a village
export const useVillageCalendarInsights = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-calendar-insights', villageId],
    queryFn: async () => {
      if (!villageId) return null;

      const { data: events, error } = await supabase
        .from('traditional_calendar_events')
        .select('event_type, event_category, preservation_status, calendar_type')
        .eq('village_id', villageId);

      if (error) throw error;

      const insights = {
        totalEvents: events.length,
        byType: events.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCategory: events.reduce((acc, event) => {
          acc[event.event_category] = (acc[event.event_category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCalendarType: events.reduce((acc, event) => {
          acc[event.calendar_type] = (acc[event.calendar_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPreservationStatus: events.reduce((acc, event) => {
          acc[event.preservation_status] = (acc[event.preservation_status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return insights;
    },
    enabled: !!villageId,
  });
};