import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Calendar,
  User,
  Flag,
  Shield,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PollReport {
  id: string;
  poll_id: string;
  reported_by_user_id: string;
  report_reason: string;
  report_message: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  polls?: {
    title: string;
    creator_id: string;
    is_active: boolean;
  };
  profiles?: {
    username: string;
    display_name: string;
  };
}

interface ModerationAction {
  id: string;
  poll_id: string;
  action_type: string;
  action_reason: string;
  creator_notified: boolean;
  created_at: string;
  polls?: {
    title: string;
  };
}

export const PollModerationTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<PollReport[]>([]);
  const [moderationLog, setModerationLog] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PollReport | null>(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchModerationLog();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_reports')
        .select(`
          *,
          polls:polls(title, creator_id, is_active)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for each report
      const reportsWithProfiles = await Promise.all(
        (data || []).map(async (report) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', report.reported_by_user_id)
            .single();

          return {
            ...report,
            profiles: profile || { username: 'Unknown', display_name: 'Unknown User' }
          };
        })
      );

      setReports(reportsWithProfiles);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    }
  };

  const fetchModerationLog = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_moderation_log')
        .select(`
          *,
          polls:polls(title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setModerationLog(data || []);
    } catch (error) {
      console.error('Error fetching moderation log:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReport = async () => {
    if (!selectedReport || !actionType || !user) return;

    try {
      setIsProcessing(true);

      // Update the report status
      await supabase
        .from('poll_reports')
        .update({
          status: actionType === 'dismiss_report' ? 'dismissed' : 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedReport.id);

      // Take action on the poll if needed
      if (actionType === 'hide_poll' || actionType === 'ban_poll') {
        await supabase
          .from('polls')
          .update({ is_active: false })
          .eq('id', selectedReport.poll_id);
      }

      // Log the moderation action
      await supabase
        .from('poll_moderation_log')
        .insert({
          poll_id: selectedReport.poll_id,
          report_id: selectedReport.id,
          admin_id: user.id,
          action_type: actionType,
          action_reason: actionReason,
          creator_notified: true // Would integrate with notification system
        });

      toast({
        title: "Action Completed",
        description: `Report has been ${actionType.replace('_', ' ')}`
      });

      // Refresh data
      fetchReports();
      fetchModerationLog();
      
      // Close dialog
      setSelectedReport(null);
      setActionType('');
      setActionReason('');

    } catch (error) {
      console.error('Error processing report:', error);
      toast({
        title: "Error",
        description: "Failed to process report",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getReportReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      'offensive_content': 'Offensive Content',
      'misinformation': 'Misinformation',
      'hate_speech': 'Hate Speech',
      'fake_identity': 'Fake Identity',
      'spam_or_bot': 'Spam or Bot-generated'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Reviewed</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'hide_poll':
        return <Eye className="w-4 h-4" />;
      case 'ban_poll':
        return <Ban className="w-4 h-4" />;
      case 'warn_creator':
        return <AlertTriangle className="w-4 h-4" />;
      case 'dismiss_report':
        return <XCircle className="w-4 h-4" />;
      case 'approve_report':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flag className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</div>
            <div className="text-sm text-muted-foreground">Pending Reports</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'reviewed').length}</div>
            <div className="text-sm text-muted-foreground">Reviewed Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Ban className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-2xl font-bold">{moderationLog.filter(m => m.action_type === 'ban_poll').length}</div>
            <div className="text-sm text-muted-foreground">Polls Banned</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Reports</TabsTrigger>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="log">Moderation Log</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {reports.filter(r => r.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reports</h3>
                <p className="text-muted-foreground">All reports have been reviewed!</p>
              </CardContent>
            </Card>
          ) : (
            reports.filter(r => r.status === 'pending').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{report.polls?.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Reported by @{report.profiles?.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <Badge variant="destructive" className="mb-2">
                        {getReportReasonLabel(report.report_reason)}
                      </Badge>
                      {report.report_message && (
                        <div className="bg-muted/50 p-3 rounded-lg mt-2">
                          <p className="text-sm">{report.report_message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(report.status)}
                      <Button
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{report.polls?.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>@{report.profiles?.username}</span>
                      <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {getReportReasonLabel(report.report_reason)}
                      </Badge>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          {moderationLog.map((action) => (
            <Card key={action.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getActionIcon(action.action_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{action.action_type.replace('_', ' ').toUpperCase()}</h4>
                      <Badge variant="outline">{action.polls?.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{action.action_reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedReport.polls?.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reported by:</span>
                    <p>@{selectedReport.profiles?.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reason:</span>
                    <p>{getReportReasonLabel(selectedReport.report_reason)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Additional details:</span>
                    <p>{selectedReport.report_message || 'None provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Action to take</label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve_report">Approve Report & Hide Poll</SelectItem>
                    <SelectItem value="ban_poll">Ban Poll</SelectItem>
                    <SelectItem value="warn_creator">Warn Creator</SelectItem>
                    <SelectItem value="dismiss_report">Dismiss Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for action</label>
                <Textarea
                  placeholder="Explain the reason for this moderation action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processReport}
                  disabled={!actionType || !actionReason || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Take Action"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};