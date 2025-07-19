import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CreditCard, Shield, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClaimInstitutionModalProps {
  open: boolean;
  onClose: () => void;
  institutionType: 'school' | 'hospital' | 'pharmacy';
  institutionId: string;
  institutionName: string;
  claimFee: number;
}

const DOCUMENT_TYPES = {
  id_card: 'National ID Card',
  appointment_letter: 'Appointment/Employment Letter',
  utility_bill: 'Utility Bill (Address Proof)',
  business_license: 'Business License/Certificate',
  other: 'Other Supporting Document'
};

const STEP_TITLES = [
  'Proof of Association',
  'Document Upload',
  'Payment & Review'
];

export const ClaimInstitutionModal = ({
  open,
  onClose,
  institutionType,
  institutionId,
  institutionName,
  claimFee
}: ClaimInstitutionModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    claimReason: '',
    documents: [] as File[],
    documentTypes: [] as string[],
    paymentMethod: 'card'
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files],
        documentTypes: [...prev.documentTypes, ...files.map(() => docType)]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      documentTypes: prev.documentTypes.filter((_, i) => i !== index)
    }));
  };

  const submitClaim = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the claim record
      const { data: claimData, error: claimError } = await supabase
        .from('institution_claims')
        .insert({
          user_id: user.id,
          institution_type: institutionType,
          institution_id: institutionId,
          institution_name: institutionName,
          claim_reason: formData.claimReason,
          payment_amount: claimFee,
          payment_currency: 'NGN',
          status: 'payment_pending'
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Upload documents if any
      if (formData.documents.length > 0) {
        for (let i = 0; i < formData.documents.length; i++) {
          const file = formData.documents[i];
          const documentType = formData.documentTypes[i];
          
          // Upload to Supabase Storage
          const fileName = `${claimData.id}/${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('claim-documents')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue; // Continue with other files
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('claim-documents')
            .getPublicUrl(fileName);

          // Save document record
          await supabase
            .from('claim_documents')
            .insert({
              claim_id: claimData.id,
              document_type: documentType,
              file_url: publicUrl,
              file_name: file.name,
              file_size: file.size
            });
        }
      }

      // Initiate Flutterwave payment
      await initiatePayment(claimData.id);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (claimId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-claim-payment', {
        body: {
          claimId,
          amount: claimFee,
          currency: 'NGN',
          paymentMethod: formData.paymentMethod
        }
      });

      if (error) throw error;

      if (data.paymentUrl) {
        // Open Flutterwave payment in new tab
        window.open(data.paymentUrl, '_blank');
        setClaimSubmitted(true);
        
        toast({
          title: "Payment Initiated",
          description: "Complete payment in the new tab to finalize your claim.",
        });
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold">Claim {institutionName}</h3>
        <p className="text-muted-foreground">
          Verify your association with this {institutionType}
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You will need to provide proof of your association with this institution and pay a verification fee of {formatAmount(claimFee)}.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="claimReason">How are you associated with this {institutionType}?</Label>
          <Textarea
            id="claimReason"
            placeholder={`I am the owner/director/staff member of ${institutionName}...`}
            value={formData.claimReason}
            onChange={(e) => setFormData(prev => ({ ...prev, claimReason: e.target.value }))}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)}
          disabled={!formData.claimReason.trim()}
        >
          Continue to Document Upload
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Supporting Documents</h3>
        <p className="text-muted-foreground">
          Upload documents that prove your association with {institutionName}
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, key)}
                  className="flex-1"
                />
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {formData.documents.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Uploaded Documents:</h4>
          <div className="space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {DOCUMENT_TYPES[formData.documentTypes[index] as keyof typeof DOCUMENT_TYPES]}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment & Review</h3>
        <p className="text-muted-foreground">
          Review your claim and complete payment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claim Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Institution:</span>
              <p>{institutionName}</p>
            </div>
            <div>
              <span className="font-medium">Type:</span>
              <p className="capitalize">{institutionType}</p>
            </div>
            <div>
              <span className="font-medium">Documents:</span>
              <p>{formData.documents.length} uploaded</p>
            </div>
            <div>
              <span className="font-medium">Verification Fee:</span>
              <p className="font-semibold">{formatAmount(claimFee)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <span className="font-medium text-sm">Association Details:</span>
            <p className="text-sm text-muted-foreground mt-1">{formData.claimReason}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={formData.paymentMethod} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Debit/Credit Card</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Bank Transfer</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your claim will be reviewed by our moderation team within 24-48 hours after payment confirmation.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          onClick={submitClaim}
          disabled={loading}
          className="min-w-32"
        >
          {loading ? 'Processing...' : `Pay ${formatAmount(claimFee)}`}
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
      <div>
        <h3 className="text-xl font-semibold mb-2">Claim Submitted Successfully!</h3>
        <p className="text-muted-foreground">
          Your claim for {institutionName} has been submitted and payment initiated. 
          Complete the payment to finalize your claim.
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You will receive email notifications about your claim status. The review process typically takes 24-48 hours after payment confirmation.
        </AlertDescription>
      </Alert>
      
      <Button onClick={onClose} className="w-full">
        Close
      </Button>
    </div>
  );

  const progress = ((step - 1) / 2) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {claimSubmitted ? 'Claim Submitted' : `Claim Institution - Step ${step} of 3`}
          </DialogTitle>
        </DialogHeader>

        {!claimSubmitted && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              {STEP_TITLES.map((title, index) => (
                <span key={index} className={step > index ? 'text-primary font-medium' : ''}>
                  {title}
                </span>
              ))}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {claimSubmitted ? renderSuccess() : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};