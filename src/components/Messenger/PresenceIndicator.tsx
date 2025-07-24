import React from 'react';
import { cn } from '@/lib/utils';
import { useUserPresence } from '@/hooks/useUserPresence';

interface PresenceIndicatorProps {
  userId: string;
  className?: string;
  showText?: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  className,
  showText = false
}) => {
  const { getUserPresence } = useUserPresence();
  const presence = getUserPresence(userId);

  if (!presence) {
    return showText ? <span className="text-muted-foreground text-xs">Offline</span> : null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getLastSeenText = () => {
    if (presence.status === 'online') return 'Online now';
    
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (showText) {
    return (
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          getStatusColor(presence.status),
          className
        )} />
        <span className="text-xs text-muted-foreground">
          {getLastSeenText()}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-3 h-3 rounded-full border-2 border-background",
        getStatusColor(presence.status),
        className
      )}
      title={`${getStatusText(presence.status)} - ${getLastSeenText()}`}
    />
  );
};