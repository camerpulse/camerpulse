import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Profile</h1>
          <p className="text-muted-foreground">Profile for user: {userId}</p>
          <p className="text-sm text-muted-foreground mt-4">Feature coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;