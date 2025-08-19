/**
 * CamerPulse API Service
 * Centralized API communication layer with error handling and type safety
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  PoliticalEntity, 
  Job, 
  Village, 
  Event, 
  Poll, 
  ApiResponse, 
  PaginatedResponse,
  SearchFilters 
} from '@/types';

// === API CLIENT CONFIGURATION ===
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://camerpulse.com/api' 
      : 'http://localhost:3000/api';
  }

  /**
   * Generic request handler with error management
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null, success: true };
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      };
    }
  }

  // === AUTHENTICATION ===
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error?.message || null, success: !error };
  }

  async register(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error: error?.message || null, success: !error };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    return { data: null, error: error?.message || null, success: !error };
  }

  // === POLITICAL ENTITIES ===
  async getPoliticians(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<PoliticalEntity>>> {
    const query = supabase
      .from('politicians')
      .select('*', { count: 'exact' });

    if (filters?.region) {
      query.eq('region', filters.region);
    }

    if (filters?.query) {
      query.ilike('name', `%${filters.query}%`);
    }

    const { data, error, count } = await query.range(0, 19);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return {
      data: {
        data: data || [],
        total: count || 0,
        page: 1,
        limit: 20,
        totalPages: Math.ceil((count || 0) / 20),
      },
      error: null,
      success: true,
    };
  }

  async getPolitician(id: string): Promise<ApiResponse<PoliticalEntity>> {
    const { data, error } = await supabase
      .from('politicians')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  async getSenators(filters?: SearchFilters) {
    const query = supabase.from('senators').select('*');
    
    if (filters?.region) {
      query.eq('region', filters.region);
    }

    const { data, error } = await query;
    return { data, error: error?.message || null, success: !error };
  }

  async getMPs(filters?: SearchFilters) {
    const query = supabase.from('mps').select('*');
    
    if (filters?.region) {
      query.eq('region', filters.region);
    }

    const { data, error } = await query;
    return { data, error: error?.message || null, success: !error };
  }

  async getMinisters(filters?: SearchFilters) {
    const query = supabase.from('ministers').select('*');
    
    if (filters?.region) {
      query.eq('region', filters.region);
    }

    const { data, error } = await query;
    return { data, error: error?.message || null, success: !error };
  }

  // === JOBS ===
  async getJobs(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'open');

    if (filters?.region) {
      query.eq('region', filters.region);
    }

    if (filters?.query) {
      query.or(`title.ilike.%${filters.query}%,company_name.ilike.%${filters.query}%`);
    }

    const { data, error, count } = await query.range(0, 19);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return {
      data: {
        data: data || [],
        total: count || 0,
        page: 1,
        limit: 20,
        totalPages: Math.ceil((count || 0) / 20),
      },
      error: null,
      success: true,
    };
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  async applyToJob(jobId: string, applicationData: any) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        ...applicationData,
      });

    return { data, error: error?.message || null, success: !error };
  }

  // === VILLAGES ===
  async getVillages(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Village>>> {
    const query = supabase
      .from('villages')
      .select('*', { count: 'exact' });

    if (filters?.region) {
      query.eq('region', filters.region);
    }

    if (filters?.query) {
      query.ilike('village_name', `%${filters.query}%`);
    }

    const { data, error, count } = await query.range(0, 19);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return {
      data: {
        data: data || [],
        total: count || 0,
        page: 1,
        limit: 20,
        totalPages: Math.ceil((count || 0) / 20),
      },
      error: null,
      success: true,
    };
  }

  async getVillage(id: string): Promise<ApiResponse<Village>> {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  // === EVENTS ===
  async getEvents(filters?: SearchFilters): Promise<ApiResponse<Event[]>> {
    const query = supabase
      .from('events')
      .select('*')
      .eq('status', 'approved');

    if (filters?.region) {
      query.eq('region', filters.region);
    }

    const { data, error } = await query;
    return { data: data || [], error: error?.message || null, success: !error };
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  // === POLLS ===
  async getPolls(filters?: SearchFilters): Promise<ApiResponse<Poll[]>> {
    const query = supabase
      .from('polls')
      .select('*')
      .eq('status', 'active');

    if (filters?.region) {
      query.eq('region', filters.region);
    }

    const { data, error } = await query;
    return { data: data || [], error: error?.message || null, success: !error };
  }

  async getPoll(id: string): Promise<ApiResponse<Poll>> {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  async submitVote(pollId: string, optionId: string) {
    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
      });

    return { data, error: error?.message || null, success: !error };
  }

  // === MESSAGING ===
  async getConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          user_id,
          profiles(display_name, avatar_url)
        )
      `)
      .order('last_message_at', { ascending: false });

    return { data, error: error?.message || null, success: !error };
  }

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return { data, error: error?.message || null, success: !error };
  }

  async sendMessage(conversationId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
      });

    return { data, error: error?.message || null, success: !error };
  }

  // === USER PROFILE ===
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated', success: false };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  async updateProfile(profileData: Partial<any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated', success: false };

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data, error: error?.message || null, success: !error };
  }

  // === FILE UPLOAD ===
  async uploadFile(file: File, bucket: string = 'public'): Promise<ApiResponse<string>> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { data: publicUrl, error: null, success: true };
  }

  // === ANALYTICS ===
  async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      // Track user interaction for analytics
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties,
          timestamp: new Date().toISOString(),
        });

      return { data: null, error: error?.message || null, success: !error };
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      return { data: null, error: 'Analytics tracking failed', success: false };
    }
  }

  // === SEARCH ===
  async globalSearch(query: string, filters?: SearchFilters) {
    const results = {
      politicians: [],
      jobs: [],
      villages: [],
      events: [],
    };

    try {
      // Search politicians
      const { data: politicians } = await supabase
        .from('politicians')
        .select('*')
        .or(`name.ilike.%${query}%,party.ilike.%${query}%,region.ilike.%${query}%`)
        .limit(5);

      // Search jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .or(`title.ilike.%${query}%,company_name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'open')
        .limit(5);

      // Search villages
      const { data: villages } = await supabase
        .from('villages')
        .select('*')
        .or(`village_name.ilike.%${query}%,region.ilike.%${query}%`)
        .limit(5);

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'approved')
        .limit(5);

      return {
        data: {
          politicians: politicians || [],
          jobs: jobs || [],
          villages: villages || [],
          events: events || [],
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: results,
        error: error instanceof Error ? error.message : 'Search failed',
        success: false,
      };
    }
  }

  // === NOTIFICATIONS ===
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error: error?.message || null, success: !error };
  }

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return { data, error: error?.message || null, success: !error };
  }

  // === REALTIME SUBSCRIPTIONS ===
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;