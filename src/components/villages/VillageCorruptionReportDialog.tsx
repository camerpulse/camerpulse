import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VillageCorruptionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageId: string;
  villageName: string;
  onReportSubmitted: () => void;
}

const REPORT_TYPES = [
  { value: 'fake_project', label: 'Fake or Non-existent Project', description: 'Project claimed but never implemented' },
  { value: 'embezzlement', label: 'Embezzlement', description: 'Misuse of funds or resources' },
  { value: 'ghost_budget', label: 'Ghost Budget/Inflated Costs', description: 'Inflated project costs or fictitious expenses' },
  { value: 'power_abuse', label: 'Abuse of Power', description: 'Misuse of authority by local officials' },
  { value: 'development_delay', label: 'Development Delays', description: 'Unnecessary delays in project implementation' },
  { value: 'unfulfilled_promise', label: 'Unfulfilled Promises', description: 'Campaign promises or commitments not delivered' }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor issue with limited impact' },
  { value: 'medium', label: 'Medium', description: 'Moderate impact on community' },
  { value: 'high', label: 'High', description: 'Significant impact requiring attention' },
  { value: 'critical', label: 'Critical', description: 'Severe impact requiring immediate action' }
];

export function VillageCorruptionReportDialog({
  open,
  onOpenChange,
  villageId,
  villageName,
  onReportSubmitted
}: VillageCorruptionReportDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    reportType: '',
    description: '',
    severityLevel: 'medium',
    evidenceUrls: [] as string[],
    anonymousReport: false
  });
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEvidenceUrl = () => {
    if (newEvidenceUrl.trim() && formData.evidenceUrls.length < 5) {
      setFormData(prev => ({
        ...prev,
        evidenceUrls: [...prev.evidenceUrls, newEvidenceUrl.trim()]
      }));
      setNewEvidenceUrl('');
    }
  };

  const removeEvidenceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.reportType || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.anonymousReport && !user) {
      toast.error('Please sign in or submit as anonymous report');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        village_id: villageId,
        reporter_user_id: formData.anonymousReport ? null : user?.id,
        report_type: formData.reportType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        evidence_urls: formData.evidenceUrls,
        severity_level: formData.severityLevel,
        anonymous_report: formData.anonymousReport,
        status: 'pending'
      };

      const { error } = await supabase
        .from('village_corruption_reports')
        .insert(reportData);

      if (error) throw error;

      toast.success('Report submitted successfully. It will be reviewed by moderators.');
      onReportSubmitted();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        reportType: '',
        description: '',
        severityLevel: 'medium',
        evidenceUrls: [],
        anonymousReport: false
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Issue in {villageName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Important:</strong> Reports help maintain transparency and accountability. 
              All reports are reviewed by moderators. False reports may result in account restrictions.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="Brief title describing the issue"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={formData.reportType} onValueChange={(value) => handleInputChange('reportType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type of issue" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severityLevel">Severity Level</Label>
            <Select value={formData.severityLevel} onValueChange={(value) => handleInputChange('severityLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue, including dates, amounts, people involved, and any other relevant details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Evidence Links (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Add links to documents, photos, videos, or other evidence (up to 5 links)
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/evidence.pdf"
                value={newEvidenceUrl}
                onChange={(e) => setNewEvidenceUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEvidenceUrl()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addEvidenceUrl}
                disabled={formData.evidenceUrls.length >= 5}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {formData.evidenceUrls.length > 0 && (
              <div className="space-y-2">
                {formData.evidenceUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <span className="text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidenceUrl(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymousReport}
              onCheckedChange={(checked) => handleInputChange('anonymousReport', checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit this report anonymously
            </Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}