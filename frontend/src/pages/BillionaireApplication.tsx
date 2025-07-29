import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crown, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ApplicationData {
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  claimed_net_worth_fcfa: number;
  wealth_source: string;
  business_background: string;
  application_tier: string;
}

const BillionaireApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationData>({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    claimed_net_worth_fcfa: 0,
    wealth_source: '',
    business_background: '',
    application_tier: ''
  });

  const tiers = [
    {
      name: 'Bronze',
      value: 'bronze',
      range: '10M - 50M FCFA',
      price: '100,000 FCFA',
      priceValue: 100000,
      color: 'from-orange-400 to-orange-600',
      icon: '🪙'
    },
    {
      name: 'Silver',
      value: 'silver',
      range: '50M - 500M FCFA',
      price: '500,000 FCFA',
      priceValue: 500000,
      color: 'from-gray-400 to-gray-600',
      icon: '🥈'
    },
    {
      name: 'Gold',
      value: 'gold',
      range: '500M+ FCFA',
      price: '1,000,000 FCFA',
      priceValue: 1000000,
      color: 'from-yellow-400 to-yellow-600',
      icon: '💎'
    }
  ];

  const wealthSources = [
    { value: 'technology', label: 'Technology', icon: '🌐' },
    { value: 'oil_gas', label: 'Oil & Gas', icon: '🛢️' },
    { value: 'real_estate', label: 'Real Estate', icon: '🏘️' },
    { value: 'banking_finance', label: 'Banking & Finance', icon: '💼' },
    { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
    { value: 'mining', label: 'Mining', icon: '⛏️' },
    { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
    { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
    { value: 'retail_trade', label: 'Retail & Trade', icon: '🛍️' },
    { value: 'construction', label: 'Construction', icon: '🏗️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'logistics', label: 'Logistics', icon: '🚛' },
    { value: 'other', label: 'Other', icon: '💼' }
  ];

  const handleInputChange = (field: keyof ApplicationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-determine tier based on net worth
    if (field === 'claimed_net_worth_fcfa') {
      const netWorth = Number(value);
      let tier = '';
      if (netWorth >= 10000000 && netWorth < 50000000) tier = 'bronze';
      else if (netWorth >= 50000000 && netWorth < 500000000) tier = 'silver';
      else if (netWorth >= 500000000) tier = 'gold';
      
      if (tier) {
        setFormData(prev => ({ ...prev, application_tier: tier }));
      }
    }
  };

  const validateStep1 = () => {
    return formData.applicant_name && 
           formData.applicant_email && 
           formData.applicant_phone &&
           formData.claimed_net_worth_fcfa >= 10000000;
  };

  const validateStep2 = () => {
    return formData.wealth_source && 
           formData.business_background.length >= 100 &&
           formData.application_tier;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedTier = tiers.find(t => t.value === formData.application_tier);
      
      const { data, error } = await supabase
        .from('billionaire_applications')
        .insert([{
          applicant_name: formData.applicant_name,
          applicant_email: formData.applicant_email,
          applicant_phone: formData.applicant_phone,
          claimed_net_worth_fcfa: formData.claimed_net_worth_fcfa,
          wealth_source: formData.wealth_source as any,
          business_background: formData.business_background,
          application_tier: formData.application_tier as any,
          payment_amount: selectedTier?.priceValue || 0,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. You will receive payment instructions via email.",
      });

      // Navigate to success page or back to tracker
      navigate('/billionaires', { 
        state: { message: 'Application submitted successfully!' }
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = tiers.find(t => t.value === formData.application_tier);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="h-12 w-12 text-amber-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Apply for Billionaire Status
              </h1>
            </div>
            <p className="text-xl text-amber-800 mb-2">
              Join Cameroon's Elite Wealth Rankings
            </p>
            <Badge variant="outline" className="border-amber-600 text-amber-600">
              Premium Verification Required
            </Badge>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-amber-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-amber-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Step 1: Basic Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your basic details and net worth information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.applicant_name}
                        onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.applicant_email}
                        onChange={(e) => handleInputChange('applicant_email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+237 6XX XXX XXX"
                        value={formData.applicant_phone}
                        onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="networth">Verified Net Worth (FCFA) *</Label>
                      <Input
                        id="networth"
                        type="number"
                        placeholder="Minimum 10,000,000 FCFA"
                        value={formData.claimed_net_worth_fcfa || ''}
                        onChange={(e) => handleInputChange('claimed_net_worth_fcfa', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum threshold: 10 Million FCFA
                      </p>
                    </div>
                  </div>

                  {/* Tier Display */}
                  {formData.claimed_net_worth_fcfa >= 10000000 && (
                    <div className="mt-6">
                      <Label>Your Application Tier</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {tiers.map((tier) => (
                          <Card 
                            key={tier.value} 
                            className={`${formData.application_tier === tier.value ? 'ring-2 ring-amber-500' : ''}`}
                          >
                            <CardContent className="pt-4 text-center">
                              <div className="text-2xl mb-2">{tier.icon}</div>
                              <h3 className="font-bold">{tier.name}</h3>
                              <p className="text-sm text-muted-foreground">{tier.range}</p>
                              <p className="text-lg font-bold text-amber-600">{tier.price}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setStep(2)}
                      disabled={!validateStep1()}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Continue to Step 2
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Step 2: Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your wealth source and business background
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="wealth-source">Primary Wealth Source *</Label>
                    <Select 
                      value={formData.wealth_source} 
                      onValueChange={(value) => handleInputChange('wealth_source', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary wealth source" />
                      </SelectTrigger>
                      <SelectContent>
                        {wealthSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            <div className="flex items-center gap-2">
                              <span>{source.icon}</span>
                              <span>{source.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="background">Business Background & Achievements *</Label>
                    <Textarea
                      id="background"
                      placeholder="Describe your business journey, major achievements, companies owned, investments, and how you built your wealth. Minimum 100 characters."
                      value={formData.business_background}
                      onChange={(e) => handleInputChange('business_background', e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.business_background.length}/100 characters minimum
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Back to Step 1
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      disabled={!validateStep2()}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Review Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review and Submit */}
            {step === 3 && (
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                    Step 3: Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Please review your application before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Application Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold mb-3">Personal Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {formData.applicant_name}</p>
                        <p><strong>Email:</strong> {formData.applicant_email}</p>
                        <p><strong>Phone:</strong> {formData.applicant_phone}</p>
                        <p><strong>Net Worth:</strong> {(formData.claimed_net_worth_fcfa / 1000000).toFixed(1)}M FCFA</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3">Business Information</h3>
                      <div className="space-y-2">
                        <p><strong>Wealth Source:</strong> {wealthSources.find(s => s.value === formData.wealth_source)?.label}</p>
                        <p><strong>Tier:</strong> {selectedTier?.name} ({selectedTier?.range})</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Business Background</h3>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                      {formData.business_background}
                    </p>
                  </div>

                  {/* Payment Information */}
                  {selectedTier && (
                    <Card className={`bg-gradient-to-r ${selectedTier.color} text-white`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              {selectedTier.icon} {selectedTier.name} Tier
                            </h3>
                            <p className="opacity-90">{selectedTier.range}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold flex items-center gap-1">
                              <DollarSign className="h-6 w-6" />
                              {selectedTier.price}
                            </div>
                            <p className="text-sm opacity-90">Application Fee</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Disclaimer */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-blue-700 mb-2">Important Notice</h3>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• All submissions are subject to verification by CamerPulse Intelligence</li>
                        <li>• Payment instructions will be sent to your email after submission</li>
                        <li>• Only verified applications will be published on the public leaderboard</li>
                        <li>• You may request anonymized profile display during verification</li>
                        <li>• Processing typically takes 5-10 business days</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      Back to Edit
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillionaireApplication;