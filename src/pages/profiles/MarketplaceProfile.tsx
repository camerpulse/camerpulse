import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const MarketplaceProfile: React.FC = () => {
  const { username, id } = useParams<{ username: string; id: string }>();
  
  return (
    <AppLayout>
      <UnifiedProfile 
        userId={id}
        username={username}
        isModal={false}
        defaultTab="marketplace"
      />
    </AppLayout>
  );
};

export default MarketplaceProfile;