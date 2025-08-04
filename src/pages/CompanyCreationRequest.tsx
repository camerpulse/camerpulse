import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Building2, Upload, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyCreationRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    founderName: '',
    companyName: '',
    companyType: '',
    businessPlan: '',
    locationPreference: '',
    email: '',
    phone: '',
    agreeToTerms: false
  });

  const companyTypes = [
    { value: 'sole_proprietor', label: 'Sole Proprietorship - 25,000 FCFA' },
    { value: 'limited_company', label: 'Limited Company - 100,000 FCFA' },
    { value: 'public_company', label: 'Public Company - 1,000,000 FCFA' }
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a company creation request",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('company_creation_requests')
        .insert({
          company_type: formData.companyType as "sole_proprietor" | "limited_company" | "public_company",
          founder_email: formData.email,
          founder_phone: formData.phone,
          founder_name: formData.founderName,
          preferred_location: formData.locationPreference,
          business_plan_url: formData.businessPlan || ''
        });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully",
        description: "Your company creation request has been submitted. An admin will review it shortly.",
      });

      navigate('/companies');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Start a Company in Cameroon
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Submit your company creation request and let our experts help you establish your business in Cameroon.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Company Creation Request Form
                </CardTitle>
                <CardDescription>
                  Fill out this form to request assistance with creating your company in Cameroon. 
                  Our team will review your request and contact you with next steps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Founder Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Founder Information</h3>
                    
                    <div>
                      <Label htmlFor="founderName">Full Name *</Label>
                      <Input
                        id="founderName"
                        value={formData.founderName}
                        onChange={(e) => handleInputChange('founderName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+237 XXX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
                    
                    <div>
                      <Label htmlFor="companyName">Proposed Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter your proposed company name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyType">Company Type *</Label>
                        <Select onValueChange={(value) => handleInputChange('companyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                          <SelectContent>
                            {companyTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="locationPreference">Preferred Region *</Label>
                        <Select onValueChange={(value) => handleInputChange('locationPreference', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessPlan">Business Description *</Label>
                      <Textarea
                        id="businessPlan"
                        value={formData.businessPlan}
                        onChange={(e) => handleInputChange('businessPlan', e.target.value)}
                        placeholder="Describe your business idea, target market, and key activities..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="border-t pt-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the terms and conditions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          By submitting this form, I consent to having my information processed 
                          by CamerPulse for company registration assistance. I understand that 
                          fees apply based on the company type selected above.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <h4 className="font-medium text-blue-900 mb-1">
                          What happens next?
                        </h4>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Our team will review your request within 2-3 business days</li>
                          <li>• We'll contact you to discuss requirements and next steps</li>
                          <li>• You'll receive guidance on legal requirements and documentation</li>
                          <li>• We'll assist with the complete registration process</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !formData.agreeToTerms}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Company Creation Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyCreationRequest;