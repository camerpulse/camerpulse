import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

/**
 * Centralized authentication utilities for CamerPulse
 * Consolidates user access patterns across the application
 */
export class AuthService {
  /**
   * Get current authenticated user
   * @returns Promise<AuthUser | null>
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get current user ID
   * @returns Promise<string | null>
   */
  static async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Require authenticated user or throw error
   * @param errorMessage Custom error message
   * @returns Promise<AuthUser>
   */
  static async requireAuth(errorMessage = 'You must be logged in to perform this action'): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error(errorMessage);
    }
    return user;
  }

  /**
   * Check if user is authenticated
   * @returns Promise<boolean>
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Get user session
   * @returns Promise<Session | null>
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
}

import React from 'react';

/**
 * React hook for authentication state
 */
export function useAuth() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get initial session
    AuthService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    userId: user?.id || null,
  };
}