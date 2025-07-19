import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AdvancedUserProfile } from '@/components/camerpulse/AdvancedUserProfile';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">Invalid user profile URL</p>
        </div>
      </div>
    );
  }

  return <AdvancedUserProfile userId={userId} isModal={false} />;
};

export default UserProfilePage;