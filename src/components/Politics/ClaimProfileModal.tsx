import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClaimProfileModalProps {
  open: boolean;
  onClose: () => void;
  type: 'politician' | 'party';
  targetName: string;
  targetId: string;
  claimFee: number;
}

export const ClaimProfileModal = ({
  open,
  onClose,
  type,
  targetName,
  targetId,
  claimFee
}: ClaimProfileModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    paymentMethod: '',
    documents: [] as File[],
    nationalId: null as File | null,
    proofOfRole: null as File | null,
    registrationCert: null as File | null,
    additionalInfo: ''
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handleFileUpload = (field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      documents: [...prev.documents.filter(f => f.name !== file.name), file]
    }));
  };

  const handleSubmit = async () => {
    // Here you would integrate with your payment processing
    // and submit the claim request to Supabase
    console.log('Submitting claim:', { type, targetId, formData });
    onClose();
  };

  const requiredDocs = type === 'politician' 
    ? [
        { key: 'nationalId', label: 'National ID Card', required: true },
        { key: 'proofOfRole', label: 'Proof of Political Position', required: true }
      ]
    : [
        { key: 'registrationCert', label: 'Party Registration Certificate', required: true },
        { key: 'nationalId', label: 'ID of Party President/Admin', required: true }
      ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Claim {type === 'politician' ? 'Politician' : 'Party'} Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{targetName}</CardTitle>
              <CardDescription>
                Claim fee: <Badge variant="secondary" className="ml-1">
                  {formatAmount(claimFee)}
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All claims are manually reviewed by our admin team. Payment is required before verification begins.
              Fraudulent claims will result in permanent account suspension.
            </AlertDescription>
          </Alert>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Payment Method</h3>
              
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, paymentMethod: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="orange">Orange Money</SelectItem>
                    <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.paymentMethod}
                  className="w-32"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Document Upload</h3>
              
              <div className="space-y-4">
                {requiredDocs.map((doc) => (
                  <div key={doc.key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.label}
                      {doc.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.key, file);
                        }}
                        className="hidden"
                        id={doc.key}
                      />
                      <label
                        htmlFor={doc.key}
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData[doc.key as keyof typeof formData] 
                            ? `Uploaded: ${(formData[doc.key as keyof typeof formData] as File)?.name}`
                            : 'Click to upload or drag and drop'
                          }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF, JPG, PNG up to 10MB
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
                
                <div className="space-y-2">
                  <Label>Additional Information (Optional)</Label>
                  <Textarea
                    placeholder="Any additional information to support your claim..."
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalInfo: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Previous
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={requiredDocs.some(doc => !formData[doc.key as keyof typeof formData])}
                  className="w-32"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Payment & Confirmation</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claim Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Profile:</span>
                    <span className="font-medium">{targetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{formData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span>{formData.documents.length} uploaded</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatAmount(claimFee)}</span>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  By proceeding, you agree to pay {formatAmount(claimFee)} and understand that:
                  • Claims are non-refundable once approved
                  • False claims result in permanent suspension
                  • Review process takes 3-7 business days
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Previous
                </Button>
                <Button onClick={handleSubmit} className="w-40">
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};