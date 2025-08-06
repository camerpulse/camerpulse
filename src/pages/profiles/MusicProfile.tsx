import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const MusicProfile: React.FC = () => {
  const { artistSlug, id } = useParams<{ artistSlug: string; id: string }>();
  
  return (
    <AppLayout>
      <UnifiedProfile 
        userId={id}
        isModal={false}
        defaultTab="music"
      />
    </AppLayout>
  );
};

export default MusicProfile;