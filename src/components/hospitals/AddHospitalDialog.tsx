import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddHospitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHospitalAdded: () => void;
}

export function AddHospitalDialog({ open, onOpenChange, onHospitalAdded }: AddHospitalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ownership: '',
    region: '',
    division: '',
    village_or_city: '',
    emergency_services: false,
    working_hours: '',
    services_offered: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
  });

  const { toast } = useToast();

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital' },
    { value: 'private_clinic', label: 'Private Clinic' },
    { value: 'district', label: 'District Hospital' },
    { value: 'diagnostic_center', label: 'Diagnostic Center' },
    { value: 'emergency', label: 'Emergency Center' },
    { value: 'traditional', label: 'Traditional Medicine' },
  ];

  const ownershipTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'community', label: 'Community' },
    { value: 'mission', label: 'Mission/Religious' },
    { value: 'ngo', label: 'NGO' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add a hospital',
          variant: 'destructive',
        });
        return;
      }

      // Prepare services array
      const servicesArray = formData.services_offered
        ? formData.services_offered.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const hospitalData = {
        ...formData,
        services_offered: servicesArray,
        submitted_by: user.id,
      };

      const { error } = await supabase
        .from('hospitals')
        .insert([hospitalData]);

      if (error) {
        throw error;
      }

      onHospitalAdded();
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        ownership: '',
        region: '',
        division: '',
        village_or_city: '',
        emergency_services: false,
        working_hours: '',
        services_offered: '',
        phone: '',
        whatsapp: '',
        email: '',
        website: '',
      });

    } catch (error: any) {
      console.error('Error adding hospital:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add hospital',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Hospital</DialogTitle>
          <DialogDescription>
            Add a healthcare facility to help others in your community find medical services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Hospital Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Central Hospital Yaoundé"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital type" />
                </SelectTrigger>
                <SelectContent>
                  {hospitalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ownership">Ownership *</Label>
              <Select value={formData.ownership} onValueChange={(value) => updateFormData('ownership', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  {ownershipTypes.map((ownership) => (
                    <SelectItem key={ownership.value} value={ownership.value}>
                      {ownership.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {cameroonRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="division">Division *</Label>
              <Input
                id="division"
                value={formData.division}
                onChange={(e) => updateFormData('division', e.target.value)}
                placeholder="Mfoundi"
                required
              />
            </div>

            <div>
              <Label htmlFor="village_or_city">City/Village *</Label>
              <Input
                id="village_or_city"
                value={formData.village_or_city}
                onChange={(e) => updateFormData('village_or_city', e.target.value)}
                placeholder="Yaoundé"
                required
              />
            </div>
          </div>

          {/* Services and Hours */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency_services"
                checked={formData.emergency_services}
                onCheckedChange={(checked) => updateFormData('emergency_services', checked)}
              />
              <Label htmlFor="emergency_services">Emergency Services Available</Label>
            </div>

            <div>
              <Label htmlFor="working_hours">Working Hours</Label>
              <Input
                id="working_hours"
                value={formData.working_hours}
                onChange={(e) => updateFormData('working_hours', e.target.value)}
                placeholder="24/7 or Mon-Fri: 8AM-6PM"
              />
            </div>

            <div>
              <Label htmlFor="services_offered">Services Offered</Label>
              <Textarea
                id="services_offered"
                value={formData.services_offered}
                onChange={(e) => updateFormData('services_offered', e.target.value)}
                placeholder="General Medicine, Surgery, Pediatrics, Maternity (separate with commas)"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+237 xxx xxx xxx"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => updateFormData('whatsapp', e.target.value)}
                placeholder="+237 xxx xxx xxx"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="contact@hospital.cm"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://hospital.cm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Hospital
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}