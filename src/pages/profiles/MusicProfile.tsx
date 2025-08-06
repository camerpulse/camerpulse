import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

/**
 * Music Artist Profile Page - Uses Unified Profile System
 * Integrates with best practices for data fetching and error handling
 */
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