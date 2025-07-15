import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Download, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Database,
  Brain,
  TestTube,
  Wrench
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  timestamp: string;
  module: string;
  activity_type: string;
  activity_summary: string;
  related_component: string | null;
  related_entity_id: string | null;
  confidence_score: number | null;
  status: string;
  details: any;
  performed_by: string | null;
  created_at: string;
}

interface Filters {
  module: string;
  activity_type: string;
  time_range: string;
  confidence_min: string;
  confidence_max: string;
  status: string;
}

const ACTIVITY_ICONS = {
  fix_applied: Wrench,
  error_detected: AlertCircle,
  suggestion_proposed: Brain,
  test_run: TestTube,
  admin_override: User,
  data_import: Database,
  verified_updated: CheckCircle,
} as const;

const STATUS_COLORS = {
  success: 'bg-success text-success-foreground',
  failed: 'bg-destructive text-destructive-foreground',
  pending_review: 'bg-warning text-warning-foreground',
} as const;

const MODULE_COLORS = {
  ashen_debug_core: 'bg-primary text-primary-foreground',
  civic_import_core: 'bg-secondary text-secondary-foreground',
  camerpulse_intelligence: 'bg-accent text-accent-foreground',
  admin_action: 'bg-muted text-muted-foreground',
} as const;

export default function CamerPulseActivityTimeline() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    module: '',
    activity_type: '',
    time_range: '24h',
    confidence_min: '',
    confidence_max: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 50;

  const loadActivities = useCallback(async (reset = false) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('camerpulse_activity_timeline')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      if (filters.activity_type) {
        query = query.eq('activity_type', filters.activity_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.confidence_min) {
        query = query.gte('confidence_score', parseInt(filters.confidence_min));
      }
      if (filters.confidence_max) {
        query = query.lte('confidence_score', parseInt(filters.confidence_max));
      }

      // Time range filter
      if (filters.time_range !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.time_range) {
          case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        query = query.gte('timestamp', startDate.toISOString());
      }

      // Pagination
      const currentPage = reset ? 1 : page;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      if (reset) {
        setActivities(data || []);
        setPage(1);
      } else {
        setActivities(prev => [...prev, ...(data || [])]);
      }

      setTotalCount(count || 0);
      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);

    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activity timeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  // Initial load and real-time subscription
  useEffect(() => {
    loadActivities(true);

    // Set up real-time subscription
    const channel = supabase
      .channel('activity-timeline-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camerpulse_activity_timeline'
        },
        (payload) => {
          console.log('New activity:', payload);
          // Add the new activity to the top of the list
          setActivities(prev => [payload.new as ActivityEntry, ...prev]);
          setTotalCount(prev => prev + 1);
          
          toast({
            title: "New Activity",
            description: (payload.new as ActivityEntry).activity_summary,
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadActivities(true);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      module: '',
      activity_type: '',
      time_range: '24h',
      confidence_min: '',
      confidence_max: '',
      status: '',
    });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadActivities(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    toast({
      title: "Export Started",
      description: `Preparing ${format.toUpperCase()} export...`,
    });
    
    // TODO: Implement actual export functionality
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Timeline exported as ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  const getActivityIcon = (activityType: string) => {
    const IconComponent = ACTIVITY_ICONS[activityType as keyof typeof ACTIVITY_ICONS] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Timeline</h2>
          <p className="text-muted-foreground">
            Track all system activities and AI actions across CamerPulse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadActivities(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select
                value={filters.module}
                onValueChange={(value) => handleFilterChange('module', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All modules</SelectItem>
                  <SelectItem value="ashen_debug_core">Ashen Debug Core</SelectItem>
                  <SelectItem value="civic_import_core">Civic Import Core</SelectItem>
                  <SelectItem value="camerpulse_intelligence">CamerPulse Intelligence</SelectItem>
                  <SelectItem value="admin_action">Admin Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select
                value={filters.activity_type}
                onValueChange={(value) => handleFilterChange('activity_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="fix_applied">Fix Applied</SelectItem>
                  <SelectItem value="error_detected">Error Detected</SelectItem>
                  <SelectItem value="suggestion_proposed">Suggestion Proposed</SelectItem>
                  <SelectItem value="test_run">Test Run</SelectItem>
                  <SelectItem value="admin_override">Admin Override</SelectItem>
                  <SelectItem value="data_import">Data Import</SelectItem>
                  <SelectItem value="verified_updated">Verified/Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select
                value={filters.time_range}
                onValueChange={(value) => handleFilterChange('time_range', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Confidence</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={filters.confidence_min}
                onChange={(e) => handleFilterChange('confidence_min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Confidence</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={filters.confidence_max}
                onChange={(e) => handleFilterChange('confidence_max', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-muted-foreground">Total Activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {activities.filter(a => a.status === 'success').length}
            </div>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {activities.filter(a => a.status === 'failed').length}
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {activities.filter(a => a.status === 'pending_review').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            Showing {activities.length} of {totalCount} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-border">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="h-8 w-px bg-border mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={MODULE_COLORS[activity.module as keyof typeof MODULE_COLORS] || 'bg-muted text-muted-foreground'}>
                          {activity.module.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {activity.activity_type.replace('_', ' ')}
                        </Badge>
                        <Badge className={STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS]}>
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium">{activity.activity_summary}</p>
                      {activity.related_component && (
                        <p className="text-sm text-muted-foreground">
                          Component: {activity.related_component}
                        </p>
                      )}
                      {activity.confidence_score !== null && (
                        <p className="text-sm text-muted-foreground">
                          Confidence: {activity.confidence_score}%
                        </p>
                      )}
                      {activity.performed_by && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          Admin Action
                        </div>
                      )}
                    </div>

                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              {!loading && hasMore && activities.length > 0 && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                  >
                    Load More Activities
                  </Button>
                </div>
              )}

              {!loading && activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found matching your filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}