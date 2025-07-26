import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { MessagingInterface } from '@/components/messaging/MessagingInterface';
import { PullToRefresh } from '@/components/interactive/PullToRefresh';

export default function Messages() {
  const handleRefresh = async () => {
    // Refresh messages and conversations
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <AppLayout>
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="h-[calc(100vh-80px)]"
      >
        <div className="container mx-auto px-4 py-6 h-full">
          <MessagingInterface />
        </div>
      </PullToRefresh>
    </AppLayout>
  );
}