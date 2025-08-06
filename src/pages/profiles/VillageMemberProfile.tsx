import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const VillageMemberProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  
  return (
    <AppLayout>
      <UnifiedProfile 
        username={username}
        isModal={false}
        defaultTab="overview"
      />
    </AppLayout>
  );
};

export default VillageMemberProfile;