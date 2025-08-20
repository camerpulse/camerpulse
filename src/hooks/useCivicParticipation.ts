import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Petitions
export function usePetitions(filters?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ['petitions', filters],
    queryFn: async () => {
      let query = supabase
        .from('petitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreatePetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petition: {
      title: string;
      description: string;
      target_institution: string;
      category: string;
      location?: string;
      region?: string;
      goal_signatures?: number;
      deadline?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create a petition');

      // Map only allowed columns and normalize location/region
      const {
        title,
        description,
        target_institution,
        category,
        deadline,
        goal_signatures,
        location,
        region,
      } = petition as any;

      const insertPayload: any = {
        title,
        description,
        target_institution,
        category,
        location: location ?? region ?? null,
        goal_signatures: goal_signatures ?? 100,
        deadline: deadline || null,
        creator_id: user.id,
        status: 'active',
        current_signatures: 0,
      };

      console.time?.('createPetition');
      const { data, error } = await supabase
        .from('petitions')
        .insert([insertPayload])
        .select()
        .single();
      console.timeEnd?.('createPetition');

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to create petition');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast.success('Petition created successfully!');
    },
    onError: (error: any) => {
      console.error('Create petition error:', error);
      toast.error(error?.message || 'Failed to create petition. Please try again.');
    }
  });
}

export function useSignPetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signatureData: {
      petition_id: string;
      full_name: string;
      email?: string;
      comment?: string;
      is_anonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to sign a petition');

      const { data, error } = await supabase
        .from('petition_signatures')
        .insert([{ ...signatureData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      queryClient.invalidateQueries({ queryKey: ['petition-signatures'] });
      toast.success('Thank you for signing this petition!');
    },
    onError: () => {
      toast.error('Failed to sign petition. Please try again.');
    }
  });
}

// Forums
export function useForumCategories() {
  return useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    }
  });
}

export function useForumTopics(categoryId?: string) {
  return useQuery({
    queryKey: ['forum-topics', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('forum_topics')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateForumTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: {
      category_id: string;
      title: string;
      content: string;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create a topic');

      const { data, error } = await supabase
        .from('forum_topics')
        .insert([{ ...topic, creator_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success('Your topic has been posted successfully.');
    },
    onError: () => {
      toast.error('Failed to create topic. Please try again.');
    }
  });
}

// Community Events
export function useCommunityEvents(filters?: { status?: string; event_type?: string }) {
  return useQuery({
    queryKey: ['community-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('community_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      title: string;
      description: string;
      event_type: string;
      location: string;
      address?: string;
      start_time: string;
      end_time: string;
      max_attendees?: number;
      registration_required?: boolean;
      contact_email?: string;
      contact_phone?: string;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create an event');

      const { data, error } = await supabase
        .from('community_events')
        .insert([{ ...event, organizer_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast.success('Your event has been created successfully.');
    },
    onError: () => {
      toast.error('Failed to create event. Please try again.');
    }
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to register for events');

      const { data, error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast.success('You have successfully registered for this event.');
    },
    onError: () => {
      toast.error('Failed to register for event. Please try again.');
    }
  });
}

// Volunteer Opportunities
export function useVolunteerOpportunities(filters?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: ['volunteer-opportunities', filters],
    queryFn: async () => {
      let query = supabase
        .from('volunteer_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateVolunteerOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunity: {
      title: string;
      description: string;
      organization: string;
      category: string;
      skills_required?: string[];
      time_commitment: string;
      location: string;
      contact_email: string;
      contact_phone?: string;
      spots_available?: number;
      start_date?: string;
      end_date?: string;
      is_recurring?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .insert([opportunity])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-opportunities'] });
      toast.success('Your volunteer opportunity has been posted.');
    },
    onError: () => {
      toast.error('Failed to create opportunity. Please try again.');
    }
  });
}

export function useApplyForVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: {
      opportunity_id: string;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to apply');

      const { data, error } = await supabase
        .from('volunteer_applications')
        .insert([{ ...application, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-opportunities'] });
      toast.success('Your volunteer application has been submitted.');
    },
    onError: () => {
      toast.error('Failed to submit application. Please try again.');
    }
  });
}