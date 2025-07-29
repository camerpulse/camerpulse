import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, MessageSquare, Flag, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  rating_id: string;
  reported_by: string;
  report_reason: string;
  report_details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  reviewed_by?: string;
  reviewed_at?: string;
  moderator_notes?: string;
  created_at: string;
  shipping_company_ratings: {
    overall_rating: number;
    review_text?: string;
    created_at: string;
  };
}

export const ReviewModerationDashboard: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningReport, setActioningReport] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Reviewed</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Dismissed</Badge>;
      case 'action_taken':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Action Taken</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'spam': return 'Spam or fake review';
      case 'inappropriate': return 'Inappropriate content';
      case 'false_information': return 'False information';
      case 'harassment': return 'Harassment or abuse';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shipping_rating_reports')
        .select(`
          *,
          shipping_company_ratings (
            overall_rating,
            review_text,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive"
        });
        return;
      }

      setReports((data || []) as Report[]);
    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'dismissed' | 'action_taken', notes?: string) => {
    setActioningReport(reportId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to moderate reports.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('shipping_rating_reports')
        .update({
          status: action,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          moderator_notes: notes
        })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating report:', error);
        toast({
          title: "Error",
          description: "Failed to update report status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Report updated",
        description: `Report has been ${action === 'dismissed' ? 'dismissed' : 'marked as resolved'}`
      });

      fetchReports();

    } catch (error) {
      console.error('Error in handleReportAction:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setActioningReport(null);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Review Moderation Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Review Moderation Dashboard
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {reports.filter(r => r.status === 'pending').length} pending reports
          </div>
        </CardHeader>
      </Card>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports</h3>
            <p className="text-muted-foreground">
              All clear! No reviews have been reported for moderation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onAction={handleReportAction}
              isActioning={actioningReport === report.id}
              getStatusBadge={getStatusBadge}
              getReasonLabel={getReasonLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ReportCardProps {
  report: Report;
  onAction: (reportId: string, action: 'dismissed' | 'action_taken', notes?: string) => void;
  isActioning: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  getReasonLabel: (reason: string) => string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onAction, isActioning, getStatusBadge, getReasonLabel }) => {
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [actionType, setActionType] = useState<'dismissed' | 'action_taken' | ''>('');

  const handleSubmitAction = () => {
    if (!actionType) return;
    onAction(report.id, actionType, moderatorNotes || undefined);
    setModeratorNotes('');
    setActionType('');
  };

  return (
    <Card className={`${report.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium text-sm">Report #{report.id.slice(-8)}</span>
                {getStatusBadge(report.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </div>
            </div>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              {getReasonLabel(report.report_reason)}
            </Badge>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reported Review</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < report.shipping_company_ratings.overall_rating
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            {report.shipping_company_ratings.review_text ? (
              <p className="text-sm italic">"{report.shipping_company_ratings.review_text}"</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No review text provided</p>
            )}
          </div>

          {report.report_details && (
            <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
              <span className="text-sm font-medium text-destructive">Report Details:</span>
              <p className="text-sm text-muted-foreground mt-1">{report.report_details}</p>
            </div>
          )}

          {report.status === 'pending' && (
            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Moderator Action</label>
                <Select value={actionType} onValueChange={(value: 'dismissed' | 'action_taken') => setActionType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dismissed">Dismiss Report</SelectItem>
                    <SelectItem value="action_taken">Take Action on Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Moderator Notes (optional)</label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAction}
                  disabled={!actionType || isActioning}
                  className="flex-1"
                >
                  {isActioning ? 'Processing...' : 'Submit Action'}
                </Button>
              </div>
            </div>
          )}

          {report.status !== 'pending' && (
            <div className="p-3 bg-muted/20 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">
                Reviewed {report.reviewed_at ? formatDistanceToNow(new Date(report.reviewed_at), { addSuffix: true }) : 'Unknown'}
              </div>
              {report.moderator_notes && (
                <p className="text-sm">{report.moderator_notes}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};