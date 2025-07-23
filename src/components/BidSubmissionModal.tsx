import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BidSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: {
    id: string;
    title: string;
    budgetMin: number;
    budgetMax: number;
    currency: string;
    deadline: string;
  };
}

export default function BidSubmissionModal({ isOpen, onClose, tender }: BidSubmissionModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    proposedAmount: '',
    timeline: '',
    coverLetter: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    experience: '',
    methodology: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit bid logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bid Submitted Successfully",
        description: "Your bid has been submitted and the tender issuer will be notified.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bid. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const isValidBid = () => {
    const amount = parseFloat(formData.proposedAmount);
    return amount >= tender.budgetMin && amount <= tender.budgetMax;
  };

  const daysRemaining = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Bid</DialogTitle>
          <DialogDescription>
            Provide your proposal details for: {tender.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tender Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tender Details
                <Badge variant={daysRemaining > 7 ? "default" : "destructive"}>
                  <Clock className="w-4 h-4 mr-1" />
                  {daysRemaining} days left
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Budget Range</Label>
                  <p className="font-medium">
                    {tender.budgetMin.toLocaleString()} - {tender.budgetMax.toLocaleString()} {tender.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Deadline</Label>
                  <p className="font-medium">{new Date(tender.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Amount */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Your Bid Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proposedAmount">Proposed Amount ({tender.currency}) *</Label>
                  <Input
                    id="proposedAmount"
                    type="number"
                    value={formData.proposedAmount}
                    onChange={(e) => handleInputChange('proposedAmount', e.target.value)}
                    placeholder="Enter your bid amount"
                  />
                  {formData.proposedAmount && !isValidBid() && (
                    <div className="flex items-center mt-2 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Bid amount must be within the specified budget range
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    placeholder="e.g., 3 months, 6 weeks"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Explain why you're the best fit for this project..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="methodology">Project Methodology</Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  placeholder="Describe your approach and methodology for this project..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Upload supporting documents
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Portfolio, licenses, certificates (PDF, DOC, DOCX up to 10MB each)
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select Files
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Attached Files</Label>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="outline">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.proposedAmount || !formData.companyName || !formData.contactEmail || !formData.coverLetter}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}