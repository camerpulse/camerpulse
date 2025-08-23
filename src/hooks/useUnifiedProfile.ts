import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UnifiedProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  location?: string;
  website_url?: string;
  email?: string;
  phone_number?: string;
  is_diaspora: boolean;
  verified: boolean;
  verification_status?: string;
  profile_type?: string;
  profile_visibility: 'public' | 'followers' | 'private';
  civic_influence_score?: number;
  profile_completion_score?: number;
  created_at: string;
  updated_at: string;
  skills?: string[];
  interests?: string[];
  work_experience?: any[];
  education?: any[];
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  slug?: string;
}

export interface MusicProfile {
  id: string;
  user_id: string;
  stage_name: string;
  genres?: string[];
  bio?: string;
  spotify_url?: string;
  apple_music_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

export interface JobProfile {
  id: string;
  user_id: string;
  job_title?: string;
  company?: string;
  industry?: string;
  experience_level?: string;
  skills?: string[];
  looking_for_job: boolean;
  open_to_remote: boolean;
  salary_expectation?: number;
  created_at: string;
  updated_at: string;
}

export interface HealthcareProfile {
  id: string;
  user_id: string;
  specialization?: string;
  license_number?: string;
  institution?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  available_for_consultation: boolean;
  created_at: string;
  updated_at: string;
}

export interface VillageMembership {
  id: string;
  user_id: string;
  village_name: string;
  region?: string;
  role: string;
  joined_at: string;
  is_active: boolean;
}

export const useUnifiedProfile = (userId?: string, username?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [musicProfile, setMusicProfile] = useState<MusicProfile | null>(null);
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [healthcareProfile, setHealthcareProfile] = useState<HealthcareProfile | null>(null);
  const [villageMemberships, setVillageMemberships] = useState<VillageMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId && !username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('profiles').select('*');
      
      if (username) {
        query = query.eq('username', username);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: profileData, error: profileError } = await query.maybeSingle();
      
      if (profileError) throw profileError;
      if (!profileData) {
        setError('Profile not found');
        return;
      }
      
      setProfile(profileData);
      
      // Fetch module-specific profiles
      const targetUserId = profileData.user_id;
      
      const [
        { data: music },
        { data: job },
        { data: healthcare },
        { data: villages }
      ] = await Promise.all([
        supabase.from('music_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
        supabase.from('job_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
        supabase.from('healthcare_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
        supabase.from('village_memberships').select('*').eq('user_id', targetUserId)
      ]);
      
      setMusicProfile(music);
      setJobProfile(job);
      setHealthcareProfile(healthcare);
      setVillageMemberships(villages || []);
      
      // Check if current user is following this profile
      if (user && user.id !== targetUserId) {
        const { data: followData } = await supabase
          .from('profile_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();
        
        setIsFollowing(!!followData);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [userId, username, user]);

  const updateProfile = useCallback(async (updates: Partial<UnifiedProfile>) => {
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Refresh profile data
    await fetchProfile();
  }, [user, fetchProfile]);

  const followUser = useCallback(async () => {
    if (!user || !profile) throw new Error('Missing required data');
    
    const { error } = await supabase
      .from('profile_follows')
      .insert({
        follower_id: user.id,
        following_id: profile.user_id
      });
    
    if (error) throw error;
    setIsFollowing(true);
  }, [user, profile]);

  const unfollowUser = useCallback(async () => {
    if (!user || !profile) throw new Error('Missing required data');
    
    const { error } = await supabase
      .from('profile_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', profile.user_id);
    
    if (error) throw error;
    setIsFollowing(false);
  }, [user, profile]);

  return {
    profile,
    musicProfile,
    jobProfile,
    healthcareProfile,
    villageMemberships,
    loading,
    error,
    isFollowing,
    fetchProfile,
    updateProfile,
    followUser,
    unfollowUser
  };
};