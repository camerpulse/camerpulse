import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flag, AlertTriangle } from 'lucide-react';

interface PollModerationSystemProps {
  pollId: string;
  pollTitle: string;
}

const REPORT_REASONS = [
  { value: 'offensive_content', label: 'Offensive Content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'fake_identity', label: 'Fake Identity' },
  { value: 'spam_or_bot', label: 'Spam or Bot-generated' }
];

export const PollModerationSystem: React.FC<PollModerationSystemProps> = ({ 
  pollId, 
  pollTitle 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to report a poll",
        variant: "destructive"
      });
      return;
    }

    if (!reportReason) {
      toast({
        title: "Missing Information",
        description: "Please select a reason for reporting this poll",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user already reported this poll
      const { data: existingReport } = await supabase
        .from('poll_reports')
        .select('id')
        .eq('poll_id', pollId)
        .eq('reported_by_user_id', user.id)
        .single();

      if (existingReport) {
        toast({
          title: "Already Reported",
          description: "You have already reported this poll",
          variant: "destructive"
        });
        return;
      }

      // Submit the report
      const { error } = await supabase
        .from('poll_reports')
        .insert({
          poll_id: pollId,
          reported_by_user_id: user.id,
          report_reason: reportReason,
          report_message: reportMessage.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep CamerPulse safe. Your report has been submitted for review.",
        variant: "default"
      });

      // Reset form and close dialog
      setReportReason('');
      setReportMessage('');
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-destructive"
        >
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report Poll
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Reporting poll:</p>
            <p className="font-medium text-sm">{pollTitle}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for reporting <span className="text-destructive">*</span>
            </label>
            <Select value={reportReason} onValueChange={setReportReason}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional details (optional)
            </label>
            <Textarea
              placeholder="Provide any additional context about why you're reporting this poll..."
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {reportMessage.length}/500 characters
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> False reporting may result in account restrictions. 
              Only report content that violates our community guidelines.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={isSubmitting || !reportReason}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};