import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileRecommendations } from '@/components/profile/ProfileRecommendations';
import { useAuth } from '@/contexts/AuthContext';

export const PeopleToFollowSidebar = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  return (
    <div className="w-80 space-y-6">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">People to Follow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProfileRecommendations
            userId={user.id}
            profileType="normal_user"
            region="Centre"
            profession="User"
            limit={5}
          />
        </CardContent>
      </Card>
    </div>
  );
};