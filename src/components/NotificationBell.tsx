import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing } from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';

export default function NotificationBell() {
  const { notifications, isConnected } = useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.length;
  const hasUrgent = notifications.some(n => 
    n.type === 'deadline_warning' || n.type === 'system_alert'
  );

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="relative"
        >
          {hasUrgent ? (
            <BellRing className="w-5 h-5 text-red-500" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant={hasUrgent ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {!isConnected && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </Button>
      </div>
      
      {showNotifications && <NotificationCenter />}
    </>
  );
}