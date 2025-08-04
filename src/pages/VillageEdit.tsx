import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Save, MapPin, Info, Building, 
  Users, FileText, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLayout } from '@/components/Layout/AppLayout';

const VillageEdit = () => {
  const { id: villageId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [village, setVillage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    village_name: '',
    village_motto: '',
    founding_story: '',
    migration_legend: '',
    notable_events: '',
    oral_traditions: '',
    
    // Infrastructure
    schools_count: 0,
    hospitals_count: 0,
    water_sources_count: 0,
    electricity_coverage_percentage: 0,
    road_network_km: 0,
    
    // Network Coverage
    mtn_coverage: false,
    orange_coverage: false,
    nexttel_coverage: false,
    
    // Economic
    main_economic_activity: '',
    
    // Contact
    whatsapp_link: '',
    facebook_link: '',
    community_chat_link: '',
    
    // Population
    population_estimate: 0,
    
    // Traditional Info
    traditional_languages: [] as string[],
    ethnic_groups: [] as string[],
    totem_symbol: '',
    
    // Update Info
    update_reason: '',
    update_description: '',
    evidence_links: '',
    contact_info: ''
  });

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    if (villageId) {
      fetchVillageData();
    }
  }, [villageId]);

  const fetchVillageData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .eq('id', villageId)
        .single();

      if (error) throw error;
      
      setVillage(data);
      setFormData({
        village_name: data.village_name || '',
        village_motto: data.village_motto || '',
        founding_story: data.founding_story || '',
        migration_legend: data.migration_legend || '',
        notable_events: data.notable_events || '',
        oral_traditions: data.oral_traditions || '',
        schools_count: data.schools_count || 0,
        hospitals_count: data.hospitals_count || 0,
        water_sources_count: data.water_sources_count || 0,
        electricity_coverage_percentage: data.electricity_coverage_percentage || 0,
        road_network_km: data.road_network_km || 0,
        mtn_coverage: data.mtn_coverage || false,
        orange_coverage: data.orange_coverage || false,
        nexttel_coverage: data.nexttel_coverage || false,
        main_economic_activity: data.main_economic_activity || '',
        whatsapp_link: data.whatsapp_link || '',
        facebook_link: data.facebook_link || '',
        community_chat_link: data.community_chat_link || '',
        population_estimate: data.population_estimate || 0,
        traditional_languages: data.traditional_languages || [],
        ethnic_groups: data.ethnic_groups || [],
        totem_symbol: data.totem_symbol || '',
        update_reason: '',
        update_description: '',
        evidence_links: '',
        contact_info: ''
      });
    } catch (error) {
      console.error('Error fetching village:', error);
      toast.error('Failed to load village information');
      navigate('/villages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.update_reason || !formData.update_description) {
      toast.error('Please provide update reason and description');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Store proper update request
      const { error } = await supabase
        .from('village_edit_requests')
        .insert({
          village_id: villageId,
          user_id: user?.id,
          update_reason: formData.update_reason,
          update_description: formData.update_description,
          contact_info: formData.contact_info,
          evidence_links: formData.evidence_links,
          proposed_changes: {
            village_name: formData.village_name,
            village_motto: formData.village_motto,
            founding_story: formData.founding_story,
            migration_legend: formData.migration_legend,
            notable_events: formData.notable_events,
            oral_traditions: formData.oral_traditions,
            schools_count: formData.schools_count,
            hospitals_count: formData.hospitals_count,
            water_sources_count: formData.water_sources_count,
            electricity_coverage_percentage: formData.electricity_coverage_percentage,
            road_network_km: formData.road_network_km,
            mtn_coverage: formData.mtn_coverage,
            orange_coverage: formData.orange_coverage,
            nexttel_coverage: formData.nexttel_coverage,
            main_economic_activity: formData.main_economic_activity,
            whatsapp_link: formData.whatsapp_link,
            facebook_link: formData.facebook_link,
            community_chat_link: formData.community_chat_link,
            population_estimate: formData.population_estimate,
            traditional_languages: formData.traditional_languages,
            ethnic_groups: formData.ethnic_groups,
            totem_symbol: formData.totem_symbol
          }
        });

      if (error) throw error;

      toast.success('Update request submitted successfully for review');
      navigate(`/villages/${villageId}`);
    } catch (error) {
      console.error('Error submitting update:', error);
      toast.error('Failed to submit update request');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!village) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Village Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The village you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate('/villages')}>
                Back to Villages
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/villages/${villageId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Village
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Edit className="h-8 w-8 text-primary" />
              Submit Village Update
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4" />
              {village.village_name}, {village.subdivision}, {village.region}
            </p>
          </div>
        </div>

        {/* Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Update Review Process</h3>
                <p className="text-orange-700 text-sm mt-1">
                  All village updates go through a community review process. Your proposed changes will be reviewed by village moderators before being applied.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="update-info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="update-info">Update Info</TabsTrigger>
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>

            {/* Update Information */}
            <TabsContent value="update-info">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Update Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="update_reason">Reason for Update *</Label>
                    <Select value={formData.update_reason} onValueChange={(value) => setFormData(prev => ({ ...prev, update_reason: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select update reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incorrect_info">Incorrect Information</SelectItem>
                        <SelectItem value="outdated_info">Outdated Information</SelectItem>
                        <SelectItem value="missing_info">Missing Information</SelectItem>
                        <SelectItem value="new_development">New Development</SelectItem>
                        <SelectItem value="infrastructure_change">Infrastructure Change</SelectItem>
                        <SelectItem value="contact_update">Contact Information Update</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update_description">Detailed Description *</Label>
                    <Textarea
                      id="update_description"
                      value={formData.update_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, update_description: e.target.value }))}
                      placeholder="Explain what needs to be updated and why..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence_links">Supporting Evidence (Links)</Label>
                    <Textarea
                      id="evidence_links"
                      value={formData.evidence_links}
                      onChange={(e) => setFormData(prev => ({ ...prev, evidence_links: e.target.value }))}
                      placeholder="Links to photos, documents, or other evidence supporting your update..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Your Contact Information</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="Phone number or email for follow-up questions"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Basic Details Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Basic Village Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="village_name">Village Name</Label>
                      <Input
                        id="village_name"
                        value={formData.village_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, village_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="population_estimate">Population Estimate</Label>
                      <Input
                        id="population_estimate"
                        type="number"
                        value={formData.population_estimate}
                        onChange={(e) => setFormData(prev => ({ ...prev, population_estimate: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village_motto">Village Motto</Label>
                    <Input
                      id="village_motto"
                      value={formData.village_motto}
                      onChange={(e) => setFormData(prev => ({ ...prev, village_motto: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="founding_story">Founding Story</Label>
                    <Textarea
                      id="founding_story"
                      value={formData.founding_story}
                      onChange={(e) => setFormData(prev => ({ ...prev, founding_story: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="main_economic_activity">Main Economic Activity</Label>
                    <Input
                      id="main_economic_activity"
                      value={formData.main_economic_activity}
                      onChange={(e) => setFormData(prev => ({ ...prev, main_economic_activity: e.target.value }))}
                      placeholder="e.g., Agriculture, Trading, Fishing"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Infrastructure & Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Schools</Label>
                      <Input
                        type="number"
                        value={formData.schools_count}
                        onChange={(e) => setFormData(prev => ({ ...prev, schools_count: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Health Centers</Label>
                      <Input
                        type="number"
                        value={formData.hospitals_count}
                        onChange={(e) => setFormData(prev => ({ ...prev, hospitals_count: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Water Sources</Label>
                      <Input
                        type="number"
                        value={formData.water_sources_count}
                        onChange={(e) => setFormData(prev => ({ ...prev, water_sources_count: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Electricity %</Label>
                      <Input
                        type="number"
                        max="100"
                        value={formData.electricity_coverage_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, electricity_coverage_percentage: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Network Coverage</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.mtn_coverage}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mtn_coverage: !!checked }))}
                        />
                        <Label>MTN</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.orange_coverage}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, orange_coverage: !!checked }))}
                        />
                        <Label>Orange</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.nexttel_coverage}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nexttel_coverage: !!checked }))}
                        />
                        <Label>Nexttel</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Group</Label>
                      <Input
                        value={formData.whatsapp_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_link: e.target.value }))}
                        placeholder="WhatsApp group invite link"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Facebook Page</Label>
                      <Input
                        value={formData.facebook_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, facebook_link: e.target.value }))}
                        placeholder="Facebook page URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Community Chat</Label>
                      <Input
                        value={formData.community_chat_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, community_chat_link: e.target.value }))}
                        placeholder="Community chat link"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cultural Tab */}
            <TabsContent value="cultural">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Cultural Heritage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Traditional Languages (comma-separated)</Label>
                    <Input
                      value={formData.traditional_languages.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        traditional_languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="e.g., Duala, Bassa, French"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ethnic Groups (comma-separated)</Label>
                    <Input
                      value={formData.ethnic_groups.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ethnic_groups: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="e.g., Duala, Bassa, Bakweri"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Totem/Symbol</Label>
                    <Input
                      value={formData.totem_symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, totem_symbol: e.target.value }))}
                      placeholder="Traditional totem or village symbol"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Migration Legend</Label>
                    <Textarea
                      value={formData.migration_legend}
                      onChange={(e) => setFormData(prev => ({ ...prev, migration_legend: e.target.value }))}
                      rows={4}
                      placeholder="Stories about how the village was founded or where people migrated from..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Oral Traditions</Label>
                    <Textarea
                      value={formData.oral_traditions}
                      onChange={(e) => setFormData(prev => ({ ...prev, oral_traditions: e.target.value }))}
                      rows={4}
                      placeholder="Traditional stories, proverbs, customs, and practices..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/villages/${villageId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Submitting...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Update Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default VillageEdit;