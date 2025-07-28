import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Building, MapPin, Phone, Mail, FileText, CreditCard } from 'lucide-react';

const regions = [
  'Adamaoua', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const companyTypes = [
  { value: 'bike', label: 'Motorcycle Delivery', icon: '🏍️' },
  { value: 'bus', label: 'Bus/Public Transport', icon: '🚌' },
  { value: 'van', label: 'Van/Truck Delivery', icon: '🚐' },
  { value: 'plane', label: 'Air Cargo', icon: '✈️' },
  { value: 'mixed', label: 'Mixed Services', icon: '🚛' }
];

const subscriptionTiers = [
  {
    value: 'small_agent',
    label: 'Small Agent',
    price: '25,000 FCFA',
    features: ['Up to 50 shipments/month', 'Basic tracking', 'Email support']
  },
  {
    value: 'medium_courier',
    label: 'Medium Courier',
    price: '50,000 FCFA',
    features: ['Up to 200 shipments/month', 'Advanced tracking', 'Phone support', 'Branch management']
  },
  {
    value: 'nationwide_express',
    label: 'Nationwide Express',
    price: '100,000 FCFA',
    features: ['Unlimited shipments', 'Premium tracking', 'Priority support', 'Analytics dashboard']
  },
  {
    value: 'white_label',
    label: 'White Label License',
    price: '1,000,000 FCFA',
    features: ['Custom domain', 'Branded interface', 'API access', 'Dedicated support']
  }
];

const ShippingRegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    tax_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    delivery_scope: 'local',
    description: '',
    website_url: '',
    subscription_tier: 'small_agent'
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to register a shipping company.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('shipping_companies')
        .insert([{
          ...formData,
          user_id: user.id,
          company_type: formData.company_type as 'bike' | 'bus' | 'van' | 'plane' | 'mixed',
          delivery_scope: formData.delivery_scope as 'local' | 'national' | 'international',
          subscription_tier: formData.subscription_tier as 'small_agent' | 'medium_courier' | 'nationwide_express' | 'white_label'
        }])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Create main branch
      await supabase
        .from('shipping_company_branches')
        .insert([{
          company_id: data.id,
          branch_name: 'Main Branch',
          branch_code: 'MAIN',
          address: formData.address,
          city: formData.city,
          region: formData.region,
          phone: formData.phone,
          email: formData.email,
          is_main_branch: true
        }]);

      toast({
        title: "Registration Successful!",
        description: "Your shipping company registration has been submitted for review. You will receive an email once approved.",
      });

      navigate('/shipping/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Express Delivery Services"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select 
                    value={formData.company_type} 
                    onValueChange={(value) => handleInputChange('company_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_number">Tax Number</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => handleInputChange('tax_number', e.target.value)}
                    placeholder="CM-TAX-123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_scope">Delivery Scope *</Label>
                  <Select 
                    value={formData.delivery_scope} 
                    onValueChange={(value) => handleInputChange('delivery_scope', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Delivery</SelectItem>
                      <SelectItem value="national">National Delivery</SelectItem>
                      <SelectItem value="international">International Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your delivery services..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website (Optional)</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@company.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, Quarter Name"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Douala"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value) => handleInputChange('region', value)}
                  >
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
            </CardContent>
          </Card>
        );

      case 3:
        const selectedTier = subscriptionTiers.find(tier => tier.value === formData.subscription_tier);
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.subscription_tier === tier.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('subscription_tier', tier.value)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{tier.label}</h3>
                      <span className="text-xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {selectedTier && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Plan: {selectedTier.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    Registration fee: <span className="font-semibold text-primary">{selectedTier.price}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment will be processed after approval. You will receive payment instructions via email.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register as Shipping Company</h1>
          <p className="text-muted-foreground">
            Join CamerPulse's shipping network and start managing deliveries
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-2xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.company_name || !formData.company_type)) ||
                (step === 2 && (!formData.email || !formData.phone || !formData.address || !formData.city || !formData.region))
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          )}
        </div>

        {/* Help Section */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your application will be reviewed by our admin team</li>
                  <li>• You may be asked to provide additional documentation</li>
                  <li>• Once approved, you'll receive payment instructions</li>
                  <li>• After payment, your account will be activated</li>
                  <li>• You can then start creating shipments and managing deliveries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShippingRegistration;