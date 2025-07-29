import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Flag, AlertTriangle } from 'lucide-react';

interface ReportDialogProps {
  profileId: string;
  profileName: string;
  trigger?: React.ReactNode;
}

const REPORT_TYPES = [
  {
    value: 'spam',
    label: 'Spam or Fake Content',
    description: 'Profile contains spam, fake information, or automated content'
  },
  {
    value: 'harassment',
    label: 'Harassment or Abuse',
    description: 'Profile is being used to harass, threaten, or abuse others'
  },
  {
    value: 'impersonation',
    label: 'Identity Theft or Impersonation',
    description: 'Profile is impersonating another person or entity'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Profile contains offensive, graphic, or inappropriate material'
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'Profile is spreading false or misleading information'
  },
  {
    value: 'copyright',
    label: 'Copyright Violation',
    description: 'Profile is using copyrighted content without permission'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Issue not covered by the above categories'
  }
];

export const ReportDialog: React.FC<ReportDialogProps> = ({
  profileId,
  profileName,
  trigger
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReport = async () => {
    if (!user || !reportType) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('profile_reports')
        .insert({
          reported_profile_id: profileId,
          reporter_user_id: user.id,
          report_type: reportType,
          report_reason: description || reportType
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it and take appropriate action."
      });

      setOpen(false);
      setReportType('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Flag className="w-4 h-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report {profileName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Before reporting:</strong> Consider blocking or unfollowing this profile if you simply don't want to see their content. 
              Reports should be reserved for content that violates our community guidelines.
            </p>
          </div>

          <div>
            <Label className="text-base font-medium">What's the issue?</Label>
            <RadioGroup value={reportType} onValueChange={setReportType} className="mt-3 space-y-3">
              {REPORT_TYPES.map((type) => (
                <div key={type.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Privacy Notice:</strong> Your report will be reviewed by our moderation team. 
              We may contact you for additional information if needed. False reports may result in action against your account.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={!reportType || submitting || description.length > 500}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Flag className="w-4 h-4 mr-2" />
              )}
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};