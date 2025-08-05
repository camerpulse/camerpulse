import React from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';
import { AppLayout } from '@/components/Layout/AppLayout';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <AppLayout>
      <UnifiedProfile userId={userId || ''} isModal={false} />
    </AppLayout>
  );
};

export default UserProfilePage;