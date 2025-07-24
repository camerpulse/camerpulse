import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SocialStyleProfile } from '@/components/Profile/SocialStyleProfile';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Loader2 } from 'lucide-react';

const ProfileSlugPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBySlug = async () => {
      if (!slug) return;

      try {
        // Remove @ if present
        const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('profile_slug', cleanSlug)
          .single();

        if (error) {
          console.error('Error fetching profile by slug:', error);
          setError('Profile not found');
          return;
        }

        setUserId(data.user_id);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBySlug();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !userId) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground">
              {error || 'The profile you\'re looking for doesn\'t exist.'}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SocialStyleProfile userId={userId} isModal={false} />
    </AppLayout>
  );
};

export default ProfileSlugPage;