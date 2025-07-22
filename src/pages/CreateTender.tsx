import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TENDER_CATEGORIES = [
  'Infrastructure', 'Technology', 'Consulting', 'Construction', 
  'Healthcare', 'Education', 'Transportation', 'Energy', 'Agriculture'
];

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export default function CreateTender() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget_min: '',
    budget_max: '',
    currency: 'FCFA',
    deadline: undefined as Date | undefined,
    requirements: [] as string[],
    deliverables: [] as string[],
    location: '',
    contact_email: '',
    contact_phone: '',
    eligibility_criteria: '',
    evaluation_criteria: '',
    submission_guidelines: '',
    payment_terms: '',
    contract_duration: '',
    required_experience_years: '',
    required_certifications: [] as string[]
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: 'requirements' | 'deliverables' | 'required_certifications', value: string, setValue: (val: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeArrayItem = (field: 'requirements' | 'deliverables' | 'required_certifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.deadline) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('tenders')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          currency: formData.currency,
          deadline: formData.deadline?.toISOString(),
          region: formData.location,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          eligibility_criteria: formData.eligibility_criteria,
          evaluation_criteria: formData.evaluation_criteria,
          submission_guidelines: formData.submission_guidelines,
          payment_terms: formData.payment_terms,
          contract_duration: formData.contract_duration,
          required_experience_years: formData.required_experience_years ? parseInt(formData.required_experience_years) : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tender Created Successfully",
        description: "Your tender has been posted and is now open for bidding."
      });

      navigate(`/tenders/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error Creating Tender",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Tender</h1>
        <p className="text-muted-foreground">Post a new tender opportunity for contractors and service providers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide the essential details about your tender opportunity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="required">Tender Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a clear, descriptive title for your tender"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="required">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TENDER_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="required">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the work to be done, objectives, and scope"
                className="mt-1 min-h-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
            <CardDescription>
              Specify the financial and temporal constraints for this tender.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="budget_min">Minimum Budget</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => handleInputChange('budget_min', e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="budget_max">Maximum Budget</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => handleInputChange('budget_max', e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="mt-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="required">Submission Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !formData.deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => handleInputChange('deadline', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="contract_duration">Contract Duration</Label>
                <Input
                  id="contract_duration"
                  value={formData.contract_duration}
                  onChange={(e) => handleInputChange('contract_duration', e.target.value)}
                  placeholder="e.g., 6 months, 1 year"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>
              Provide additional information to help bidders understand your requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
              <Textarea
                id="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={(e) => handleInputChange('eligibility_criteria', e.target.value)}
                placeholder="Specify who is eligible to bid (e.g., company size, location, certifications)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="evaluation_criteria">Evaluation Criteria</Label>
              <Textarea
                id="evaluation_criteria"
                value={formData.evaluation_criteria}
                onChange={(e) => handleInputChange('evaluation_criteria', e.target.value)}
                placeholder="Explain how bids will be evaluated and scored"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="submission_guidelines">Submission Guidelines</Label>
              <Textarea
                id="submission_guidelines"
                value={formData.submission_guidelines}
                onChange={(e) => handleInputChange('submission_guidelines', e.target.value)}
                placeholder="Provide instructions on how to submit bids"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Textarea
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                placeholder="Describe payment schedule and terms"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="required_experience_years">Required Experience (Years)</Label>
              <Input
                id="required_experience_years"
                type="number"
                value={formData.required_experience_years}
                onChange={(e) => handleInputChange('required_experience_years', e.target.value)}
                placeholder="Minimum years of experience required"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Provide contact details for bidders to reach out with questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+237 xxx xxx xxx"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tenders')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Tender...' : 'Create Tender'}
          </Button>
        </div>
      </form>
    </div>
  );
}