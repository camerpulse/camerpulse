import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  X,
  Check,
  Clock,
  DollarSign,
  Star,
  Zap,
  Crown,
  Calendar,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TenderFormData {
  title: string;
  description: string;
  tender_type: string;
  category: string;
  region: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  deadline: string;
  bid_opening_date: string;
  eligibility_criteria: string;
  instructions: string;
  evaluation_criteria: string;
  documents: File[];
}

interface PaymentPlan {
  id: string;
  plan_name: string;
  plan_type: 'basic' | 'priority' | 'featured';
  price_fcfa: number;
  price_usd: number;
  features: string[];
  duration_days: number;
}

const CreateTender = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    description: '',
    tender_type: '',
    category: '',
    region: '',
    budget_min: 0,
    budget_max: 0,
    currency: 'FCFA',
    deadline: '',
    bid_opening_date: '',
    eligibility_criteria: '',
    instructions: '',
    evaluation_criteria: '',
    documents: []
  });
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const tenderTypes = [
    { value: 'public', label: 'Public Tender' },
    { value: 'private', label: 'Private Tender' },
    { value: 'ngo_donor', label: 'NGO/Donor-Funded' },
    { value: 'international', label: 'International Bid' },
    { value: 'service_contract', label: 'Service Contract' },
    { value: 'construction', label: 'Construction Project' },
    { value: 'supply_order', label: 'Supply Order' },
    { value: 'ict_software', label: 'ICT/Software Project' }
  ];

  const categories = [
    'Construction', 'IT & Technology', 'Medical & Healthcare', 'Education',
    'Agriculture', 'Transport', 'Energy', 'Water & Sanitation', 'Consulting',
    'Security', 'Telecommunications', 'Finance', 'Other'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchUser();
    fetchPaymentPlans();
  }, []);

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please log in to create a tender');
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const fetchPaymentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_usd', { ascending: true });

      if (error) throw error;
      setPaymentPlans(data || []);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast.error('Failed to load payment plans');
    }
  };

  const handleInputChange = (field: keyof TenderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setFormData(prev => ({ 
      ...prev, 
      documents: [...prev.documents, ...newFiles] 
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.tender_type && formData.category);
      case 2:
        return !!(formData.region && formData.budget_max && formData.deadline);
      case 3:
        return !!formData.eligibility_criteria;
      case 4:
        return !!formData.instructions;
      case 5:
        return !!formData.evaluation_criteria;
      case 6:
        return true; // Documents are optional
      case 7:
        return !!selectedPlan;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePayment = async (plan: PaymentPlan) => {
    try {
      setIsSubmitting(true);
      
      // First create the tender
      const { data: tenderData, error: tenderError } = await supabase
        .from('tenders')
        .insert({
          ...formData,
          published_by_user_id: user.id,
          payment_plan_id: plan.id,
          payment_status: 'pending_payment',
          status: 'draft'
        })
        .select()
        .single();

      if (tenderError) throw tenderError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('tender_payments')
        .insert({
          user_id: user.id,
          tender_id: tenderData.id,
          plan_id: plan.id,
          amount_fcfa: plan.price_fcfa,
          amount_usd: plan.price_usd,
          currency: 'usd'
        });

      if (paymentError) throw paymentError;

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-tender-payment', {
        body: {
          planId: plan.id,
          tenderId: tenderData.id,
          amount: plan.price_usd,
          currency: 'usd'
        }
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      window.open(checkoutData.url, '_blank');
      
      toast.success('Payment initiated! Complete the payment to publish your tender.');
      navigate('/tenders');
      
    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error('Failed to create tender');
    } finally {
      setIsSubmitting(false);
      setShowPaymentDialog(false);
    }
  };

  const submitFreeTender = async () => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('tenders')
        .insert({
          ...formData,
          published_by_user_id: user.id,
          payment_status: 'free',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Tender published successfully!');
      navigate(`/tenders/${data.id}`);
      
    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error('Failed to create tender');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'basic': return <Star className="h-5 w-5" />;
      case 'priority': return <Zap className="h-5 w-5" />;
      case 'featured': return <Crown className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'basic': return 'border-blue-200 bg-blue-50';
      case 'priority': return 'border-orange-200 bg-orange-50';
      case 'featured': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Tender Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tender Title *</label>
                  <Input
                    placeholder="Enter tender title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    placeholder="Describe the tender requirements..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tender Type *</label>
                    <Select value={formData.tender_type} onValueChange={(value) => handleInputChange('tender_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenderTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Location & Budget</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Region *</label>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Budget</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.budget_min || ''}
                      onChange={(e) => handleInputChange('budget_min', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Budget *</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.budget_max || ''}
                      onChange={(e) => handleInputChange('budget_max', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCFA">FCFA</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Submission Deadline *</label>
                    <Input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bid Opening Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.bid_opening_date}
                      onChange={(e) => handleInputChange('bid_opening_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Eligibility Criteria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Eligibility Requirements *
                  </label>
                  <Textarea
                    placeholder="Specify who can participate in this tender..."
                    value={formData.eligibility_criteria}
                    onChange={(e) => handleInputChange('eligibility_criteria', e.target.value)}
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Include requirements such as minimum experience, certifications, financial capacity, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Application Instructions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How to Apply *
                  </label>
                  <Textarea
                    placeholder="Provide detailed instructions for bidders..."
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Include submission requirements, format, contact information, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Evaluation Criteria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How Bids Will Be Evaluated *
                  </label>
                  <Textarea
                    placeholder="Describe how proposals will be evaluated..."
                    value={formData.evaluation_criteria}
                    onChange={(e) => handleInputChange('evaluation_criteria', e.target.value)}
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Include scoring criteria, weights, and selection process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Documents & Attachments</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload tender documents (PDF, DOC, XLS)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </label>
                  </Button>
                </div>
                
                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files:</h4>
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Publishing Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Free Plan */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlan === null ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPlan(null)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">Free Listing</CardTitle>
                    <CardDescription>Basic tender posting</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold mb-4">Free</div>
                    <ul className="text-sm space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Basic listing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        30 days visibility
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Email notifications
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Payment Plans */}
                {paymentPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
                    } ${getPlanColor(plan.plan_type)}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-white rounded-full">
                          {getPlanIcon(plan.plan_type)}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                      <CardDescription>{plan.duration_days} days visibility</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        ${(plan.price_usd / 100).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {(plan.price_fcfa / 1000).toFixed(0)}K FCFA
                      </div>
                      <ul className="text-sm space-y-2 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/tenders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Tender</h1>
            <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="w-full h-2" />
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  {selectedPlan === null ? (
                    <Button onClick={submitFreeTender} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish Free
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => setShowPaymentDialog(true)} disabled={isSubmitting}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Continue to Payment
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Confirmation Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment Plan</DialogTitle>
              <DialogDescription>
                You've selected the {selectedPlan?.plan_name} plan for your tender.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedPlan.plan_name}</span>
                    <Badge>{selectedPlan.plan_type}</Badge>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    ${(selectedPlan.price_usd / 100).toFixed(0)} USD
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(selectedPlan.price_fcfa / 1000).toFixed(0)}K FCFA
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handlePayment(selectedPlan)} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateTender;