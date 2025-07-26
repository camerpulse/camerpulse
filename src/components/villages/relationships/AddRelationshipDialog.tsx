import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateVillageRelationship, useSearchVillagesForRelationships } from '@/hooks/useVillageRelationships';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin } from 'lucide-react';

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageId: string;
}

export const AddRelationshipDialog: React.FC<AddRelationshipDialogProps> = ({
  open,
  onOpenChange,
  villageId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<any>(null);
  const [formData, setFormData] = useState({
    relationship_type: '',
    relationship_strength: 'medium',
    description: '',
    historical_context: '',
    established_year: '',
    contact_frequency: 'occasional',
    distance_km: '',
    travel_time_hours: '',
    language_barrier_level: 'none'
  });

  const { data: searchResults = [] } = useSearchVillagesForRelationships(searchTerm, villageId);
  const createRelationship = useCreateVillageRelationship();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVillage || !formData.relationship_type) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const relationshipData = {
      source_village_id: villageId,
      target_village_id: selectedVillage.id,
      relationship_type: formData.relationship_type,
      relationship_strength: formData.relationship_strength,
      description: formData.description,
      historical_context: formData.historical_context || undefined,
      established_year: formData.established_year ? parseInt(formData.established_year) : undefined,
      contact_frequency: formData.contact_frequency,
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
      travel_time_hours: formData.travel_time_hours ? parseFloat(formData.travel_time_hours) : undefined,
      language_barrier_level: formData.language_barrier_level,
      current_activities: [],
      economic_benefits: {},
      cultural_exchanges: [],
      transport_methods: [],
      created_by: user.id,
    };

    createRelationship.mutate(relationshipData, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedVillage(null);
        setSearchTerm('');
        setFormData({
          relationship_type: '',
          relationship_strength: 'medium',
          description: '',
          historical_context: '',
          established_year: '',
          contact_frequency: 'occasional',
          distance_km: '',
          travel_time_hours: '',
          language_barrier_level: 'none'
        });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Village Relationship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Village Search */}
          <div className="space-y-2">
            <Label htmlFor="village_search">Connected Village *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="village_search"
                placeholder="Search for a village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchResults.length > 0 && !selectedVillage && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((village) => (
                  <div
                    key={village.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedVillage(village);
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{village.village_name}</p>
                        <p className="text-sm text-muted-foreground">{village.region}, {village.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVillage && (
              <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedVillage.village_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVillage.region}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVillage(null)}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Relationship Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship_type">Relationship Type *</Label>
              <Select value={formData.relationship_type} onValueChange={(value) => handleInputChange('relationship_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sister_village">Sister Village</SelectItem>
                  <SelectItem value="trade_partner">Trade Partner</SelectItem>
                  <SelectItem value="historical_alliance">Historical Alliance</SelectItem>
                  <SelectItem value="cultural_exchange">Cultural Exchange</SelectItem>
                  <SelectItem value="marriage_alliance">Marriage Alliance</SelectItem>
                  <SelectItem value="neighboring_village">Neighboring Village</SelectItem>
                  <SelectItem value="diaspora_connection">Diaspora Connection</SelectItem>
                  <SelectItem value="administrative_link">Administrative Link</SelectItem>
                  <SelectItem value="shared_heritage">Shared Heritage</SelectItem>
                  <SelectItem value="migration_route">Migration Route</SelectItem>
                  <SelectItem value="economic_partnership">Economic Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_strength">Relationship Strength</Label>
              <Select value={formData.relationship_strength} onValueChange={(value) => handleInputChange('relationship_strength', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Weak</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                  <SelectItem value="very_strong">Very Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the relationship between these villages..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historical_context">Historical Context</Label>
            <Textarea
              id="historical_context"
              value={formData.historical_context}
              onChange={(e) => handleInputChange('historical_context', e.target.value)}
              placeholder="Share the historical background of this relationship..."
              rows={3}
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="established_year">Established Year</Label>
              <Input
                id="established_year"
                type="number"
                value={formData.established_year}
                onChange={(e) => handleInputChange('established_year', e.target.value)}
                placeholder="e.g. 1850"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance_km">Distance (km)</Label>
              <Input
                id="distance_km"
                type="number"
                value={formData.distance_km}
                onChange={(e) => handleInputChange('distance_km', e.target.value)}
                placeholder="Distance in kilometers"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_time_hours">Travel Time (hours)</Label>
              <Input
                id="travel_time_hours"
                type="number"
                value={formData.travel_time_hours}
                onChange={(e) => handleInputChange('travel_time_hours', e.target.value)}
                placeholder="Travel time in hours"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_frequency">Contact Frequency</Label>
              <Select value={formData.contact_frequency} onValueChange={(value) => handleInputChange('contact_frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_barrier_level">Language Barrier</Label>
              <Select value={formData.language_barrier_level} onValueChange={(value) => handleInputChange('language_barrier_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="significant">Significant</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRelationship.isPending || !selectedVillage}>
              {createRelationship.isPending ? 'Adding...' : 'Add Relationship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};