import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  FileText, 
  Shield, 
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface VendorRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VendorRegistration = ({ isOpen, onClose, onSuccess }: VendorRegistrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    businessType: '',
    taxId: '',
    bankAccount: '',
    bankName: '',
    kycDocument: null as File | null
  });

  const categories = [
    'electronics', 'fashion', 'food', 'services', 'crafts', 
    'agriculture', 'automotive', 'books', 'health', 'home'
  ];

  const businessTypes = [
    'sole_proprietorship', 'partnership', 'corporation', 'cooperative', 'ngo'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, kycDocument: file }));
    }
  };

  const uploadKYCDocument = async (file: File) => {
    const fileName = `${user?.id}-${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const submitRegistration = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Upload KYC document if provided
      let kycDocumentUrl = null;
      if (formData.kycDocument) {
        kycDocumentUrl = await uploadKYCDocument(formData.kycDocument);
      }

      // Create vendor profile
      const { error } = await supabase
        .from('marketplace_vendors')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          vendor_id: `CM-${Date.now().toString().slice(-7)}`, // Generate temporary vendor ID
          description: formData.description,
          kyc_document_url: kycDocumentUrl,
          verification_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Registration submitted!",
        description: "Your vendor application is under review. You'll be notified once approved.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting vendor registration:', error);
      toast({
        title: "Registration failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.businessName && formData.description && formData.category;
      case 2:
        return formData.phone && formData.address && formData.city && formData.region;
      case 3:
        return formData.businessType && formData.taxId;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendor Registration
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > num ? <CheckCircle className="h-4 w-4" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step > num ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business and products"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Primary Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Legal & Verification */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Legal & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID / Business Registration Number *</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="Enter tax ID or registration number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Bank name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="kycDocument">KYC Document (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="kycDocument"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="kycDocument" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload business license, ID, or other verification documents
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG up to 5MB
                    </p>
                  </label>
                  {formData.kycDocument && (
                    <Badge className="mt-2">
                      <FileText className="h-3 w-3 mr-1" />
                      {formData.kycDocument.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Verification Process</p>
                    <p className="text-amber-700 mt-1">
                      Your application will be reviewed within 2-3 business days. You'll receive an email notification once approved.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={step === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={nextStep} 
                disabled={!isStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={submitRegistration} 
                disabled={!isStepValid() || loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};