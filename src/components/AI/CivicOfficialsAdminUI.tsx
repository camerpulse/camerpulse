import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users,
  UserCheck,
  Building2,
  Shield,
  Edit,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  History,
  Flag,
  Trash2,
  Settings,
  Image as ImageIcon,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  FileText,
  Star,
  Ban,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Official {
  id: string;
  name: string;
  role_title?: string;
  level_of_office?: string;
  region?: string;
  constituency?: string;
  ministry?: string;
  political_party_id?: string;
  bio?: string;
  profile_image_url?: string;
  contact_phone?: string;
  contact_website?: string;
  birth_date?: string;
  education?: string;
  career_background?: string;
  verified?: boolean;
  has_fallback_data?: boolean;
  flagged_for_review?: boolean;
  image_verified?: boolean;
  data_source?: string;
  last_synced?: string;
  created_at: string;
  updated_at: string;
  hidden_from_public?: boolean;
  edit_locked?: boolean;
  civic_score?: number;
  average_rating?: number;
  total_ratings?: number;
  follower_count?: number;
}

interface Party {
  id: string;
  name: string;
  acronym: string;
  description?: string;
  logo_url?: string;
  founded_date?: string;
  headquarters?: string;
  website?: string;
  verified?: boolean;
  logo_verified?: boolean;
  has_fallback_data?: boolean;
  flagged_for_review?: boolean;
  created_at: string;
  updated_at: string;
}

interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  source: string;
  performed_by?: string;
  created_at: string;
  metadata?: any;
}

export const CivicOfficialsAdminUI: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedTab, setSelectedTab] = useState('politicians');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showSyncLogs, setShowSyncLogs] = useState(false);

  // Load officials data
  const { data: officials = [], isLoading: loadingOfficials } = useQuery({
    queryKey: ['admin_officials', selectedTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Load parties data
  const { data: parties = [], isLoading: loadingParties } = useQuery({
    queryKey: ['admin_parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Party[];
    },
    enabled: selectedTab === 'parties'
  });

  // Load sync logs - simplified for now
  const { data: syncLogs = [] } = useQuery({
    queryKey: ['sync_logs', selectedOfficial?.id || selectedParty?.id],
    queryFn: async () => {
      if (!selectedOfficial && !selectedParty) return [];
      
      // For now, return empty array - can be enhanced later with proper sync log structure
      return [] as SyncLog[];
    },
    enabled: showSyncLogs && (!!selectedOfficial || !!selectedParty)
  });

  // Filter officials
  const filteredOfficials = officials.filter((official: any) => {
    const matchesSearch = official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         official.role_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || official.level_of_office === roleFilter;
    const matchesRegion = regionFilter === 'all' || official.region === regionFilter;
    const matchesParty = partyFilter === 'all' || official.political_party_id === partyFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && official.verified) ||
      (statusFilter === 'unverified' && !official.verified) ||
      (statusFilter === 'flagged' && official.flagged_for_review) ||
      (statusFilter === 'fallback' && official.has_fallback_data) ||
      (statusFilter === 'missing_photo' && (!official.profile_image_url || official.profile_image_url.includes('placeholder')));
    
    return matchesSearch && matchesRole && matchesRegion && matchesParty && matchesStatus;
  });

  // Filter parties
  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.acronym?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && party.verified) ||
      (statusFilter === 'unverified' && !party.verified) ||
      (statusFilter === 'flagged' && party.flagged_for_review) ||
      (statusFilter === 'fallback' && party.has_fallback_data);
    
    return matchesSearch && matchesStatus;
  });

  // Update official mutation
  const updateOfficialMutation = useMutation({
    mutationFn: async (updates: Partial<Official>) => {
      if (!selectedOfficial) throw new Error('No official selected');
      
      const { error } = await supabase
        .from('politicians')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOfficial.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Official updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_officials'] });
      setEditMode(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update official', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Update party mutation
  const updatePartyMutation = useMutation({
    mutationFn: async (updates: Partial<Party>) => {
      if (!selectedParty) throw new Error('No party selected');
      
      const { error } = await supabase
        .from('political_parties')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedParty.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Party updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_parties'] });
      setEditMode(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update party', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Force sync mutation
  const forceSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('civic-auto-sync-engine', {
        body: { action: 'execute_sync_cycle' }
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Sync completed successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_officials'] });
      queryClient.invalidateQueries({ queryKey: ['admin_parties'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Sync failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleSaveChanges = () => {
    if (selectedOfficial) {
      updateOfficialMutation.mutate(selectedOfficial);
    } else if (selectedParty) {
      updatePartyMutation.mutate(selectedParty);
    }
  };

  const getStatusBadge = (official: any) => {
    if (official.flagged_for_review) return <Badge variant="destructive">Flagged</Badge>;
    if (official.verified) return <Badge variant="default">Verified</Badge>;
    if (official.has_fallback_data) return <Badge variant="secondary">Fallback</Badge>;
    return <Badge variant="outline">Unverified</Badge>;
  };

  const getPartyStatusBadge = (party: Party) => {
    if (party.flagged_for_review) return <Badge variant="destructive">Flagged</Badge>;
    if (party.verified) return <Badge variant="default">Verified</Badge>;
    if (party.has_fallback_data) return <Badge variant="secondary">Fallback</Badge>;
    return <Badge variant="outline">Unverified</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Civic Officials Admin
          </h2>
          <p className="text-muted-foreground">
            Complete management and control of all civic officials and political parties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => forceSyncMutation.mutate()}
            disabled={forceSyncMutation.isPending}
          >
            {forceSyncMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Force Sync
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search officials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {selectedTab !== 'parties' && (
              <div>
                <Label>Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="minister">Ministers</SelectItem>
                    <SelectItem value="senate">Senators</SelectItem>
                    <SelectItem value="national_assembly">MPs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Adamawa">Adamawa</SelectItem>
                  <SelectItem value="Centre">Centre</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="Far North">Far North</SelectItem>
                  <SelectItem value="Littoral">Littoral</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="Northwest">Northwest</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="fallback">Fallback Data</SelectItem>
                  <SelectItem value="missing_photo">Missing Photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setRegionFilter('all');
                  setPartyFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="politicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Officials
          </TabsTrigger>
          <TabsTrigger value="ministers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Ministers
          </TabsTrigger>
          <TabsTrigger value="senators" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Senators
          </TabsTrigger>
          <TabsTrigger value="mps" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            MPs
          </TabsTrigger>
          <TabsTrigger value="parties" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Parties
          </TabsTrigger>
        </TabsList>

        {/* Officials Lists */}
        {['politicians', 'ministers', 'senators', 'mps'].includes(selectedTab) && (
          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid gap-4">
              {loadingOfficials ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading officials...</span>
                  </CardContent>
                </Card>
              ) : filteredOfficials.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No officials found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOfficials.map((official: any) => (
                  <Card key={official.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={official.profile_image_url} />
                            <AvatarFallback>
                              {official.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{official.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {official.role_title} • {official.region}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(official)}
                              {official.political_party_id && (
                                <Badge variant="outline">
                                  Party Member
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {official.hidden_from_public && (
                            <Badge variant="outline">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                          {official.edit_locked && (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOfficial(official)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Edit className="h-5 w-5" />
                                  Edit Official: {selectedOfficial?.name}
                                </DialogTitle>
                              </DialogHeader>
                              
                              {selectedOfficial && (
                                <div className="space-y-6">
                                  {/* Basic Information */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <Label>Full Name</Label>
                                      <Input
                                        value={selectedOfficial.name}
                                        onChange={(e) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          name: e.target.value
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Role/Title</Label>
                                      <Input
                                        value={selectedOfficial.role_title || ''}
                                        onChange={(e) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          role_title: e.target.value
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Region</Label>
                                      <Select
                                        value={selectedOfficial.region || ''}
                                        onValueChange={(value) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          region: value
                                        })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Adamawa">Adamawa</SelectItem>
                                          <SelectItem value="Centre">Centre</SelectItem>
                                          <SelectItem value="East">East</SelectItem>
                                          <SelectItem value="Far North">Far North</SelectItem>
                                          <SelectItem value="Littoral">Littoral</SelectItem>
                                          <SelectItem value="North">North</SelectItem>
                                          <SelectItem value="Northwest">Northwest</SelectItem>
                                          <SelectItem value="South">South</SelectItem>
                                          <SelectItem value="Southwest">Southwest</SelectItem>
                                          <SelectItem value="West">West</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Office Level</Label>
                                      <Select
                                        value={selectedOfficial.level_of_office || ''}
                                        onValueChange={(value) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          level_of_office: value
                                        } as Official)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select office level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="minister">Minister</SelectItem>
                                          <SelectItem value="senate">Senator</SelectItem>
                                          <SelectItem value="national_assembly">MP</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Biography */}
                                  <div>
                                    <Label>Biography</Label>
                                    <Textarea
                                      value={selectedOfficial.bio || ''}
                                      onChange={(e) => setSelectedOfficial({
                                        ...selectedOfficial,
                                        bio: e.target.value
                                      })}
                                      rows={4}
                                    />
                                  </div>

                                  {/* Contact Information */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <Label>Phone</Label>
                                      <Input
                                        value={selectedOfficial.contact_phone || ''}
                                        onChange={(e) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          contact_phone: e.target.value
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Website</Label>
                                      <Input
                                        value={selectedOfficial.contact_website || ''}
                                        onChange={(e) => setSelectedOfficial({
                                          ...selectedOfficial,
                                          contact_website: e.target.value
                                        })}
                                      />
                                    </div>
                                  </div>

                                  {/* Status Toggles */}
                                  <div className="space-y-4">
                                    <h3 className="font-semibold">Status & Verification</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="flex items-center justify-between">
                                        <Label>Verified Official</Label>
                                        <Switch
                                          checked={selectedOfficial.verified || false}
                                          onCheckedChange={(checked) => setSelectedOfficial({
                                            ...selectedOfficial,
                                            verified: checked
                                          } as Official)}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label>Image Verified</Label>
                                        <Switch
                                          checked={selectedOfficial.image_verified || false}
                                          onCheckedChange={(checked) => setSelectedOfficial({
                                            ...selectedOfficial,
                                            image_verified: checked
                                          })}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label>Flagged for Review</Label>
                                        <Switch
                                          checked={selectedOfficial.flagged_for_review || false}
                                          onCheckedChange={(checked) => setSelectedOfficial({
                                            ...selectedOfficial,
                                            flagged_for_review: checked
                                          })}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label>Hidden from Public</Label>
                                        <Switch
                                          checked={selectedOfficial.hidden_from_public || false}
                                          onCheckedChange={(checked) => setSelectedOfficial({
                                            ...selectedOfficial,
                                            hidden_from_public: checked
                                          })}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label>Edit Locked</Label>
                                        <Switch
                                          checked={selectedOfficial.edit_locked || false}
                                          onCheckedChange={(checked) => setSelectedOfficial({
                                            ...selectedOfficial,
                                            edit_locked: checked
                                          })}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sync Information */}
                                  {selectedOfficial.last_synced && (
                                    <div>
                                      <h3 className="font-semibold mb-2">Sync Information</h3>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Data Source: {selectedOfficial.data_source || 'Manual'}</p>
                                        <p>Last Synced: {new Date(selectedOfficial.last_synced).toLocaleString()}</p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setShowSyncLogs(true)}
                                        >
                                          <History className="h-4 w-4 mr-2" />
                                          View Sync Logs
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedOfficial(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleSaveChanges}
                                      disabled={updateOfficialMutation.isPending}
                                    >
                                      {updateOfficialMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                      )}
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}

        {/* Parties Tab */}
        <TabsContent value="parties" className="space-y-4">
          <div className="grid gap-4">
            {loadingParties ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading parties...</span>
                </CardContent>
              </Card>
            ) : filteredParties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No parties found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                </CardContent>
              </Card>
            ) : (
              filteredParties.map((party) => (
                <Card key={party.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={party.logo_url} />
                          <AvatarFallback>
                            {party.acronym || party.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{party.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {party.acronym} • Founded: {party.founded_date || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getPartyStatusBadge(party)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedParty(party)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Edit Party: {selectedParty?.name}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedParty && (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <Label>Party Name</Label>
                                    <Input
                                      value={selectedParty.name}
                                      onChange={(e) => setSelectedParty({
                                        ...selectedParty,
                                        name: e.target.value
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Acronym</Label>
                                    <Input
                                      value={selectedParty.acronym || ''}
                                      onChange={(e) => setSelectedParty({
                                        ...selectedParty,
                                        acronym: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={selectedParty.description || ''}
                                    onChange={(e) => setSelectedParty({
                                      ...selectedParty,
                                      description: e.target.value
                                    })}
                                    rows={3}
                                  />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <Label>Founded Date</Label>
                                    <Input
                                      type="date"
                                      value={selectedParty.founded_date || ''}
                                      onChange={(e) => setSelectedParty({
                                        ...selectedParty,
                                        founded_date: e.target.value
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Website</Label>
                                    <Input
                                      value={selectedParty.website || ''}
                                      onChange={(e) => setSelectedParty({
                                        ...selectedParty,
                                        website: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h3 className="font-semibold">Status & Verification</h3>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center justify-between">
                                      <Label>Verified Party</Label>
                                      <Switch
                                        checked={selectedParty.verified || false}
                                        onCheckedChange={(checked) => setSelectedParty({
                                          ...selectedParty,
                                          verified: checked
                                        })}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Label>Logo Verified</Label>
                                      <Switch
                                        checked={selectedParty.logo_verified || false}
                                        onCheckedChange={(checked) => setSelectedParty({
                                          ...selectedParty,
                                          logo_verified: checked
                                        })}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Label>Flagged for Review</Label>
                                      <Switch
                                        checked={selectedParty.flagged_for_review || false}
                                        onCheckedChange={(checked) => setSelectedParty({
                                          ...selectedParty,
                                          flagged_for_review: checked
                                        })}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedParty(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSaveChanges}
                                    disabled={updatePartyMutation.isPending}
                                  >
                                    {updatePartyMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};