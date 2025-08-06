import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_diaspora: boolean;
  location?: string;
  verified: boolean;
  email?: string;
  phone_number?: string;
  website_url?: string;
  profile_completion_score?: number;
  skills?: string[];
  interests?: string[];
  work_experience?: any;
  education?: any;
  social_links?: any;
  privacy_settings?: any;
  created_at?: string;
  updated_at?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  granted_at: string;
  expires_at?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  calculateProfileCompletion: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  }, []);

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      setUserRoles(data || []);
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setUserRoles([]);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await Promise.all([
        fetchUserProfile(user.id),
        fetchUserRoles(user.id)
      ]);
    }
  }, [user, fetchUserProfile, fetchUserRoles]);

  const hasRole = useCallback((role: string) => {
    return userRoles.some(userRole => 
      userRole.role === role && 
      (userRole.is_active !== false) &&
      (!userRole.expires_at || new Date(userRole.expires_at) > new Date())
    );
  }, [userRoles]);

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  const calculateProfileCompletion = useCallback(async () => {
    if (!user || !profile) return 0;

    // Simple client-side calculation for now
    let score = 0;
    
    if (profile.display_name) score += 10;
    if (profile.bio && profile.bio.length > 20) score += 10;
    if (profile.location) score += 5;
    if (profile.avatar_url) score += 15;
    if (profile.phone_number) score += 10;
    if (profile.website_url) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.interests && profile.interests.length > 0) score += 10;
    
    return score;
  }, [user, profile]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to avoid callback complications
          setTimeout(async () => {
            if (mounted) {
              await Promise.all([
                fetchUserProfile(session.user.id),
                fetchUserRoles(session.user.id)
              ]);
            }
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await Promise.all([
            fetchUserProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchUserRoles]);

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      return { data, error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Enhanced success handling
      if (data?.user && !error) {
        // Profile will be fetched automatically via onAuthStateChange
        console.log('User signed in successfully:', data.user.email);
      }

      return { data, error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setProfile(null);
        setUserRoles([]);
        setUser(null);
        setSession(null);
      }
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
        
        // Recalculate profile completion if relevant fields were updated
        if (updates.bio || updates.location || updates.avatar_url || 
            updates.phone_number || updates.website_url || 
            updates.skills || updates.interests || 
            updates.work_experience || updates.education) {
          setTimeout(() => calculateProfileCompletion(), 100);
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    userRoles,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    hasRole,
    isAdmin,
    calculateProfileCompletion
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};