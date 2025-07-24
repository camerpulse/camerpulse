import React from 'react';
import { useParams } from 'react-router-dom';
import { IndustryGradeUserProfile } from '@/components/Profile/IndustryGradeUserProfile';
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
      <div className="py-8 px-4">
        <IndustryGradeUserProfile userId={userId} isModal={false} />
      </div>
    </AppLayout>
  );
};

export default UserProfilePage;