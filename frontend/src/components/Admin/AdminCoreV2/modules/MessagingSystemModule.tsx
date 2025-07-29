import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { MessageSquare, Users, Send, Eye, Settings, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface MessagingSystemModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const MessagingSystemModule: React.FC<MessagingSystemModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const messagingStats = {
    totalMessages: stats?.total_messages || 15678,
    activeConversations: stats?.active_conversations || 234,
    onlineUsers: stats?.online_users || 89,
    flaggedMessages: stats?.flagged_messages || 12
  };

  const recentConversations = [
    { 
      id: 1, 
      participants: ['John Doe', 'Jane Smith'], 
      lastMessage: 'Thanks for the community update...', 
      timestamp: '2 min ago',
      status: 'active',
      unread: 3
    },
    { 
      id: 2, 
      participants: ['Community Group'], 
      lastMessage: 'Meeting scheduled for tomorrow...', 
      timestamp: '15 min ago',
      status: 'active',
      unread: 0
    },
    { 
      id: 3, 
      participants: ['Mike Johnson', 'Sarah Wilson'], 
      lastMessage: 'Regarding the village project...', 
      timestamp: '1 hour ago',
      status: 'flagged',
      unread: 1
    },
    { 
      id: 4, 
      participants: ['Village Council'], 
      lastMessage: 'Budget proposal discussion...', 
      timestamp: '2 hours ago',
      status: 'archived',
      unread: 0
    }
  ];

  const messagingFeatures = [
    { 
      name: 'Direct Messages', 
      description: 'One-on-one conversations',
      count: 156,
      status: 'active',
      icon: MessageSquare
    },
    { 
      name: 'Group Chats', 
      description: 'Community group discussions',
      count: 23,
      status: 'active',
      icon: Users
    },
    { 
      name: 'Broadcast Messages', 
      description: 'Official announcements',
      count: 8,
      status: 'active',
      icon: Send
    },
    { 
      name: 'Moderated Channels', 
      description: 'Supervised discussions',
      count: 5,
      status: 'monitored',
      icon: Shield
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'flagged': return 'text-red-600';
      case 'archived': return 'text-gray-600';
      case 'monitored': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Messaging & Communication Systems"
        description="Manage platform messaging, conversations, and communication tools"
        icon={MessageSquare}
        iconColor="text-blue-600"
        searchPlaceholder="Search conversations, users, messages..."
        onSearch={(query) => {
          console.log('Searching messaging:', query);
        }}
        onRefresh={() => {
          logActivity('messaging_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagingStats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagingStats.activeConversations}</div>
            <p className="text-xs text-muted-foreground">Ongoing discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagingStats.onlineUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Messages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagingStats.flaggedMessages}</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Conversations
            </CardTitle>
            <CardDescription>
              Latest messaging activity across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {conversation.participants.join(', ')}
                      </h4>
                      {conversation.unread > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {conversation.unread} new
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </p>
                  </div>
                  <Badge className={getStatusColor(conversation.status)}>
                    {conversation.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Conversations
            </Button>
          </CardContent>
        </Card>

        {/* Messaging Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Messaging Features
            </CardTitle>
            <CardDescription>
              Overview of communication channels and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messagingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{feature.count}</p>
                      <Badge className={getStatusColor(feature.status)} variant="outline">
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Administration */}
      {hasPermission('messaging:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Messaging Administration</CardTitle>
            <CardDescription>
              Advanced tools for messaging system management and moderation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('messaging_moderate', {})}
              >
                <Shield className="w-4 h-4 mr-2" />
                Moderate Messages
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('messaging_broadcast', {})}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('messaging_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('messaging_settings', {})}
              >
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};