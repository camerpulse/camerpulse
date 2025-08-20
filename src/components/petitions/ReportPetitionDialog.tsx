import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Flag, AlertTriangle, Send } from 'lucide-react';

interface ReportPetitionDialogProps {
  petitionId: string;
  petitionTitle: string;
  onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Advertisement' },
  { value: 'harassment', label: 'Harassment or Abuse' },
  { value: 'misinformation', label: 'False or Misleading Information' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Promotes Violence' },
  { value: 'illegal', label: 'Illegal Activity' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'privacy', label: 'Privacy Violation' },
  { value: 'duplicate', label: 'Duplicate Petition' },
  { value: 'other', label: 'Other' }
];

export const ReportPetitionDialog: React.FC<ReportPetitionDialogProps> = ({
  petitionId,
  petitionTitle,
  onReportSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportReason) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('petition_reports')
        .insert({
          petition_id: petitionId,
          reported_by: user.id,
          report_reason: reportReason,
          report_details: reportDetails.trim() || null
        });

      if (error) throw error;

      // Add to moderation queue if not already there
      await supabase
        .from('petition_moderation_queue')
        .upsert({
          petition_id: petitionId,
          queue_type: 'user_report',
          priority: reportReason === 'violence' || reportReason === 'illegal' ? 1 : 3,
          flags_count: 1,
          flag_reasons: [reportReason]
        }, {
          onConflict: 'petition_id',
          ignoreDuplicates: false
        });

      toast({
        title: "Report submitted",
        description: "Thank you for reporting this petition. Our moderation team will review it.",
      });

      // Reset form and close dialog
      setReportReason('');
      setReportDetails('');
      setIsOpen(false);
      onReportSubmitted?.();

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Report Petition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Petition Context */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Reporting:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{petitionTitle}</p>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4">
            {/* Report Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for reporting</label>
              <Select value={reportReason} onValueChange={setReportReason} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional)</label>
              <Textarea
                placeholder="Provide more context about why you're reporting this petition..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {reportDetails.length}/500 characters
              </p>
            </div>

            {/* Warning Notice */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-xs text-orange-800">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="space-y-1">
                    <li>• False reports may result in account restrictions</li>
                    <li>• Reports are reviewed by our moderation team</li>
                    <li>• You'll be notified of the outcome if action is taken</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!reportReason || isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>

          {/* Report Status Info */}
          <div className="text-xs text-muted-foreground">
            Our moderation team typically reviews reports within 24 hours.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};