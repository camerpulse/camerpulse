import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const UnifiedProfilePage: React.FC = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();

  return (
    <AppLayout>
      <UnifiedProfile 
        userId={userId || ''} 
        username={username}
        isModal={false} 
      />
    </AppLayout>
  );
};

export default UnifiedProfilePage;