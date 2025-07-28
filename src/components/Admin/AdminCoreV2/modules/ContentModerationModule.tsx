import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentModerationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ContentModerationModule: React.FC<ContentModerationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock reported content for now
  const { data: reportedContent, isLoading } = useQuery({
    queryKey: ['reported-content', statusFilter, contentTypeFilter, searchTerm],
    queryFn: async () => {
      // Return mock data with proper structure
      return [
        {
          id: '1',
          content_type: 'post',
          status: 'pending',
          reason: 'Inappropriate content reported',
          created_at: new Date().toISOString(),
          reported_by_profile: { display_name: 'User A' },
          content_data: { text: 'Sample content that was reported for moderation review.' }
        },
        {
          id: '2', 
          content_type: 'comment',
          status: 'pending',
          reason: 'Spam content',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reported_by_profile: { display_name: 'User B' },
          content_data: { text: 'Another sample content for review.' }
        }
      ];
    }
  });

  // Fetch moderation statistics
  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      // Mock data for now - replace with actual queries
      return {
        pendingReports: 15,
        resolvedToday: 8,
        totalReports: 127,
        autoModerated: 45
      };
    }
  });

  // Mock moderation action mutation
  const moderateContent = useMutation({
    mutationFn: async ({ 
      reportId, 
      action, 
      moderatorNotes 
    }: { 
      reportId: string; 
      action: 'approve' | 'remove' | 'flag'; 
      moderatorNotes?: string; 
    }) => {
      // Mock implementation - will be replaced with actual database operations
      await new Promise(resolve => setTimeout(resolve, 500));
      return { reportId, action, moderatorNotes };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reported-content'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
      toast({ 
        title: `Content ${variables.action}d successfully` 
      });
      logActivity('content_moderated', { 
        action: variables.action, 
        reportId: variables.reportId 
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to moderate content", 
        variant: "destructive" 
      });
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'removed': return 'destructive';
      case 'flagged': return 'outline';
      default: return 'secondary';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Content Moderation"
        description="Review and moderate user-generated content and reports"
        icon={Shield}
        iconColor="text-orange-600"
        searchPlaceholder="Search content reports..."
        onSearch={setSearchTerm}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['reported-content'] });
          queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
          logActivity('moderation_refresh', { timestamp: new Date() });
        }}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.pendingReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.resolvedToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.totalReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Moderated</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.autoModerated || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Content Reports ({reportedContent?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div>Loading reports...</div>
            ) : reportedContent?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports found matching your filters
              </div>
            ) : (
              reportedContent?.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getContentTypeIcon(report.content_type)}</span>
                      <div>
                        <h3 className="font-medium">
                          {report.content_type} Report #{report.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Reported by {report.reported_by_profile?.display_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Report Reason:</h4>
                    <p className="text-sm">{report.reason || 'No reason provided'}</p>
                  </div>

                  {report.content_data && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Content Preview:</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        {report.content_data.text && (
                          <p>{report.content_data.text.slice(0, 200)}...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {report.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => moderateContent.mutate({ 
                          reportId: report.id, 
                          action: 'approve' 
                        })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => moderateContent.mutate({ 
                          reportId: report.id, 
                          action: 'remove' 
                        })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateContent.mutate({ 
                          reportId: report.id, 
                          action: 'flag' 
                        })}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Flag
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};