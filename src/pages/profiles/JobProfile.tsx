import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const JobProfile: React.FC = () => {
  const { username, id } = useParams<{ username: string; id: string }>();
  
  return (
    <AppLayout>
      <UnifiedProfile 
        userId={id}
        username={username}
        isModal={false}
        defaultTab="professional"
      />
    </AppLayout>
  );
};

export default JobProfile;