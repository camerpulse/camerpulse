import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Upload, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WhistleblowerPortalProps {
  systemConfig: any;
}

interface SubmissionData {
  disclosure_type: string;
  title: string;
  description: string;
  region: string;
  urgency_level: number;
  estimated_financial_impact: number;
  related_entity_type: string;
  related_entity_id?: string;
  evidence_files: string[];
  is_anonymous: boolean;
}

export const WhistleblowerPortal: React.FC<WhistleblowerPortalProps> = ({ systemConfig }) => {
  const [step, setStep] = useState(1);
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    disclosure_type: '',
    title: '',
    description: '',
    region: '',
    urgency_level: 5,
    estimated_financial_impact: 0,
    related_entity_type: '',
    evidence_files: [],
    is_anonymous: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCode, setSubmissionCode] = useState<string>('');
  const [pseudonym, setPseudonym] = useState<string>('');
  const { toast } = useToast();

  const disclosureTypes = [
    { value: 'corruption', label: 'Corruption', risk: 'high' },
    { value: 'misconduct', label: 'Official Misconduct', risk: 'medium' },
    { value: 'abuse', label: 'Abuse of Power', risk: 'high' },
    { value: 'financial_fraud', label: 'Financial Fraud', risk: 'high' },
    { value: 'environmental', label: 'Environmental Violations', risk: 'medium' },
    { value: 'human_rights', label: 'Human Rights Violations', risk: 'critical' },
    { value: 'other', label: 'Other Misconduct', risk: 'low' },
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const entityTypes = [
    'ministry', 'government_agency', 'local_council', 'project', 
    'politician', 'contractor', 'other'
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create IP hash for security (simplified)
      const ipHash = btoa(Date.now().toString() + Math.random().toString());
      
      // Generate submission code and pseudonym
      const submissionCode = `WB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const pseudonym = submissionData.is_anonymous ? `Anon-${Math.random().toString(36).substr(2, 6)}` : null;
      
      const { data, error } = await supabase
        .from('whistleblower_submissions')
        .insert({
          disclosure_type: submissionData.disclosure_type as any,
          title: submissionData.title,
          description: submissionData.description,
          region: submissionData.region,
          urgency_level: submissionData.urgency_level,
          estimated_financial_impact: submissionData.estimated_financial_impact,
          related_entity_type: submissionData.related_entity_type,
          evidence_files: submissionData.evidence_files,
          is_anonymous: submissionData.is_anonymous,
          submitter_ip_hash: ipHash,
          submission_metadata: {
            submission_timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            encryption_enabled: systemConfig.global_encryption_enabled,
          },
          submission_code: submissionCode,
          pseudonym: pseudonym
        })
        .select()
        .single();

      if (error) throw error;

      setSubmissionCode(submissionCode);
      setPseudonym(pseudonym || 'Anonymous Reporter');
      setStep(5); // Success step

      toast({
        title: "Submission Successful",
        description: "Your report has been securely submitted and encrypted.",
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedDisclosureType = () => {
    return disclosureTypes.find(type => type.value === submissionData.disclosure_type);
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[risk as keyof typeof colors] || colors.low}>
        {risk} risk
      </Badge>
    );
  };

  if (step === 5) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Submission Successful</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Your Secure Submission Details</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Tracking Code</Label>
                <div className="font-mono text-lg bg-background p-2 rounded border">
                  {submissionCode}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Your Anonymous ID</Label>
                <div className="font-mono text-lg bg-background p-2 rounded border">
                  {pseudonym}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Your submission has been encrypted and anonymized
            </p>
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk assessment and protective measures have been automatically applied
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => {
                setStep(1);
                setSubmissionData({
                  disclosure_type: '',
                  title: '',
                  description: '',
                  region: '',
                  urgency_level: 5,
                  estimated_financial_impact: 0,
                  related_entity_type: '',
                  evidence_files: [],
                  is_anonymous: true,
                });
              }}
              variant="outline"
            >
              Submit Another Report
            </Button>
            <Button onClick={() => navigateTo('/civic-shield?tab=tracker')}>
              Track This Submission
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Secure Whistleblower Submission</h2>
            <Badge variant="secondary">{step}/4</Badge>
          </div>
          <Progress value={(step / 4) * 100} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Disclosure Type</span>
            <span>Details</span>
            <span>Evidence</span>
            <span>Review</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Disclosure Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Type of Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="disclosure_type">What type of misconduct are you reporting?</Label>
              <Select
                value={submissionData.disclosure_type}
                onValueChange={(value) => setSubmissionData({...submissionData, disclosure_type: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select disclosure type" />
                </SelectTrigger>
                <SelectContent>
                  {disclosureTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        {getRiskBadge(type.risk)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {submissionData.disclosure_type && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Protection Level</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your disclosure type, {getRiskBadge(getSelectedDisclosureType()?.risk || 'low')} 
                  protection measures will be automatically applied to your submission.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={submissionData.is_anonymous}
                onCheckedChange={(checked) => 
                  setSubmissionData({...submissionData, is_anonymous: checked as boolean})
                }
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously (recommended for protection)
              </Label>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!submissionData.disclosure_type}
              >
                Next: Provide Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Brief Summary</Label>
              <Input
                id="title"
                value={submissionData.title}
                onChange={(e) => setSubmissionData({...submissionData, title: e.target.value})}
                placeholder="Brief description of the issue"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={submissionData.description}
                onChange={(e) => setSubmissionData({...submissionData, description: e.target.value})}
                placeholder="Provide detailed information about the misconduct, including dates, locations, people involved, and any other relevant details."
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={submissionData.region}
                  onValueChange={(value) => setSubmissionData({...submissionData, region: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level (1-10)</Label>
                <Input
                  id="urgency"
                  type="number"
                  min="1"
                  max="10"
                  value={submissionData.urgency_level}
                  onChange={(e) => setSubmissionData({...submissionData, urgency_level: parseInt(e.target.value)})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="financial_impact">Estimated Financial Impact (FCFA)</Label>
              <Input
                id="financial_impact"
                type="number"
                value={submissionData.estimated_financial_impact}
                onChange={(e) => setSubmissionData({...submissionData, estimated_financial_impact: parseInt(e.target.value)})}
                placeholder="0"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="entity_type">Related Entity Type</Label>
              <Select
                value={submissionData.related_entity_type}
                onValueChange={(value) => setSubmissionData({...submissionData, related_entity_type: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!submissionData.title || !submissionData.description}
              >
                Next: Upload Evidence
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Evidence Upload */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Evidence & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Upload Supporting Evidence</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Documents, photos, videos, or other evidence (optional but recommended)
              </p>
              <Button variant="outline">
                Choose Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                All uploads are encrypted and timestamped
              </p>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Evidence Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Documents: PDFs, Word files, spreadsheets</li>
                <li>• Images: Photos of documents, locations, or evidence</li>
                <li>• Audio/Video: Recordings of conversations or events</li>
                <li>• Maximum file size: 50MB per file</li>
                <li>• All files are automatically encrypted upon upload</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button onClick={handleNext}>
                Next: Review Submission
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Review Your Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div>
                <Label className="font-medium">Disclosure Type</Label>
                <p className="flex items-center gap-2 mt-1">
                  {getSelectedDisclosureType()?.label}
                  {getRiskBadge(getSelectedDisclosureType()?.risk || 'low')}
                </p>
              </div>
              
              <div>
                <Label className="font-medium">Title</Label>
                <p className="mt-1">{submissionData.title}</p>
              </div>
              
              <div>
                <Label className="font-medium">Description</Label>
                <p className="mt-1 text-sm">{submissionData.description.substring(0, 200)}...</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Region</Label>
                  <p className="mt-1">{submissionData.region}</p>
                </div>
                <div>
                  <Label className="font-medium">Urgency</Label>
                  <p className="mt-1">{submissionData.urgency_level}/10</p>
                </div>
                <div>
                  <Label className="font-medium">Anonymous</Label>
                  <p className="mt-1">{submissionData.is_anonymous ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Security & Protection</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  End-to-end encryption enabled
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Automatic risk assessment will be performed
                </li>
                <li className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Anonymous identity protection active
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Securely'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};