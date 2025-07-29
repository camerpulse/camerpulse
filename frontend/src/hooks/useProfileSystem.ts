import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProfileFilter {
  profileType?: string;
  verificationStatus?: string;
  region?: string;
  minInfluenceScore?: number;
  searchQuery?: string;
}

export interface ProfileListItem {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  profile_type: string;
  verification_status: string;
  civic_influence_score: number;
  region?: string;
  profession?: string;
  civic_tagline?: string;
  is_diaspora: boolean;
  last_active_at: string;
  followers_count?: number;
}

export const useProfileSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, hasMore: true });

  const fetchProfiles = async (filters: ProfileFilter = {}, reset = false) => {
    setLoading(true);
    
    try {
      const pageSize = 20;
      const from = reset ? 0 : pagination.page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          avatar_url,
          profile_type,
          verification_status,
          civic_influence_score,
          region,
          profession,
          civic_tagline,
          is_diaspora,
          last_active_at
        `)
        .eq('is_banned', false)
        .order('civic_influence_score', { ascending: false })
        .range(from, to);

      // Apply filters
      if (filters.profileType && filters.profileType !== 'all') {
        query = query.eq('profile_type', filters.profileType as any);
      }

      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        query = query.eq('verification_status', filters.verificationStatus as any);
      }

      if (filters.region && filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters.minInfluenceScore) {
        query = query.gte('civic_influence_score', filters.minInfluenceScore);
      }

      if (filters.searchQuery) {
        query = query.or(`username.ilike.%${filters.searchQuery}%,display_name.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get follower counts for each profile
      const profilesWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const { count } = await supabase
            .from('follows')
            .select('id', { count: 'exact' })
            .eq('following_id', profile.user_id);

          return { ...profile, followers_count: count || 0 };
        })
      );

      if (reset) {
        setProfiles(profilesWithCounts);
        setPagination({ page: 1, hasMore: profilesWithCounts.length === pageSize });
      } else {
        setProfiles(prev => [...prev, ...profilesWithCounts]);
        setPagination(prev => ({ 
          page: prev.page + 1, 
          hasMore: profilesWithCounts.length === pageSize 
        }));
      }

    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reportProfile = async (profileId: string, reportType: string, reason: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report profiles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profile_reports')
        .insert({
          reported_profile_id: profileId,
          reporter_user_id: user.id,
          report_type: reportType,
          report_reason: reason
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe"
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  const rateProfile = async (
    profileId: string, 
    ratingType: 'trust' | 'performance' | 'transparency' | 'responsiveness',
    ratingValue: number,
    comment?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate profiles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profile_ratings')
        .upsert({
          rated_profile_id: profileId,
          rater_user_id: user.id,
          rating_type: ratingType,
          rating_value: ratingValue,
          comment: comment || null
        });

      if (error) throw error;

      toast({
        title: "Rating submitted",
        description: "Your rating has been recorded"
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  const requestVerification = async (
    profileType: string,
    supportingDocuments: string[],
    notes?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to request verification",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('profile_verification_requests')
        .insert({
          profile_id: profile.id,
          requested_type: profileType as any,
          supporting_documents: supportingDocuments,
          verification_notes: notes || null
        });

      if (error) throw error;

      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted for review"
      });
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<ProfileListItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });

      // Refresh current user's profile in the list
      setProfiles(prev => 
        prev.map(p => p.user_id === user.id ? { ...p, ...updates } : p)
      );

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const calculateInfluenceScore = async (profileId: string) => {
    try {
      const { data: result, error } = await supabase
        .rpc('calculate_civic_influence_score', { p_profile_id: profileId });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error calculating influence score:', error);
      return 0;
    }
  };

  const addActivity = async (
    profileId: string,
    activityType: string,
    title: string,
    description?: string,
    activityData?: any,
    isPublic = true
  ) => {
    try {
      // Get profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', profileId)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { data: result, error } = await supabase
        .from('profile_activities')
        .insert({
          profile_id: profile.id,
          activity_type: activityType,
          activity_title: title,
          activity_description: description,
          activity_data: activityData || {},
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const loadMore = (filters: ProfileFilter = {}) => {
    if (!loading && pagination.hasMore) {
      fetchProfiles(filters, false);
    }
  };

  const refresh = (filters: ProfileFilter = {}) => {
    setPagination({ page: 0, hasMore: true });
    fetchProfiles(filters, true);
  };

  return {
    profiles,
    loading,
    pagination,
    fetchProfiles,
    loadMore,
    refresh,
    reportProfile,
    rateProfile,
    requestVerification,
    updateProfile,
    calculateInfluenceScore,
    addActivity
  };
};