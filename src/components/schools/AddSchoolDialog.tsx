import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Loader2 } from 'lucide-react';

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddSchoolDialog({ open, onOpenChange, onSuccess }: AddSchoolDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    school_type: '',
    ownership: '',
    region: '',
    division: '',
    village_or_city: '',
    languages_taught: ['English', 'French'],
    programs_offered: '',
    founder_or_don: '',
    contact_phone: '',
    contact_email: '',
    contact_website: '',
    address: '',
    description: '',
    established_year: '',
    student_capacity: '',
    current_enrollment: '',
    fees_range_min: '',
    fees_range_max: ''
  });

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const schoolTypes = [
    { value: 'nursery', label: '🏫 Nursery School' },
    { value: 'primary', label: '📚 Primary School' },
    { value: 'secondary', label: '🎓 Secondary School' },
    { value: 'vocational', label: '🛠️ Vocational School' },
    { value: 'university', label: '🏛️ University' },
    { value: 'special', label: '⭐ Special Education' }
  ];

  const ownershipTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'community', label: 'Community' },
    { value: 'religious', label: 'Religious' },
    { value: 'ngo', label: 'NGO' }
  ];

  const availableLanguages = [
    'English', 'French', 'German', 'Spanish', 'Arabic', 'Chinese',
    'Pidgin', 'Fulfulde', 'Ewondo', 'Duala', 'Bassa', 'Other'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      school_type: '',
      ownership: '',
      region: '',
      division: '',
      village_or_city: '',
      languages_taught: ['English', 'French'],
      programs_offered: '',
      founder_or_don: '',
      contact_phone: '',
      contact_email: '',
      contact_website: '',
      address: '',
      description: '',
      established_year: '',
      student_capacity: '',
      current_enrollment: '',
      fees_range_min: '',
      fees_range_max: ''
    });
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a school",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const schoolData = {
        ...formData,
        school_type: formData.school_type as any,
        ownership: formData.ownership as any,
        established_year: formData.established_year ? parseInt(formData.established_year) : null,
        student_capacity: formData.student_capacity ? parseInt(formData.student_capacity) : null,
        current_enrollment: formData.current_enrollment ? parseInt(formData.current_enrollment) : null,
        fees_range_min: formData.fees_range_min ? parseInt(formData.fees_range_min) : null,
        fees_range_max: formData.fees_range_max ? parseInt(formData.fees_range_max) : null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('schools')
        .insert(schoolData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "School has been added to the directory. It will be reviewed for verification."
      });

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding school:', error);
      toast({
        title: "Error",
        description: "Failed to add school. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = (language: string) => {
    if (!formData.languages_taught.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages_taught: [...prev.languages_taught, language]
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages_taught: prev.languages_taught.filter(l => l !== language)
    }));
  };

  const canProceedToStep2 = formData.name && formData.school_type && formData.ownership && 
                           formData.region && formData.village_or_city;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New School to Directory</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter the full name of the school"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School Type *</Label>
                  <Select 
                    value={formData.school_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, school_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ownership *</Label>
                  <Select 
                    value={formData.ownership} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ownership: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownershipTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Region *</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="division">Division *</Label>
                  <Input
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="e.g., Wouri"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village_or_city">City/Village *</Label>
                  <Input
                    id="village_or_city"
                    value={formData.village_or_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, village_or_city: e.target.value }))}
                    placeholder="e.g., Douala"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, neighborhood, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the school, its mission, or special features"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="established_year">Established Year</Label>
                  <Input
                    id="established_year"
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, established_year: e.target.value }))}
                    placeholder="e.g., 1995"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder_or_don">Founder/Donor</Label>
                  <Input
                    id="founder_or_don"
                    value={formData.founder_or_don}
                    onChange={(e) => setFormData(prev => ({ ...prev, founder_or_don: e.target.value }))}
                    placeholder="Name of founder or main donor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_capacity">Student Capacity</Label>
                  <Input
                    id="student_capacity"
                    type="number"
                    value={formData.student_capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_capacity: e.target.value }))}
                    placeholder="Maximum number of students"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_enrollment">Current Enrollment</Label>
                  <Input
                    id="current_enrollment"
                    type="number"
                    value={formData.current_enrollment}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_enrollment: e.target.value }))}
                    placeholder="Current number of students"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages of Instruction</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages_taught.map((language, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {language}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeLanguage(language)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages
                      .filter(lang => !formData.languages_taught.includes(lang))
                      .map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="programs_offered">Programs Offered</Label>
                <Textarea
                  id="programs_offered"
                  value={formData.programs_offered}
                  onChange={(e) => setFormData(prev => ({ ...prev, programs_offered: e.target.value }))}
                  placeholder="List the main programs, courses, or specializations offered"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fees_range_min">Minimum Fees (FCFA)</Label>
                  <Input
                    id="fees_range_min"
                    type="number"
                    value={formData.fees_range_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, fees_range_min: e.target.value }))}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fees_range_max">Maximum Fees (FCFA)</Label>
                  <Input
                    id="fees_range_max"
                    type="number"
                    value={formData.fees_range_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, fees_range_max: e.target.value }))}
                    placeholder="e.g., 150000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Contact Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email Address</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="school@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_website">Website</Label>
                    <Input
                      id="contact_website"
                      value={formData.contact_website}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_website: e.target.value }))}
                      placeholder="https://school.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding School...
                    </>
                  ) : (
                    'Add School'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}