import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { useCreateSenatorReport } from '@/hooks/useSenatorExtended';
import { Senator } from '@/hooks/useSenators';

interface SenatorReportDialogProps {
  senator: Senator;
  trigger: React.ReactNode;
}

export const SenatorReportDialog = ({ senator, trigger }: SenatorReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    report_type: '',
    report_category: '',
    description: '',
    evidence_files: [] as string[],
    severity: 'medium' as const
  });

  const createReport = useCreateSenatorReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createReport.mutateAsync({
      senator_id: senator.id,
      ...formData
    });
    
    setOpen(false);
    setFormData({
      report_type: '',
      report_category: '',
      description: '',
      evidence_files: [],
      severity: 'medium'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        evidence_files: [...prev.evidence_files, ...fileNames]
      }));
    }
  };

  const reportTypes = [
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'corruption', label: 'Corruption' },
    { value: 'false_information', label: 'False Information' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'conflict_of_interest', label: 'Conflict of Interest' },
    { value: 'abuse_of_power', label: 'Abuse of Power' },
    { value: 'other', label: 'Other' }
  ];

  const reportCategories = [
    { value: 'legislative', label: 'Legislative Issues' },
    { value: 'financial', label: 'Financial Misconduct' },
    { value: 'ethical', label: 'Ethical Violations' },
    { value: 'performance', label: 'Performance Issues' },
    { value: 'public_statements', label: 'Public Statements' },
    { value: 'constituency_relations', label: 'Constituency Relations' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Senator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senator Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  {senator.photo_url ? (
                    <img 
                      src={senator.photo_url} 
                      alt={senator.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {senator.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{senator.full_name || senator.name}</h3>
                  <p className="text-sm text-muted-foreground">{senator.position}</p>
                  {senator.region && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {senator.region}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report_type">Type of Report</Label>
            <Select 
              value={formData.report_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Category */}
          <div className="space-y-2">
            <Label htmlFor="report_category">Category</Label>
            <Select 
              value={formData.report_category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, report_category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {reportCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select 
              value={formData.severity}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor issue</SelectItem>
                <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                <SelectItem value="high">High - Serious issue</SelectItem>
                <SelectItem value="critical">Critical - Urgent attention needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the misconduct or issue. Include dates, locations, and any relevant context..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload documents, images, or other evidence
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.mp3"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            
            {formData.evidence_files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Uploaded Files:</p>
                <div className="space-y-1">
                  {formData.evidence_files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">Important Warning:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• False reports may result in legal action</li>
              <li>• Provide only factual information with evidence</li>
              <li>• Reports are reviewed by administrators</li>
              <li>• Serious reports may be forwarded to authorities</li>
              <li>• Your identity will be kept confidential during investigation</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              className="flex-1"
              disabled={
                createReport.isPending || 
                !formData.description.trim() || 
                !formData.report_type || 
                !formData.report_category
              }
            >
              {createReport.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};