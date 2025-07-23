import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserCheck, 
  Shield, 
  MapPin, 
  Plus, 
  Search,
  Settings,
  Activity,
  Users,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface TenderModerator {
  id: string;
  user_id: string;
  assigned_regions: string[];
  assigned_categories: string[];
  permissions: any;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
  activity_log: any;
  performance_metrics: any;
  profiles?: any;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const TENDER_CATEGORIES = [
  'Construction', 'Technology', 'Consulting', 'Equipment', 
  'Maintenance', 'Training', 'Research', 'Healthcare', 'Education'
];

export const TenderModeratorManager: React.FC = () => {
  const [moderators, setModerators] = useState<TenderModerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [newModerator, setNewModerator] = useState({
    email: '',
    regions: [] as string[],
    categories: [] as string[],
    permissions: {
      can_approve: true,
      can_suspend: true,
      can_flag: true,
      can_moderate: true
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_moderators')
        .select(`
          *,
          profiles!tender_moderators_user_id_fkey(display_name, username)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setModerators(data || []);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      toast({
        title: "Error",
        description: "Failed to fetch moderators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddModerator = async () => {
    if (!newModerator.email) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First, find the user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', newModerator.email)
        .single();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      // Add as moderator
      const { error: insertError } = await supabase
        .from('tender_moderators')
        .insert({
          user_id: user.user_id,
          assigned_regions: newModerator.regions,
          assigned_categories: newModerator.categories,
          permissions: newModerator.permissions
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Moderator added successfully",
      });

      setShowAddDialog(false);
      setNewModerator({
        email: '',
        regions: [],
        categories: [],
        permissions: {
          can_approve: true,
          can_suspend: true,
          can_flag: true,
          can_moderate: true
        }
      });
      fetchModerators();
    } catch (error) {
      console.error('Error adding moderator:', error);
      toast({
        title: "Error",
        description: "Failed to add moderator",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (moderatorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('tender_moderators')
        .update({ is_active: !isActive })
        .eq('id', moderatorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Moderator ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchModerators();
    } catch (error) {
      console.error('Error updating moderator:', error);
      toast({
        title: "Error",
        description: "Failed to update moderator status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveModerator = async (moderatorId: string) => {
    try {
      const { error } = await supabase
        .from('tender_moderators')
        .delete()
        .eq('id', moderatorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Moderator removed successfully",
      });

      fetchModerators();
    } catch (error) {
      console.error('Error removing moderator:', error);
      toast({
        title: "Error",
        description: "Failed to remove moderator",
        variant: "destructive",
      });
    }
  };

  const filteredModerators = moderators.filter(mod => {
    const matchesSearch = mod.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || mod.assigned_regions.includes(selectedRegion);
    return matchesSearch && matchesRegion;
  });

  const getActivityStatus = (moderator: TenderModerator) => {
    const daysSinceAssigned = Math.floor(
      (new Date().getTime() - new Date(moderator.assigned_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceAssigned < 7) return { label: 'New', color: 'blue' };
    if (moderator.is_active) return { label: 'Active', color: 'green' };
    return { label: 'Inactive', color: 'gray' };
  };

  if (loading && moderators.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <UserCheck className="h-6 w-6 mr-2 text-cm-red" />
            Tender Moderator Management
          </h2>
          <p className="text-muted-foreground">Manage tender moderators by region and category</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Moderator
        </Button>
      </div>

      <Tabs defaultValue="moderators" className="w-full">
        <TabsList>
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
          <TabsTrigger value="assignments">Regional Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="moderators" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search moderators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Regions</SelectItem>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Moderators List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredModerators.map((moderator) => {
              const status = getActivityStatus(moderator);
              return (
                <Card key={moderator.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">
                              {moderator.profiles?.display_name || 'Unknown User'}
                            </h3>
                            <Badge 
                              variant={status.color === 'green' ? 'default' : 
                                     status.color === 'blue' ? 'secondary' : 'outline'}
                            >
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            @{moderator.profiles?.username}
                          </p>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Regions: {moderator.assigned_regions.length > 0 ? 
                                  moderator.assigned_regions.join(', ') : 'All regions'}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Categories: {moderator.assigned_categories.length > 0 ? 
                                moderator.assigned_categories.join(', ') : 'All categories'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Assigned: {new Date(moderator.assigned_at).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Permissions */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(moderator.permissions).map(([key, value]) => (
                              value && (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key.replace('can_', '').replace('_', ' ')}
                                </Badge>
                              )
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={moderator.is_active ? "outline" : "default"}
                          onClick={() => handleToggleActive(moderator.id, moderator.is_active)}
                        >
                          {moderator.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemoveModerator(moderator.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredModerators.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Moderators Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedRegion ? 'No moderators match your filters.' : 'Add moderators to get started.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Regional Assignments</CardTitle>
              <CardDescription>Overview of moderator assignments by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAMEROON_REGIONS.map(region => {
                  const regionMods = moderators.filter(m => 
                    m.is_active && (m.assigned_regions.includes(region) || m.assigned_regions.length === 0)
                  );
                  return (
                    <div key={region} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{region}</h4>
                      <p className="text-sm text-muted-foreground">
                        {regionMods.length} active moderator{regionMods.length !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-2 space-y-1">
                        {regionMods.slice(0, 3).map(mod => (
                          <div key={mod.id} className="text-xs">
                            {mod.profiles?.display_name}
                          </div>
                        ))}
                        {regionMods.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{regionMods.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Moderator activity and performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{moderators.filter(m => m.is_active).length}</div>
                  <div className="text-sm text-muted-foreground">Active Moderators</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{CAMEROON_REGIONS.length}</div>
                  <div className="text-sm text-muted-foreground">Regions Covered</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(moderators.filter(m => m.is_active).length / CAMEROON_REGIONS.length * 10) / 10}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Mods per Region</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Moderator Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Moderator</DialogTitle>
            <DialogDescription>
              Assign a user as a tender moderator with specific permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User Email/Username</label>
              <Input
                placeholder="Enter user email or username"
                value={newModerator.email}
                onChange={(e) => setNewModerator(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assigned Regions</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {CAMEROON_REGIONS.map(region => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={newModerator.regions.includes(region)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewModerator(prev => ({
                            ...prev,
                            regions: [...prev.regions, region]
                          }));
                        } else {
                          setNewModerator(prev => ({
                            ...prev,
                            regions: prev.regions.filter(r => r !== region)
                          }));
                        }
                      }}
                    />
                    <label htmlFor={region} className="text-sm">{region}</label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for all regions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="space-y-2">
                {Object.entries(newModerator.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => {
                        setNewModerator(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [key]: !!checked
                          }
                        }));
                      }}
                    />
                    <label htmlFor={key} className="text-sm">
                      {key.replace('can_', '').replace('_', ' ').charAt(0).toUpperCase() + 
                       key.replace('can_', '').replace('_', ' ').slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModerator}>
              Add Moderator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};