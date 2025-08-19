import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubmitTransparencyReport } from '@/hooks/useTransparencyData';
import { AlertCircle, FileText, Upload, User, UserX } from 'lucide-react';

interface TransparencyReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TransparencyReportForm: React.FC<TransparencyReportFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const { toast } = useToast();
  const submitReport = useSubmitTransparencyReport();

  const categories = [
    'Government Budget',
    'Public Procurement',
    'Judicial Proceedings',
    'Electoral Process',
    'Ministry Operations',
    'Public Services',
    'Corruption Report',
    'Data Access Issue',
    'Other'
  ];

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setEvidence([...evidence, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitReport.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        evidence,
        anonymous
      });

      toast({
        title: "Report Submitted",
        description: "Your transparency report has been submitted successfully and is under review.",
        variant: "default"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setEvidence([]);
      setAnonymous(false);
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Submit Transparency Report
        </CardTitle>
        <CardDescription>
          Help improve government transparency by reporting issues or sharing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-muted/30">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(!!checked)}
            />
            <div className="flex items-center space-x-2">
              {anonymous ? (
                <UserX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously
              </Label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief, descriptive title for your report"
              className="w-full"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select report category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the transparency issue or information you want to share..."
              className="min-h-[120px] w-full"
              required
            />
          </div>

          {/* Evidence URLs */}
          <div className="space-y-4">
            <Label>Supporting Evidence (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Enter URL of supporting document or evidence"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEvidence}
                disabled={!evidenceUrl.trim()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {evidence.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Added Evidence:</Label>
                <div className="space-y-2">
                  {evidence.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm truncate flex-1 mr-2">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEvidence(index)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Alert */}
          <div className="flex items-start space-x-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Report Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Provide accurate and verifiable information</li>
                <li>Include specific details and evidence when possible</li>
                <li>Reports are reviewed by our transparency team</li>
                <li>Anonymous reports are accepted but may take longer to verify</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={submitReport.isPending}
              className="min-w-[120px]"
            >
              {submitReport.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};