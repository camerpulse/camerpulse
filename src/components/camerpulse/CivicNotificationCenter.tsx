/**
 * CivicNotificationCenter Component
 * 
 * Advanced notification center with civic intelligence and real-time updates
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  User, 
  CheckCheck,
  Vote,
  AlertTriangle,
  TrendingUp,
  Shield,
  MapPin,
  Zap,
  Heart,
  Share2,
  FileText,
  Building2,
  X,
  Settings,
  Filter
} from 'lucide-react';
import { useCivicNotifications } from '@/hooks/useCivicNotifications';
import { CivicTag } from '@/components/camerpulse';
import { useNavigation } from '@/hooks/useNavigation';

export interface CivicNotification {
  id: string;
  type: 'message' | 'poll' | 'civic_alert' | 'follow' | 'mention' | 'election' | 'petition' | 'intelligence' | 'platform';
  title: string;
  content: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  metadata?: any;
  priority: 'info' | 'warning' | 'critical';
  region?: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

export const CivicNotificationCenter: React.FC = () => {
  const { navigateTo } = useNavigation();
  const {
    unreadCount, 
    notifications, 
    markAsRead, 
    markAllAsRead,
    dismissNotification,
    filterByType,
    filterByRegion 
  } = useCivicNotifications();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const getNotificationIcon = (notification: CivicNotification) => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-cm-green" />;
      case 'poll':
        return <Vote className="h-4 w-4 text-cm-yellow" />;
      case 'civic_alert':
        return <AlertTriangle className="h-4 w-4 text-cm-red" />;
      case 'follow':
        return <Users className="h-4 w-4 text-primary" />;
      case 'mention':
        return <User className="h-4 w-4 text-primary" />;
      case 'election':
        return <Building2 className="h-4 w-4 text-cm-red" />;
      case 'petition':
        return <FileText className="h-4 w-4 text-cm-yellow" />;
      case 'intelligence':
        return <Shield className="h-4 w-4 text-cm-red" />;
      case 'platform':
        return <Zap className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-cm-red bg-cm-red/5';
      case 'warning': return 'border-l-cm-yellow bg-cm-yellow/5';
      default: return 'border-l-primary/30 bg-background';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels = {
      message: 'Messages',
      poll: 'Polls', 
      civic_alert: 'Civic Alerts',
      follow: 'Follows',
      mention: 'Mentions',
      election: 'Elections',
      petition: 'Petitions',
      intelligence: 'Intelligence',
      platform: 'Platform'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter !== 'all' && notification.type !== activeFilter) return false;
    if (regionFilter !== 'all' && notification.region !== regionFilter) return false;
    return true;
  });

  const notificationTypes = [...new Set(notifications.map(n => n.type))];
  const regions = [...new Set(notifications.map(n => n.region).filter(Boolean))];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/10 relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-cm-red text-white border-0 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0 bg-background border-border">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg text-foreground">Civic Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs hover:bg-muted"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3 w-3 text-cm-green" />
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-border bg-muted/30">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="w-full h-8 bg-background">
              <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
              <TabsTrigger value="civic_alert" className="text-xs px-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="poll" className="text-xs px-2">
                <Vote className="w-3 h-3 mr-1" />
                Polls
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs px-2">
                <MessageCircle className="w-3 h-3 mr-1" />
                Messages
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {regions.length > 0 && (
            <div className="mt-2">
              <select 
                value={regionFilter} 
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full text-xs p-1 border rounded bg-background"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeFilter !== 'all' ? `No ${getNotificationTypeLabel(activeFilter).toLowerCase()} found` : 'New updates will appear here'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 border-l-2 transition-all hover:bg-accent/50 cursor-pointer relative group ${
                    !notification.is_read 
                      ? getPriorityColor(notification.priority)
                      : 'border-l-border bg-background'
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      navigateTo(notification.action_url);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {notification.sender_name && (
                        <p className="text-xs text-muted-foreground mb-1">
                          from {notification.sender_name}
                        </p>
                      )}
                      
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { 
                              addSuffix: true 
                            })}
                          </p>
                          
                          {notification.region && (
                            <CivicTag type="region" label={notification.region} size="sm" />
                          )}
                        </div>
                        
                        {notification.priority === 'critical' && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        {notification.priority === 'warning' && (
                          <Badge variant="outline" className="text-xs border-cm-yellow text-cm-yellow">
                            Warning
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rich Preview for specific types */}
                      {notification.type === 'poll' && notification.metadata?.poll_question && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <Vote className="h-3 w-3 inline mr-1" />
                          {notification.metadata.poll_question}
                        </div>
                      )}
                      
                      {notification.type === 'intelligence' && notification.metadata?.threat_level && (
                        <div className="mt-2 p-2 bg-cm-red/10 rounded text-xs border border-cm-red/20">
                          <Shield className="h-3 w-3 inline mr-1" />
                          Threat Level: {notification.metadata.threat_level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link to="/notification-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link to="/messenger">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messenger
              </Link>
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};