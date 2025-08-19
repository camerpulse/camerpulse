import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { HiringCampaign } from '@/types/hiring';

interface CampaignFormProps {
  onSuccess?: (campaign: HiringCampaign) => void;
  onCancel?: () => void;
}

const CampaignCreationForm: React.FC<CampaignFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_hires: '',
    budget_allocated: '',
    sponsor_name: '',
    sponsor_type: 'ngo' as const,
    sponsor_email: '',
    sponsor_website: '',
  });

  const [targetSectors, setTargetSectors] = useState<string[]>([]);
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [newSector, setNewSector] = useState('');
  const [newRegion, setNewRegion] = useState('');

  const availableSectors = [
    'IT', 'Health', 'Education', 'Banking', 'Logistics', 'Agriculture', 
    'Tourism', 'Manufacturing', 'Government', 'NGO', 'Telecommunications', 
    'Energy', 'Construction', 'Media', 'Legal'
  ];

  const availableRegions = [
    'Douala', 'Yaounde', 'Buea', 'Bamenda', 'Garoua', 'Maroua', 
    'Ngaoundere', 'Ebolowa', 'Bertoua', 'Bafoussam'
  ];

  const addSector = (sector: string) => {
    if (sector && !targetSectors.includes(sector)) {
      setTargetSectors([...targetSectors, sector]);
      setNewSector('');
    }
  };

  const addRegion = (region: string) => {
    if (region && !targetRegions.includes(region)) {
      setTargetRegions([...targetRegions, region]);
      setNewRegion('');
    }
  };

  const removeSector = (sector: string) => {
    setTargetSectors(targetSectors.filter(s => s !== sector));
  };

  const removeRegion = (region: string) => {
    setTargetRegions(targetRegions.filter(r => r !== region));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First create or get sponsor
      const { data: existingSponsor } = await supabase
        .from('sponsors')
        .select('*')
        .eq('contact_email', formData.sponsor_email)
        .maybeSingle();

      let sponsorId = existingSponsor?.id;

      if (!existingSponsor) {
        const { data: newSponsor, error: sponsorError } = await supabase
          .from('sponsors')
          .insert({
            name: formData.sponsor_name,
            sponsor_type: formData.sponsor_type,
            contact_email: formData.sponsor_email,
            website_url: formData.sponsor_website,
            sectors_focus: targetSectors,
            regions_focus: targetRegions,
            is_verified: false
          })
          .select()
          .single();

        if (sponsorError) throw sponsorError;
        sponsorId = newSponsor.id;
      }

      // Create the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('hiring_campaigns')
        .insert({
          sponsor_id: sponsorId,
          name: formData.name,
          description: formData.description,
          target_hires: parseInt(formData.target_hires),
          target_sectors: targetSectors,
          target_regions: targetRegions,
          budget_allocated: formData.budget_allocated ? parseInt(formData.budget_allocated) : null,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          campaign_status: 'active'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      toast({
        title: "Campaign created successfully!",
        description: "Your hiring campaign has been submitted for review."
      });

      onSuccess?.(campaign as any);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Hiring Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Women in Tech 2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="target_hires">Target Hires *</Label>
                <Input
                  id="target_hires"
                  type="number"
                  value={formData.target_hires}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_hires: e.target.value }))}
                  placeholder="e.g., 500"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget Allocated (FCFA)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_allocated: e.target.value }))}
                  placeholder="e.g., 50000000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign goals and target audience..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Target Sectors */}
          <div>
            <Label>Target Sectors</Label>
            <div className="flex gap-2 mb-2">
              <Select value={newSector} onValueChange={setNewSector}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {availableSectors
                    .filter(sector => !targetSectors.includes(sector))
                    .map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={() => addSector(newSector)}
                disabled={!newSector}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetSectors.map(sector => (
                <Badge key={sector} variant="secondary" className="gap-1">
                  {sector}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSector(sector)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Target Regions */}
          <div>
            <Label>Target Regions</Label>
            <div className="flex gap-2 mb-2">
              <Select value={newRegion} onValueChange={setNewRegion}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions
                    .filter(region => !targetRegions.includes(region))
                    .map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={() => addRegion(newRegion)}
                disabled={!newRegion}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetRegions.map(region => (
                <Badge key={region} variant="secondary" className="gap-1">
                  {region}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeRegion(region)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Sponsor Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Sponsor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sponsor_name">Organization Name *</Label>
                  <Input
                    id="sponsor_name"
                    value={formData.sponsor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, sponsor_name: e.target.value }))}
                    placeholder="e.g., UNDP Cameroon"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sponsor_type">Organization Type *</Label>
                  <Select 
                    value={formData.sponsor_type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, sponsor_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="private">Private Company</SelectItem>
                      <SelectItem value="international">International Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sponsor_email">Contact Email *</Label>
                  <Input
                    id="sponsor_email"
                    type="email"
                    value={formData.sponsor_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, sponsor_email: e.target.value }))}
                    placeholder="contact@organization.org"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sponsor_website">Website</Label>
                  <Input
                    id="sponsor_website"
                    type="url"
                    value={formData.sponsor_website}
                    onChange={(e) => setFormData(prev => ({ ...prev, sponsor_website: e.target.value }))}
                    placeholder="https://organization.org"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignCreationForm;