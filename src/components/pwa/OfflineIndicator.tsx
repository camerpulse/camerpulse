import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2 animate-fade-in">
        <WifiOff className="h-4 w-4" />
        You're offline
      </Badge>
    </div>
  );
};