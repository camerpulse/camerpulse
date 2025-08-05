import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UnifiedProfile } from '@/components/Profile/UnifiedProfile';

const UnifiedProfilePage: React.FC = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  
  // Check if the parameter is a UUID (for /u/:userId) or username (for /profile/:username)
  const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const isUsernameParam = username && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

  return (
    <AppLayout>
      <UnifiedProfile 
        userId={isUUID ? userId : undefined}
        username={isUsernameParam ? username : (!isUUID && userId ? userId : undefined)}
        isModal={false} 
      />
    </AppLayout>
  );
};

export default UnifiedProfilePage;