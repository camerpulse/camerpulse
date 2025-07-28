import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Flag, AlertTriangle, MessageSquare, Shield } from 'lucide-react';

interface ReportReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  reviewContent: string;
  onReported?: () => void;
}

const reportReasons = [
  { value: 'spam', label: 'Spam or fake review', icon: Shield },
  { value: 'inappropriate', label: 'Inappropriate content', icon: AlertTriangle },
  { value: 'false_information', label: 'False information', icon: Flag },
  { value: 'harassment', label: 'Harassment or abuse', icon: MessageSquare },
  { value: 'other', label: 'Other', icon: Flag }
];

export const ReportReviewDialog: React.FC<ReportReviewDialogProps> = ({
  open,
  onOpenChange,
  reviewId,
  reviewContent,
  onReported
}) => {
  const { toast } = useToast();
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this review.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to report reviews.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('shipping_rating_reports')
        .insert({
          rating_id: reviewId,
          reported_by: user.id,
          report_reason: reportReason,
          report_details: reportDetails || null
        });

      if (error) {
        console.error('Error submitting report:', error);
        toast({
          title: "Error",
          description: "Failed to submit report. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our platform safe. We'll review this report."
      });

      // Reset form and close dialog
      setReportReason('');
      setReportDetails('');
      onOpenChange(false);
      onReported?.();

    } catch (error) {
      console.error('Error in handleSubmitReport:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Preview */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Review being reported:</p>
            <p className="text-sm italic line-clamp-3">"{reviewContent}"</p>
          </div>

          {/* Report Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for reporting</label>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <div className="flex items-center gap-2">
                      <reason.icon className="h-4 w-4" />
                      {reason.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional details (optional)</label>
            <Textarea
              placeholder="Provide more context about why you're reporting this review..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};