import React from 'react';
import { UnifiedNotificationCenter } from '@/components/notifications/UnifiedNotificationCenter';

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Center</h1>
        <p className="text-muted-foreground">
          Unified notification management for the platform
        </p>
      </div>

      <UnifiedNotificationCenter isAdminView={true} />
    </div>
  );
}