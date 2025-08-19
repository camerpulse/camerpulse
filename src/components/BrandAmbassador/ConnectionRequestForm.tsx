import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { X, CreditCard, Building, MapPin, Calendar, DollarSign } from 'lucide-react';

interface Artist {
  id: string;
  artist_id: string;
  minimum_fee_fcfa?: number;
  minimum_contract_weeks?: number;
  preferred_regions: string[];
  industry_interests: string[];
}

interface ConnectionRequestFormProps {
  artist: Artist;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectionRequestForm: React.FC<ConnectionRequestFormProps> = ({
  artist,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [connectionFee, setConnectionFee] = useState(0);

  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_website: '',
    company_size: undefined as 'startup' | 'sme' | 'large_corp' | undefined,
    company_description: '',
    campaign_type: undefined as 'event' | 'product_launch' | 'awareness' | 'sponsorship' | 'content_creation' | undefined,
    campaign_description: '',
    campaign_duration_weeks: artist.minimum_contract_weeks || 4,
    budget_range_min: artist.minimum_fee_fcfa || 100000,
    budget_range_max: (artist.minimum_fee_fcfa || 100000) * 2,
    target_regions: [] as string[],
    expected_deliverables: [] as string[],
    initial_message: ''
  });

  // Calculate connection fee when company size or campaign type changes
  React.useEffect(() => {
    if (formData.company_size && formData.campaign_type) {
      calculateConnectionFee();
    }
  }, [formData.company_size, formData.campaign_type]);

  const calculateConnectionFee = async () => {
    try {
      const { data, error } = await supabase.rpc('calculate_connection_fee', {
        p_company_size: formData.company_size,
        p_campaign_type: formData.campaign_type
      });

      if (error) throw error;
      setConnectionFee(data || 0);
    } catch (error) {
      console.error('Error calculating fee:', error);
      setConnectionFee(50000); // Fallback fee
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    updateFormData(field, newArray);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.company_size || !formData.campaign_type) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const requestData = {
        artist_profile_id: artist.id,
        company_name: formData.company_name,
        company_email: formData.company_email,
        company_website: formData.company_website,
        company_size: formData.company_size as 'startup' | 'sme' | 'large_corp',
        company_description: formData.company_description,
        campaign_type: formData.campaign_type as 'event' | 'product_launch' | 'awareness' | 'sponsorship' | 'content_creation',
        campaign_description: formData.campaign_description,
        campaign_duration_weeks: formData.campaign_duration_weeks,
        budget_range_min: formData.budget_range_min,
        budget_range_max: formData.budget_range_max,
        target_regions: formData.target_regions,
        expected_deliverables: formData.expected_deliverables,
        initial_message: formData.initial_message,
        connection_fee_fcfa: connectionFee
      };

      const { error } = await supabase
        .from('brand_ambassador_requests')
        .insert(requestData);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit connection request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const isStep1Valid = () => {
    return formData.company_name && 
           formData.company_email && 
           formData.company_size && 
           formData.company_description;
  };

  const isStep2Valid = () => {
    return formData.campaign_type && 
           formData.campaign_description && 
           formData.campaign_duration_weeks > 0 &&
           formData.budget_range_min > 0;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Connect with {artist.artist_id}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Submit your brand collaboration request. Connection fee: {formatPrice(connectionFee)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className="flex-1 h-1 bg-muted rounded">
              <div className={`h-full bg-primary rounded transition-all ${
                step >= 2 ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className="flex-1 h-1 bg-muted rounded">
              <div className={`h-full bg-primary rounded transition-all ${
                step >= 3 ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>

          {/* Step 1: Company Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => updateFormData('company_name', e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label>Contact Email *</Label>
                    <Input
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => updateFormData('company_email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Company Website</Label>
                  <Input
                    value={formData.company_website}
                    onChange={(e) => updateFormData('company_website', e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <Label>Company Size *</Label>
                  <Select value={formData.company_size} onValueChange={(value) => updateFormData('company_size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                      <SelectItem value="sme">SME (11-100 employees)</SelectItem>
                      <SelectItem value="large_corp">Large Corporation (100+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Company Description *</Label>
                  <Textarea
                    value={formData.company_description}
                    onChange={(e) => updateFormData('company_description', e.target.value)}
                    placeholder="Tell us about your company and what you do..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Campaign Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Campaign Type *</Label>
                  <Select value={formData.campaign_type} onValueChange={(value) => updateFormData('campaign_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event Promotion</SelectItem>
                      <SelectItem value="product_launch">Product Launch</SelectItem>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="sponsorship">Sponsorship</SelectItem>
                      <SelectItem value="content_creation">Content Creation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Campaign Description *</Label>
                  <Textarea
                    value={formData.campaign_description}
                    onChange={(e) => updateFormData('campaign_description', e.target.value)}
                    placeholder="Describe your campaign, goals, and what you're looking for..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (weeks) *</Label>
                    <Input
                      type="number"
                      value={formData.campaign_duration_weeks}
                      onChange={(e) => updateFormData('campaign_duration_weeks', parseInt(e.target.value) || 0)}
                      min={artist.minimum_contract_weeks || 1}
                    />
                    {artist.minimum_contract_weeks && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum: {artist.minimum_contract_weeks} weeks
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Expected Deliverables</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Social Media Posts', 'Product Photoshoots', 'Event Appearances', 'Video Content'].map(deliverable => (
                        <div key={deliverable} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={deliverable}
                            checked={formData.expected_deliverables.includes(deliverable)}
                            onChange={() => toggleArrayItem(formData.expected_deliverables, deliverable, 'expected_deliverables')}
                            className="rounded"
                          />
                          <Label htmlFor={deliverable} className="text-xs">{deliverable}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Budget Range Min (FCFA) *</Label>
                    <Input
                      type="number"
                      value={formData.budget_range_min}
                      onChange={(e) => updateFormData('budget_range_min', parseInt(e.target.value) || 0)}
                      min={artist.minimum_fee_fcfa || 0}
                    />
                    {artist.minimum_fee_fcfa && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Artist minimum: {formatPrice(artist.minimum_fee_fcfa)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Budget Range Max (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.budget_range_max}
                      onChange={(e) => updateFormData('budget_range_max', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Target Regions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {artist.preferred_regions.map(region => (
                      <div key={region} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={region}
                          checked={formData.target_regions.includes(region)}
                          onChange={() => toggleArrayItem(formData.target_regions, region, 'target_regions')}
                          className="rounded"
                        />
                        <Label htmlFor={region} className="text-sm">{region}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Review & Submit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-semibold">Company</Label>
                      <p>{formData.company_name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Campaign Type</Label>
                      <p className="capitalize">{formData.campaign_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Duration</Label>
                      <p>{formData.campaign_duration_weeks} weeks</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Budget Range</Label>
                      <p>{formatPrice(formData.budget_range_min)} - {formatPrice(formData.budget_range_max)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Connection Fee:</span>
                      <span>{formatPrice(connectionFee)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This fee unlocks the artist's contact information and notifies them of your request.
                    </p>
                  </div>

                  <div>
                    <Label>Personal Message (Optional)</Label>
                    <Textarea
                      value={formData.initial_message}
                      onChange={(e) => updateFormData('initial_message', e.target.value)}
                      placeholder="Add a personal message to introduce your brand and campaign..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => step > 1 ? setStep(step - 1) : onClose}
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !isStep1Valid() || step === 2 && !isStep2Valid()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : `Submit Request (${formatPrice(connectionFee)})`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};