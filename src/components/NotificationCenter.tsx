import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  Filter, 
  Settings,
  Gavel,
  AlertTriangle,
  Award,
  Clock,
  FileText
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, clearNotifications, markAsRead, isConnected } = useRealtime();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'bids' | 'tenders'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
  // Notification settings
  const [settings, setSettings] = useState({
    enableBrowserNotifications: true,
    enableBidAlerts: true,
    enableDeadlineWarnings: true,
    enableTenderUpdates: true,
    enableSystemAlerts: true,
    soundEnabled: true,
    quietHours: false
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_submitted':
        return <Gavel className="w-4 h-4 text-blue-600" />;
      case 'deadline_warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'award_announced':
        return <Award className="w-4 h-4 text-yellow-600" />;
      case 'tender_updated':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'system_alert':
        return <Bell className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationTitle = (notification: any) => {
    switch (notification.type) {
      case 'bid_submitted':
        return 'New Bid Submitted';
      case 'deadline_warning':
        return 'Deadline Warning';
      case 'award_announced':
        return 'Award Announced';
      case 'tender_updated':
        return 'Tender Updated';
      case 'system_alert':
        return 'System Alert';
      default:
        return 'Notification';
    }
  };

  const getNotificationDescription = (notification: any) => {
    switch (notification.type) {
      case 'bid_submitted':
        return `${notification.data.bidderName} submitted a bid of ${notification.data.bidAmount} ${notification.data.currency}`;
      case 'deadline_warning':
        return notification.data.message;
      case 'award_announced':
        return `Contract awarded to ${notification.data.winnerName}`;
      case 'tender_updated':
        return `Status updated to: ${notification.data.status}`;
      case 'system_alert':
        return notification.data.message;
      default:
        return 'You have a new notification';
    }
  };

  const getPriorityLevel = (notification: any) => {
    switch (notification.type) {
      case 'deadline_warning':
        return notification.data.hoursRemaining <= 2 ? 'urgent' : 'warning';
      case 'system_alert':
        return 'urgent';
      case 'award_announced':
        return 'high';
      default:
        return 'normal';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return ['urgent', 'high'].includes(getPriorityLevel(notification));
    if (filter === 'bids') return notification.type === 'bid_submitted';
    if (filter === 'tenders') return ['tender_updated', 'deadline_warning', 'award_announced'].includes(notification.type);
    return true;
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle browser notification permission
    if (key === 'enableBrowserNotifications' && value) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end">
      <Card className="w-full max-w-md h-full m-0 rounded-none border-l shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Notifications</CardTitle>
              <Badge variant="secondary">{notifications.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {isConnected ? 'Live updates active' : 'Disconnected'}
              </span>
            </div>
            
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>

        {showSettings ? (
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Notification Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  <Switch
                    id="browser-notifications"
                    checked={settings.enableBrowserNotifications}
                    onCheckedChange={(value) => handleSettingChange('enableBrowserNotifications', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="bid-alerts">Bid Alerts</Label>
                  <Switch
                    id="bid-alerts"
                    checked={settings.enableBidAlerts}
                    onCheckedChange={(value) => handleSettingChange('enableBidAlerts', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="deadline-warnings">Deadline Warnings</Label>
                  <Switch
                    id="deadline-warnings"
                    checked={settings.enableDeadlineWarnings}
                    onCheckedChange={(value) => handleSettingChange('enableDeadlineWarnings', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="tender-updates">Tender Updates</Label>
                  <Switch
                    id="tender-updates"
                    checked={settings.enableTenderUpdates}
                    onCheckedChange={(value) => handleSettingChange('enableTenderUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-alerts">System Alerts</Label>
                  <Switch
                    id="system-alerts"
                    checked={settings.enableSystemAlerts}
                    onCheckedChange={(value) => handleSettingChange('enableSystemAlerts', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Sound Notifications</Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(value) => handleSettingChange('soundEnabled', value)}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSettings(false)}
              >
                Done
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Filter Buttons */}
            <div className="p-4 border-b">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'urgent', label: 'Urgent' },
                  { key: 'bids', label: 'Bids' },
                  { key: 'tenders', label: 'Tenders' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="flex-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotifications.map((notification, index) => {
                    const priority = getPriorityLevel(notification);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-colors ${
                          priority === 'urgent' 
                            ? 'border-red-200 bg-red-50' 
                            : priority === 'high'
                            ? 'border-orange-200 bg-orange-50'
                            : priority === 'warning'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm">
                                  {getNotificationTitle(notification)}
                                </p>
                                {priority === 'urgent' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {getNotificationDescription(notification)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </Card>
    </div>
  );
}