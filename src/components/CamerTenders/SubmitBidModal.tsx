import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Clock,
  Building2,
  User,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubmitBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: {
    id: string;
    title: string;
    deadline: string;
    budget: { min: number; max: number; currency: string };
    issuer: string;
  };
  onSubmit: (bidData: any) => void;
}

interface BidFormData {
  technicalProposal: string;
  bidAmount: string;
  currency: string;
  timeline: string;
  companyInfo: {
    name: string;
    registration: string;
    experience: string;
    contact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  documents: File[];
}

export const SubmitBidModal: React.FC<SubmitBidModalProps> = ({
  isOpen,
  onClose,
  tender,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BidFormData>({
    technicalProposal: '',
    bidAmount: '',
    currency: 'FCFA',
    timeline: '',
    companyInfo: {
      name: '',
      registration: '',
      experience: '',
      contact: {
        name: '',
        email: '',
        phone: ''
      }
    },
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting bid:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.companyInfo.name && formData.companyInfo.registration;
      case 2:
        return formData.technicalProposal && formData.timeline;
      case 3:
        return formData.bidAmount;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const formatBudget = (amount: number, currency: string) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ${currency}`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ${currency}`;
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Bid</DialogTitle>
          <DialogDescription>
            Submit your proposal for: {tender.title}
          </DialogDescription>
        </DialogHeader>

        {/* Tender Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{daysLeft} days left</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatBudget(tender.budget.min, tender.budget.currency)} - {formatBudget(tender.budget.max, tender.budget.currency)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{tender.issuer}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Provide your company details and registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyInfo.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))}
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="registration">Registration Number *</Label>
                  <Input
                    id="registration"
                    value={formData.companyInfo.registration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, registration: e.target.value }
                    }))}
                    placeholder="Company registration number"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.companyInfo.experience}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, experience: e.target.value }
                    }))}
                    placeholder="Years in business"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input
                      id="contactName"
                      value={formData.companyInfo.contact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          contact: { ...prev.companyInfo.contact, name: e.target.value }
                        }
                      }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.companyInfo.contact.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          contact: { ...prev.companyInfo.contact, email: e.target.value }
                        }
                      }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.companyInfo.contact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          contact: { ...prev.companyInfo.contact, phone: e.target.value }
                        }
                      }))}
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Technical Proposal
                </CardTitle>
                <CardDescription>
                  Describe your approach and methodology for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="technicalProposal">Technical Approach *</Label>
                  <Textarea
                    id="technicalProposal"
                    value={formData.technicalProposal}
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalProposal: e.target.value }))}
                    placeholder="Describe your technical approach, methodology, and implementation plan..."
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">Project Timeline *</Label>
                  <Textarea
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="Provide a detailed timeline with key milestones..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Proposal
                </CardTitle>
                <CardDescription>
                  Submit your bid amount and financial details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Budget Range: {formatBudget(tender.budget.min, tender.budget.currency)} - {formatBudget(tender.budget.max, tender.budget.currency)}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bidAmount">Bid Amount *</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      value={formData.bidAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, bidAmount: e.target.value }))}
                      placeholder="Enter your bid amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      disabled
                    />
                  </div>
                </div>

                {formData.bidAmount && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Bid Summary</h4>
                    <div className="text-2xl font-bold text-primary">
                      {formatBudget(parseFloat(formData.bidAmount) || 0, formData.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {parseFloat(formData.bidAmount) > tender.budget.max ? (
                        <Badge variant="destructive">Above budget range</Badge>
                      ) : parseFloat(formData.bidAmount) < tender.budget.min ? (
                        <Badge variant="secondary">Below budget range</Badge>
                      ) : (
                        <Badge variant="default">Within budget range</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Supporting Documents
                </CardTitle>
                <CardDescription>
                  Upload relevant documents to support your bid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX (max 10MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents</h4>
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Bid
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={!isStepValid(currentStep)}
            >
              Next
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};