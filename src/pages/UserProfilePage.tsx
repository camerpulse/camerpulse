import React from 'react';
import { useParams } from 'react-router-dom';
import { SocialStyleProfile } from '@/components/Profile/SocialStyleProfile';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useSlugResolver } from '@/hooks/useSlugResolver';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  
  // Use slug resolver for user profiles
  const { entity: profile, loading, error } = useSlugResolver({
    table: 'profiles',
    idColumn: 'user_id'
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!userId || error) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground">{error || 'Invalid user profile URL'}</p>
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

export default UserProfilePage;