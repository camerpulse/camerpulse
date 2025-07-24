import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for user profiles
export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  location?: string;
  region?: string;
  country: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  website_url?: string;
  social_media_links: Record<string, string>;
  skills: string[];
  interests: string[];
  languages: string[];
  education: any[];
  work_experience: any[];
  achievements: any[];
  portfolio_items: any[];
  is_verified: boolean;
  verification_type?: string;
  verification_date?: string;
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_messages: boolean;
  allow_friend_requests: boolean;
  profile_completion_score: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileConnection {
  id: string;
  requester_id: string;
  receiver_id: string;
  connection_type: 'friend' | 'follow';
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<ProfileConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get user's profile
  const getUserProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Get profile by username
  const getProfileByUsername = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Error fetching profile by username:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching profile by username:', error);
      return null;
    }
  };

  // Create or update user profile
  const upsertUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profileData,
          user_id: user.id
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        toast.error('Failed to update profile');
        return { success: false, error: error.message };
      }

      setUserProfile(data as UserProfile);
      toast.success('Profile updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
      return { success: false, error: 'Update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Calculate and update profile completion score
  const updateProfileCompletionScore = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('calculate_profile_completion_score', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error calculating profile completion:', error);
        return;
      }

      return data;
    } catch (error) {
      console.error('Error calculating profile completion:', error);
    }
  };

  // Send connection request
  const sendConnectionRequest = async (
    receiverId: string, 
    connectionType: 'friend' | 'follow' = 'friend',
    message?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in to connect');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('profile_connections')
        .insert({
          requester_id: user.id,
          receiver_id: receiverId,
          connection_type: connectionType,
          message: message
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending connection request:', error);
        toast.error('Failed to send connection request');
        return { success: false, error: error.message };
      }

      toast.success('Connection request sent!');
      return { success: true, data };
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
      return { success: false, error: 'Request failed' };
    }
  };

  // Respond to connection request
  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    try {
      const { data, error } = await supabase
        .from('profile_connections')
        .update({ status })
        .eq('id', connectionId)
        .eq('receiver_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error responding to connection:', error);
        toast.error('Failed to respond to connection');
        return { success: false, error: error.message };
      }

      toast.success(`Connection ${status}!`);
      await getConnections(); // Refresh connections
      return { success: true, data };
    } catch (error) {
      console.error('Error responding to connection:', error);
      toast.error('Failed to respond to connection');
      return { success: false, error: 'Response failed' };
    }
  };

  // Get user connections
  const getConnections = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('profile_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }

      setConnections(data as ProfileConnection[] || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  };

  // Track profile view
  const trackProfileView = async (profileUserId: string) => {
    try {
      await supabase
        .from('profile_views')
        .insert({
          profile_user_id: profileUserId,
          viewer_user_id: user?.id || null,
          viewer_ip: null, // Would need to get from request
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  // Search profiles
  const searchProfiles = async (searchTerm: string, filters: any = {}) => {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('profile_visibility', 'public');

      if (searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      const { data, error } = await query
        .order('profile_completion_score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  };

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile as UserProfile);
        }
        await getConnections();
      }
    };

    loadUserProfile();
  }, [user]);

  return {
    userProfile,
    connections,
    loading,
    getUserProfile,
    getProfileByUsername,
    upsertUserProfile,
    updateProfileCompletionScore,
    sendConnectionRequest,
    respondToConnection,
    getConnections,
    trackProfileView,
    searchProfiles
  };
};