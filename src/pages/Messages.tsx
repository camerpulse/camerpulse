import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { MessagingInterface } from '@/components/messaging/MessagingInterface';

export default function Messages() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <MessagingInterface />
      </div>
    </AppLayout>
  );
}