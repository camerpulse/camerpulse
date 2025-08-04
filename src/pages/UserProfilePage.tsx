import React from 'react';
import { useParams } from 'react-router-dom';
import { SocialStyleProfile } from '@/components/Profile/SocialStyleProfile';
import { AppLayout } from '@/components/Layout/AppLayout';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground">Invalid user profile URL</p>
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