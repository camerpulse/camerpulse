import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAncestor } from '@/hooks/useVillageGenealogy';
import { supabase } from '@/integrations/supabase/client';

interface AddAncestorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageId: string;
}

export const AddAncestorDialog: React.FC<AddAncestorDialogProps> = ({
  open,
  onOpenChange,
  villageId
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    given_names: '',
    family_name: '',
    birth_year: '',
    death_year: '',
    gender: '',
    occupation: '',
    traditional_title: '',
    migration_story: '',
    notable_achievements: '',
    oral_stories: '',
    privacy_level: 'village'
  });

  const createAncestor = useCreateAncestor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.gender) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ancestorData = {
      ...formData,
      village_id: villageId,
      user_id: user.id,
      given_names: formData.given_names ? formData.given_names.split(',').map(n => n.trim()) : [],
      birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
      death_year: formData.death_year ? parseInt(formData.death_year) : null,
    };

    createAncestor.mutate(ancestorData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          full_name: '',
          given_names: '',
          family_name: '',
          birth_year: '',
          death_year: '',
          gender: '',
          occupation: '',
          traditional_title: '',
          migration_story: '',
          notable_achievements: '',
          oral_stories: '',
          privacy_level: 'village'
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
          <DialogTitle>Add Village Ancestor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_name">Family Name</Label>
                <Input
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) => handleInputChange('family_name', e.target.value)}
                  placeholder="Surname or clan name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="given_names">Given Names (comma separated)</Label>
              <Input
                id="given_names"
                value={formData.given_names}
                onChange={(e) => handleInputChange('given_names', e.target.value)}
                placeholder="First name, middle name, traditional name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_year">Birth Year</Label>
                <Input
                  id="birth_year"
                  type="number"
                  value={formData.birth_year}
                  onChange={(e) => handleInputChange('birth_year', e.target.value)}
                  placeholder="e.g. 1850"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="death_year">Death Year</Label>
                <Input
                  id="death_year"
                  type="number"
                  value={formData.death_year}
                  onChange={(e) => handleInputChange('death_year', e.target.value)}
                  placeholder="e.g. 1920"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Cultural Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cultural Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g. Farmer, Blacksmith, Healer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="traditional_title">Traditional Title</Label>
                <Input
                  id="traditional_title"
                  value={formData.traditional_title}
                  onChange={(e) => handleInputChange('traditional_title', e.target.value)}
                  placeholder="e.g. Chief, Elder, Medicine Man"
                />
              </div>
            </div>
          </div>

          {/* Stories and Heritage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stories & Heritage</h3>

            <div className="space-y-2">
              <Label htmlFor="migration_story">Migration Story</Label>
              <Textarea
                id="migration_story"
                value={formData.migration_story}
                onChange={(e) => handleInputChange('migration_story', e.target.value)}
                placeholder="How did this ancestor come to the village? Share their journey..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notable_achievements">Notable Achievements</Label>
              <Textarea
                id="notable_achievements"
                value={formData.notable_achievements}
                onChange={(e) => handleInputChange('notable_achievements', e.target.value)}
                placeholder="What were their significant contributions or accomplishments?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oral_stories">Oral Traditions & Stories</Label>
              <Textarea
                id="oral_stories"
                value={formData.oral_stories}
                onChange={(e) => handleInputChange('oral_stories', e.target.value)}
                placeholder="Share traditional stories, wisdom, or tales about this ancestor..."
                rows={3}
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="privacy_level">Who can see this ancestor?</Label>
              <Select value={formData.privacy_level} onValueChange={(value) => handleInputChange('privacy_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only me)</SelectItem>
                  <SelectItem value="family">Family (My relatives)</SelectItem>
                  <SelectItem value="village">Village (All village members)</SelectItem>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAncestor.isPending}>
              {createAncestor.isPending ? 'Adding...' : 'Add Ancestor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};