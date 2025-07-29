import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Calendar, 
  GraduationCap, 
  Trophy, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CivicEngagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CivicEngagementModule: React.FC<CivicEngagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('complaints');

  // Civic Complaints Data
  const { data: complaints } = useQuery({
    queryKey: ['admin-civic-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Civic Events Data
  const { data: events } = useQuery({
    queryKey: ['admin-civic-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Civic Education Data
  const { data: education } = useQuery({
    queryKey: ['admin-civic-education'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_education_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Civic Rewards Data
  const { data: rewards } = useQuery({
    queryKey: ['admin-civic-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_rewards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Civic Engagement Management"
        description="Manage citizen complaints, civic events, education content, and rewards system"
        icon={MessageSquare}
        iconColor="text-cm-blue"
        badge={{
          text: "Citizen-Focused",
          variant: "default"
        }}
        onRefresh={() => {
          logActivity('civic_engagement_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Complaints"
          value={complaints?.filter(c => c.verified_status === 'pending').length || 0}
          icon={MessageSquare}
          description="Pending resolution"
          badge={{ text: `${complaints?.filter(c => c.severity_level === 'high').length || 0} High Priority`, variant: "destructive" }}
        />
        <StatCard
          title="Civic Events"
          value={events?.filter(e => new Date(e.end_date) >= new Date()).length || 0}
          icon={Calendar}
          description="Upcoming events"
          trend={{ value: 12, isPositive: true, period: "this month" }}
        />
        <StatCard
          title="Education Content"
          value={education?.length || 0}
          icon={GraduationCap}
          description="Published content"
          badge={{ text: `${education?.filter(e => e.is_featured).length || 0} Featured`, variant: "default" }}
        />
        <StatCard
          title="Active Rewards"
          value={rewards?.filter(r => r.is_active).length || 0}
          icon={Trophy}
          description="Available rewards"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Civic Complaints Tab */}
        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Civic Complaints Management
              </CardTitle>
              <CardDescription>
                Review and manage citizen complaints and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints?.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.title}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>{getPriorityBadge(complaint.severity_level)}</TableCell>
                      <TableCell>{getStatusBadge(complaint.verified_status)}</TableCell>
                      <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Respond</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Civic Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Civic Events Management
              </CardTitle>
              <CardDescription>
                Manage civic events and calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Create New Event</Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {events?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.venue_name || event.description}</TableCell>
                        <TableCell>{new Date(event.end_date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.region}</TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'published' ? "default" : "secondary"}>
                            {event.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Civic Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Civic Education Content
              </CardTitle>
              <CardDescription>
                Manage educational content and quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Create New Content</Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {education?.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell>{content.categories?.[0] || 'General'}</TableCell>
                        <TableCell>{content.difficulty_level}</TableCell>
                        <TableCell>
                          <Badge variant={content.is_featured ? "default" : "secondary"}>
                            {content.is_featured ? "Featured" : "Regular"}
                          </Badge>
                        </TableCell>
                        <TableCell>{content.view_count || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Preview</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Civic Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Civic Rewards System
              </CardTitle>
              <CardDescription>
                Manage civic achievements and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Create New Reward</Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Claimed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {rewards?.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.reward_name || reward.description}</TableCell>
                        <TableCell>{reward.reward_type}</TableCell>
                        <TableCell>{reward.points_value || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={reward.is_active ? "default" : "secondary"}>
                            {reward.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{reward.current_recipients || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};