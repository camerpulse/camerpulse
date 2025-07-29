import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Save, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AddVillage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    village_name: '',
    region: '',
    division: '',
    subdivision: '',
    year_founded: '',
    gps_latitude: '',
    gps_longitude: '',
    population_estimate: '',
    village_motto: '',
    founding_story: '',
    migration_legend: '',
    notable_events: '',
    oral_traditions: '',
    totem_symbol: '',
    whatsapp_link: '',
    facebook_link: '',
    community_chat_link: ''
  });
  
  const [traditionalLanguages, setTraditionalLanguages] = useState<string[]>([]);
  const [ethnicGroups, setEthnicGroups] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [newEthnicGroup, setNewEthnicGroup] = useState('');

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North',
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !traditionalLanguages.includes(newLanguage.trim())) {
      setTraditionalLanguages(prev => [...prev, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setTraditionalLanguages(prev => prev.filter(l => l !== language));
  };

  const addEthnicGroup = () => {
    if (newEthnicGroup.trim() && !ethnicGroups.includes(newEthnicGroup.trim())) {
      setEthnicGroups(prev => [...prev, newEthnicGroup.trim()]);
      setNewEthnicGroup('');
    }
  };

  const removeEthnicGroup = (group: string) => {
    setEthnicGroups(prev => prev.filter(g => g !== group));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.village_name || !formData.region || !formData.division || !formData.subdivision) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to add a village');
        return;
      }

      const villageData = {
        ...formData,
        year_founded: formData.year_founded ? parseInt(formData.year_founded) : null,
        gps_latitude: formData.gps_latitude ? parseFloat(formData.gps_latitude) : null,
        gps_longitude: formData.gps_longitude ? parseFloat(formData.gps_longitude) : null,
        population_estimate: formData.population_estimate ? parseInt(formData.population_estimate) : null,
        traditional_languages: traditionalLanguages,
        ethnic_groups: ethnicGroups,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('villages')
        .insert(villageData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Village added successfully!');
      navigate(`/villages/${data.id}`);
    } catch (error) {
      console.error('Error adding village:', error);
      toast.error('Failed to add village. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/villages')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Villages
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add Your Village</h1>
              <p className="text-muted-foreground">
                Help preserve and celebrate your village's heritage by adding it to our directory
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="village_name">Village Name *</Label>
                    <Input
                      id="village_name"
                      value={formData.village_name}
                      onChange={(e) => handleInputChange('village_name', e.target.value)}
                      placeholder="Enter village name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
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

                  <div className="space-y-2">
                    <Label htmlFor="division">Division *</Label>
                    <Input
                      id="division"
                      value={formData.division}
                      onChange={(e) => handleInputChange('division', e.target.value)}
                      placeholder="Enter division"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdivision">Subdivision *</Label>
                    <Input
                      id="subdivision"
                      value={formData.subdivision}
                      onChange={(e) => handleInputChange('subdivision', e.target.value)}
                      placeholder="Enter subdivision"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year_founded">Year Founded</Label>
                    <Input
                      id="year_founded"
                      type="number"
                      value={formData.year_founded}
                      onChange={(e) => handleInputChange('year_founded', e.target.value)}
                      placeholder="e.g. 1850"
                      min="1000"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="population_estimate">Population (estimate)</Label>
                    <Input
                      id="population_estimate"
                      type="number"
                      value={formData.population_estimate}
                      onChange={(e) => handleInputChange('population_estimate', e.target.value)}
                      placeholder="e.g. 5000"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gps_latitude">GPS Latitude</Label>
                    <Input
                      id="gps_latitude"
                      type="number"
                      step="0.000001"
                      value={formData.gps_latitude}
                      onChange={(e) => handleInputChange('gps_latitude', e.target.value)}
                      placeholder="e.g. 3.848033"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gps_longitude">GPS Longitude</Label>
                    <Input
                      id="gps_longitude"
                      type="number"
                      step="0.000001"
                      value={formData.gps_longitude}
                      onChange={(e) => handleInputChange('gps_longitude', e.target.value)}
                      placeholder="e.g. 11.502075"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village_motto">Village Motto or Quote</Label>
                  <Input
                    id="village_motto"
                    value={formData.village_motto}
                    onChange={(e) => handleInputChange('village_motto', e.target.value)}
                    placeholder="Traditional saying or village motto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totem_symbol">Totem or Traditional Symbol</Label>
                  <Input
                    id="totem_symbol"
                    value={formData.totem_symbol}
                    onChange={(e) => handleInputChange('totem_symbol', e.target.value)}
                    placeholder="e.g. Lion, Eagle, Ancestral tree, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cultural Information */}
            <Card>
              <CardHeader>
                <CardTitle>Cultural Heritage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Traditional Languages */}
                <div className="space-y-4">
                  <Label>Traditional Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Enter language name"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <Button type="button" onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {traditionalLanguages.map((language) => (
                      <Badge key={language} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeLanguage(language)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ethnic Groups */}
                <div className="space-y-4">
                  <Label>Ethnic Groups</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newEthnicGroup}
                      onChange={(e) => setNewEthnicGroup(e.target.value)}
                      placeholder="Enter ethnic group name"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEthnicGroup())}
                    />
                    <Button type="button" onClick={addEthnicGroup} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ethnicGroups.map((group) => (
                      <Badge key={group} variant="secondary" className="flex items-center gap-1">
                        {group}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeEthnicGroup(group)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Information */}
            <Card>
              <CardHeader>
                <CardTitle>History & Traditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="founding_story">Founding Story</Label>
                  <Textarea
                    id="founding_story"
                    value={formData.founding_story}
                    onChange={(e) => handleInputChange('founding_story', e.target.value)}
                    placeholder="Tell the story of how your village was founded..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="migration_legend">Migration Legend</Label>
                  <Textarea
                    id="migration_legend"
                    value={formData.migration_legend}
                    onChange={(e) => handleInputChange('migration_legend', e.target.value)}
                    placeholder="Share legends about how your ancestors came to this land..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notable_events">Notable Historical Events</Label>
                  <Textarea
                    id="notable_events"
                    value={formData.notable_events}
                    onChange={(e) => handleInputChange('notable_events', e.target.value)}
                    placeholder="Important events in your village's history..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oral_traditions">Oral Traditions</Label>
                  <Textarea
                    id="oral_traditions"
                    value={formData.oral_traditions}
                    onChange={(e) => handleInputChange('oral_traditions', e.target.value)}
                    placeholder="Traditional stories, customs, and practices passed down through generations..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Community Links */}
            <Card>
              <CardHeader>
                <CardTitle>Community Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_link">WhatsApp Group</Label>
                    <Input
                      id="whatsapp_link"
                      value={formData.whatsapp_link}
                      onChange={(e) => handleInputChange('whatsapp_link', e.target.value)}
                      placeholder="WhatsApp group invite link"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook_link">Facebook Page</Label>
                    <Input
                      id="facebook_link"
                      value={formData.facebook_link}
                      onChange={(e) => handleInputChange('facebook_link', e.target.value)}
                      placeholder="Facebook page URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="community_chat_link">Community Chat</Label>
                    <Input
                      id="community_chat_link"
                      value={formData.community_chat_link}
                      onChange={(e) => handleInputChange('community_chat_link', e.target.value)}
                      placeholder="Other community platform link"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/villages')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Adding Village...' : 'Add Village'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVillage;