import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  Smartphone,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Settings
} from 'lucide-react';

export const PushNotificationManager: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification
  } = usePushNotifications();

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Granted' };
      case 'denied':
        return { icon: XCircle, color: 'text-red-500', label: 'Denied' };
      default:
        return { icon: AlertTriangle, color: 'text-yellow-500', label: 'Not Set' };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Not Supported</h3>
            <p className="text-muted-foreground">
              Push notifications are not supported in this browser. 
              Try using Chrome, Firefox, or Safari on desktop/mobile.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Push Notifications
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <PermissionIcon className={`h-5 w-5 ${permissionStatus.color}`} />
            <div>
              <p className="font-medium">Browser Permission</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' 
                  ? 'You can receive push notifications'
                  : permission === 'denied' 
                  ? 'Push notifications are blocked'
                  : 'Permission not requested yet'
                }
              </p>
            </div>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : 'destructive'}>
            {permissionStatus.label}
          </Badge>
        </div>

        {/* Subscription Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <p className="font-medium">Subscription Status</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Subscribed to push notifications'
                  : 'Not subscribed to push notifications'
                }
              </p>
            </div>
          </div>
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </Badge>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {permission !== 'granted' && (
            <Button 
              onClick={requestPermission}
              className="w-full"
              disabled={loading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Request Permission
            </Button>
          )}

          {permission === 'granted' && !isSubscribed && (
            <Button 
              onClick={subscribe}
              className="w-full"
              disabled={loading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Subscribing...' : 'Enable Push Notifications'}
            </Button>
          )}

          {isSubscribed && (
            <div className="space-y-3">
              <Button 
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
              
              <Button 
                onClick={unsubscribe}
                variant="destructive"
                className="w-full"
                disabled={loading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                {loading ? 'Unsubscribing...' : 'Disable Push Notifications'}
              </Button>
            </div>
          )}
        </div>

        {/* Settings */}
        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Notification Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="urgent-notifications">Urgent Notifications</Label>
                <Switch id="urgent-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="promotional-notifications">Promotional</Label>
                <Switch id="promotional-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Sound</Label>
                <Switch id="sound-enabled" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration-enabled">Vibration</Label>
                <Switch id="vibration-enabled" defaultChecked />
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">💡 Push Notification Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Receive notifications even when the app is closed</li>
            <li>Instant delivery for urgent civic updates</li>
            <li>Works offline and syncs when reconnected</li>
            <li>Customizable notification preferences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};