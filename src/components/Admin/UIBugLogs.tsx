import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Monitor, Smartphone, Tablet, Eye, CheckCircle, X, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UIBugLog {
  id: string;
  page_name: string;
  component_path: string;
  issue_type: string;
  screen_size: string;
  issue_description: string;
  suggested_fix: string;
  element_selector: string;
  severity: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const severityColors = {
  low: 'bg-blue-500/10 text-blue-700 border-blue-200',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  high: 'bg-orange-500/10 text-orange-700 border-orange-200',
  critical: 'bg-red-500/10 text-red-700 border-red-200'
};

const statusColors = {
  open: 'bg-red-500/10 text-red-700 border-red-200',
  in_progress: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  resolved: 'bg-green-500/10 text-green-700 border-green-200',
  ignored: 'bg-gray-500/10 text-gray-700 border-gray-200'
};

const issueTypeIcons = {
  overlapping: AlertTriangle,
  overflow: Monitor,
  mobile_break: Smartphone,
  unreadable_text: Eye,
  unresponsive_button: Tablet
};

const screenSizeIcons = {
  '320px': Smartphone,
  '768px': Tablet,
  '1440px': Monitor
};

export function UIBugLogs() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: uiBugLogs, isLoading, refetch } = useQuery({
    queryKey: ['ui-bug-logs', statusFilter, severityFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('ui_bug_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (searchTerm) {
        query = query.or(`page_name.ilike.%${searchTerm}%,component_path.ilike.%${searchTerm}%,issue_description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching UI bug logs:', error);
        throw error;
      }

      return data as UIBugLog[];
    },
  });

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ui_bug_logs')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', issueId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const runInspection = async () => {
    try {
      toast({
        title: "Starting UI Inspection",
        description: "Running visual inspection across all screen sizes...",
      });

      const { data, error } = await supabase.functions.invoke('ui-visual-inspector');

      if (error) throw error;

      toast({
        title: "Inspection Complete",
        description: `Found ${data.issues_found} new UI issues`,
      });

      refetch();
    } catch (error) {
      console.error('Error running UI inspection:', error);
      toast({
        title: "Inspection Failed",
        description: "Failed to run UI visual inspection",
        variant: "destructive",
      });
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    const IconComponent = issueTypeIcons[issueType as keyof typeof issueTypeIcons] || AlertTriangle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getScreenSizeIcon = (screenSize: string) => {
    const IconComponent = screenSizeIcons[screenSize as keyof typeof screenSizeIcons] || Monitor;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading UI Bug Logs...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const groupedIssues = uiBugLogs?.reduce((acc, issue) => {
    const key = `${issue.page_name}-${issue.component_path}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(issue);
    return acc;
  }, {} as Record<string, UIBugLog[]>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                UI Bug Logs
              </CardTitle>
              <CardDescription>
                Visual inspection results across different screen sizes
              </CardDescription>
            </div>
            <Button onClick={runInspection} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Run Inspection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {Object.entries(groupedIssues).map(([key, issues]) => {
              const [pageName, componentPath] = key.split('-');
              const openIssues = issues.filter(issue => issue.status === 'open');
              const highestSeverity = issues.reduce((highest, issue) => {
                const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                return severityOrder[issue.severity as keyof typeof severityOrder] > 
                       severityOrder[highest as keyof typeof severityOrder] ? issue.severity : highest;
              }, 'low');

              return (
                <Card key={key} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{componentPath}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{pageName}</span>
                          <Badge className={severityColors[highestSeverity as keyof typeof severityColors]}>
                            {highestSeverity} severity
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {openIssues.length} open of {issues.length} total
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getIssueTypeIcon(issue.issue_type)}
                            <div className="flex items-center gap-2">
                              {getScreenSizeIcon(issue.screen_size)}
                              <span className="text-sm font-medium">{issue.screen_size}</span>
                            </div>
                            <Badge className={severityColors[issue.severity as keyof typeof severityColors]}>
                              {issue.severity}
                            </Badge>
                            <Badge className={statusColors[issue.status as keyof typeof statusColors]}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {issue.status !== 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Resolve
                              </Button>
                            )}
                            {issue.status !== 'ignored' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateIssueStatus(issue.id, 'ignored')}
                                className="flex items-center gap-1"
                              >
                                <X className="h-3 w-3" />
                                Ignore
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Issue:</strong> {issue.issue_description}
                          </p>
                          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            <strong>Suggested Fix:</strong> {issue.suggested_fix}
                          </p>
                          {issue.element_selector && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Element:</strong> <code className="bg-gray-100 px-1 rounded">{issue.element_selector}</code>
                            </p>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Found {new Date(issue.created_at).toLocaleDateString()} at {new Date(issue.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!uiBugLogs || uiBugLogs.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No UI issues found. Run an inspection to check for problems.</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}