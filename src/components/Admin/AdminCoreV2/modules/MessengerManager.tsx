import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { 
  MessageSquare, 
  Users, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle,
  Clock,
  MessageCircle,
  UserX
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MessengerManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const MessengerManager: React.FC<MessengerManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for now - can be replaced with real queries
  const messengerStats = {
    totalUsers: 15420,
    activeChats: 342,
    flaggedMessages: 12,
    blockedUsers: 8
  };

  const recentActivity = [
    {
      id: '1',
      type: 'message_flagged',
      user: 'John Doe',
      content: 'Inappropriate content detected',
      timestamp: '2 min ago',
      status: 'pending'
    },
    {
      id: '2', 
      type: 'user_reported',
      user: 'Jane Smith',
      content: 'Spam messages reported',
      timestamp: '5 min ago',
      status: 'reviewing'
    }
  ];

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Pulse Messenger Management"
        description="Advanced messaging moderation and system management tools"
        icon={MessageSquare}
        iconColor="text-green-600"
        badge={{
          text: "Real-time Monitoring",
          variant: "default"
        }}
        searchPlaceholder="Search messages, users, reports..."
        onSearch={(query) => {
          setSearchTerm(query);
          console.log('Searching messenger:', query);
        }}
        onRefresh={() => {
          logActivity('messenger_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Users"
              value={messengerStats.totalUsers.toLocaleString()}
              description="Registered users"
              icon={Users}
            />
            <StatCard
              title="Active Chats"
              value={messengerStats.activeChats}
              description="Currently active"
              icon={MessageCircle}
            />
            <StatCard
              title="Flagged Messages"
              value={messengerStats.flaggedMessages}
              description="Awaiting review"
              icon={AlertTriangle}
            />
            <StatCard
              title="Blocked Users"
              value={messengerStats.blockedUsers}
              description="Currently blocked"
              icon={UserX}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Moderation Activity
              </CardTitle>
              <CardDescription>Latest flagged content and user reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <DataTableCard
                    key={activity.id}
                    title={activity.user}
                    subtitle={activity.content}
                    status={{
                      label: activity.status,
                      variant: activity.status === 'pending' ? 'destructive' : 'secondary'
                    }}
                    metadata={[
                      { icon: Clock, label: 'Time', value: activity.timestamp },
                      { icon: Shield, label: 'Type', value: activity.type.replace('_', ' ') }
                    ]}
                    actions={[
                      {
                        label: 'Review',
                        icon: Eye,
                        onClick: () => console.log('Review', activity.id),
                        variant: 'outline'
                      },
                      {
                        label: 'Approve',
                        icon: CheckCircle,
                        onClick: () => console.log('Approve', activity.id),
                        variant: 'default'
                      },
                      {
                        label: 'Block',
                        icon: Ban,
                        onClick: () => console.log('Block', activity.id),
                        variant: 'destructive'
                      }
                    ]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Dashboard</CardTitle>
              <CardDescription>Review and moderate flagged messages and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Moderation Tools</h3>
                <p className="text-muted-foreground">
                  AI-powered content filtering and human review workflows
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, permissions, and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Administration</h3>
                <p className="text-muted-foreground">
                  Comprehensive user management and access control
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messenger Settings</CardTitle>
              <CardDescription>Configure messaging system parameters and policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                <p className="text-muted-foreground">
                  Message limits, file sharing, and security settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};