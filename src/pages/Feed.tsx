import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { PullToRefresh } from '@/components/interactive/PullToRefresh';

export default function Feed() {
  const handleRefresh = async () => {
    // Refresh will be handled by PersonalizedFeed component
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <AppLayout>
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="min-h-screen"
      >
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <PersonalizedFeed 
            className="space-y-6"
            showPreferences={true}
          />
        </div>
      </PullToRefresh>
    </AppLayout>
  );
}