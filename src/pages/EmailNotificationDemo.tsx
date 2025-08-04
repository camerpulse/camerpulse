import React from 'react';
import { EmailNotificationSettings } from '@/components/Senators/Extended/EmailNotificationSettings';

export default function EmailNotificationDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Email Notification System</h1>
            <p className="text-xl text-muted-foreground">
              Configure and test email notifications for senator activities
            </p>
          </div>

          <EmailNotificationSettings />
        </div>
      </div>
    </div>
  );
}