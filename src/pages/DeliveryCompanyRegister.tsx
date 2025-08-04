import React, { useState } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  CheckCircle,
  Upload,
  Globe,
  Shield
} from "lucide-react";

const DeliveryCompanyRegister = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegistrationNumber: '',
    contactPersonName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    serviceRegions: [] as string[],
    vehicleTypes: [] as string[],
    companySize: '',
    yearsInBusiness: '',
    websiteUrl: '',
    socialMediaLinks: {},
    serviceCapabilities: [] as string[],
    pricingModel: ''
  });

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const vehicleOptions = [
    'Motorcycles', 'Bicycles', 'Vans', 'Trucks', 'Trailers', 'Refrigerated vehicles'
  ];

  const serviceOptions = [
    'Same-day delivery', 'Next-day delivery', 'Express shipping', 
    'Standard shipping', 'Bulk transport', 'Fragile items', 
    'Fresh products', 'Document delivery'
  ];

  const companySizes = ['Small (1-10 employees)', 'Medium (11-50 employees)', 'Large (50+ employees)'];
  const pricingModels = ['Per kilometer', 'Flat rate', 'Weight-based', 'Negotiable'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), item]
        : (prev[field as keyof typeof prev] as string[]).filter(i => i !== item)
    }));
  };

  const submitApplication = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your application.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_company_applications')
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          business_registration_number: formData.businessRegistrationNumber,
          contact_person_name: formData.contactPersonName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          business_address: formData.businessAddress,
          service_regions: formData.serviceRegions,
          vehicle_types: formData.vehicleTypes,
          company_size: formData.companySize,
          years_in_business: parseInt(formData.yearsInBusiness) || null,
          service_capabilities: formData.serviceCapabilities,
          pricing_model: formData.pricingModel,
          website_url: formData.websiteUrl || null,
          social_media_links: formData.socialMediaLinks
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your delivery company application has been submitted for review.",
      });

      // Reset form or redirect
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      submitApplication();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.contactPersonName && 
               formData.contactEmail && formData.contactPhone;
      case 2:
        return formData.businessAddress && formData.serviceRegions.length > 0 && 
               formData.vehicleTypes.length > 0;
      case 3:
        return formData.serviceCapabilities.length > 0;
      default:
        return true;
    }
  };

  if (currentStep === 4) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for your interest in joining our delivery network. 
                We'll review your application and get back to you within 2-3 business days.
              </p>
              <div className="space-y-4">
                <Button asChild size="lg">
                  <a href="/shipping">Return to Shipping Hub</a>
                </Button>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Register Your Delivery Company
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our network of trusted delivery partners
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className={`text-sm ${currentStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Company Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Service Details
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Capabilities
            </span>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <><Building2 className="h-5 w-5" /> Company Information</>}
              {currentStep === 2 && <><MapPin className="h-5 w-5" /> Service Details</>}
              {currentStep === 3 && <><Truck className="h-5 w-5" /> Service Capabilities</>}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your company and key contact information"}
              {currentStep === 2 && "Define your service areas and vehicle fleet"}
              {currentStep === 3 && "Specify your delivery capabilities and pricing"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your Delivery Company Ltd"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessRegistration">Business Registration Number</Label>
                    <Input
                      id="businessRegistration"
                      value={formData.businessRegistrationNumber}
                      onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                      placeholder="RC/DLA/2024/A/1234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person Name *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@yourcompany.cm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://yourcompany.cm"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Street address, city, region"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Service Regions *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all regions where you provide delivery services
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {regions.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region}`}
                          checked={formData.serviceRegions.includes(region)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('serviceRegions', region, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`region-${region}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Vehicle Types *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all vehicle types in your fleet
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vehicleOptions.map((vehicle) => (
                      <div key={vehicle} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-${vehicle}`}
                          checked={formData.vehicleTypes.includes(vehicle)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('vehicleTypes', vehicle, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`vehicle-${vehicle}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {vehicle}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Company Size</Label>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {companySizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={formData.companySize === size}
                          onCheckedChange={(checked) => 
                            handleInputChange('companySize', checked ? size : '')
                          }
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service Capabilities */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Service Capabilities *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all delivery services you offer
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={formData.serviceCapabilities.includes(service)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('serviceCapabilities', service, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`service-${service}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Pricing Model</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How do you structure your pricing?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pricingModels.map((model) => (
                      <div key={model} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pricing-${model}`}
                          checked={formData.pricingModel === model}
                          onCheckedChange={(checked) => 
                            handleInputChange('pricingModel', checked ? model : '')
                          }
                        />
                        <label
                          htmlFor={`pricing-${model}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {model}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    What happens next?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your application will be reviewed within 2-3 business days</li>
                    <li>• We may contact you for additional information or documentation</li>
                    <li>• Once approved, you'll receive your company profile access</li>
                    <li>• You can then start receiving partnership requests</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <Button 
                onClick={nextStep}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  "Submitting..."
                ) : currentStep === 3 ? (
                  "Submit Application"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DeliveryCompanyRegister;