import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorPresence, useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { 
  Circle, 
  User, 
  Clock, 
  Wifi, 
  WifiOff, 
  Coffee,
  Phone
} from 'lucide-react';

interface VendorStatusIndicatorProps {
  vendorId: string;
  vendorName: string;
  showControls?: boolean;
  compact?: boolean;
}

export const VendorStatusIndicator: React.FC<VendorStatusIndicatorProps> = ({ 
  vendorId, 
  vendorName, 
  showControls = false,
  compact = false 
}) => {
  const { status, setStatus, isOnline } = useVendorPresence(vendorId);
  const { vendorPresence } = useRealtimeUpdates();
  
  const presence = vendorPresence.get(vendorId);
  const currentStatus = presence?.status || status;
  const lastSeen = presence?.last_seen ? new Date(presence.last_seen) : null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          label: 'Online',
          icon: <Wifi className="h-3 w-3" />,
          badge: 'bg-green-500/10 text-green-700 dark:text-green-300'
        };
      case 'busy':
        return {
          color: 'bg-red-500',
          label: 'Busy',
          icon: <Phone className="h-3 w-3" />,
          badge: 'bg-red-500/10 text-red-700 dark:text-red-300'
        };
      case 'away':
        return {
          color: 'bg-yellow-500',
          label: 'Away',
          icon: <Coffee className="h-3 w-3" />,
          badge: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
        };
      case 'offline':
      default:
        return {
          color: 'bg-gray-500',
          label: 'Offline',
          icon: <WifiOff className="h-3 w-3" />,
          badge: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
        };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <User className="h-4 w-4" />
          <Circle 
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 ${statusConfig.color} border border-background`}
            fill="currentColor"
          />
        </div>
        <span className="text-sm font-medium">{vendorName}</span>
        <Badge variant="secondary" className={statusConfig.badge}>
          {statusConfig.label}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          Vendor Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              <div className={`w-3 h-3 rounded-full ${statusConfig.color} absolute top-0 left-0 animate-ping opacity-75`} />
            </div>
            <div>
              <p className="font-medium text-sm">{vendorName}</p>
              <div className="flex items-center gap-1">
                {statusConfig.icon}
                <span className="text-xs text-muted-foreground">
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
          
          <Badge variant="secondary" className={statusConfig.badge}>
            {statusConfig.label}
          </Badge>
        </div>

        {lastSeen && currentStatus !== 'online' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Last seen: {lastSeen.toLocaleString()}
            </span>
          </div>
        )}

        {!isOnline && (
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
            <WifiOff className="h-3 w-3" />
            <span>You are offline</span>
          </div>
        )}

        {showControls && isOnline && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Update Status:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={currentStatus === 'online' ? 'default' : 'outline'}
                onClick={() => setStatus('online')}
                className="text-xs"
              >
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Button>
              <Button
                size="sm"
                variant={currentStatus === 'busy' ? 'default' : 'outline'}
                onClick={() => setStatus('busy')}
                className="text-xs"
              >
                <Phone className="h-3 w-3 mr-1" />
                Busy
              </Button>
              <Button
                size="sm"
                variant={currentStatus === 'away' ? 'default' : 'outline'}
                onClick={() => setStatus('away')}
                className="text-xs"
              >
                <Coffee className="h-3 w-3 mr-1" />
                Away
              </Button>
              <Button
                size="sm"
                variant={currentStatus === 'offline' ? 'default' : 'outline'}
                onClick={() => setStatus('offline')}
                className="text-xs"
              >
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};