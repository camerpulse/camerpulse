import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye,
  EyeOff,
  Shield,
  Users,
  MapPin,
  Settings,
  History,
  Monitor,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  RotateCcw,
  Search,
  Filter,
  Download,
  Zap,
  FileText,
  Activity
} from 'lucide-react';

interface ModuleVisibility {
  id: string;
  module_name: string;
  module_description: string;
  is_public_visible: boolean;
  enabled_for_roles: string[];
  region_restrictions: string[];
  custom_settings: any;
  updated_at: string;
}

interface VisibilityAudit {
  id: string;
  module_name: string;
  action_type: string;
  previous_state: any;
  new_state: any;
  affected_regions: string[];
  changed_by: string;
  change_reason: string;
  created_at: string;
}

interface PreviewSettings {
  role: 'citizen' | 'analyst' | 'admin' | 'gov_partner';
  region: string;
}

const CivicViewControlPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [modules, setModules] = useState<ModuleVisibility[]>([]);
  const [auditLogs, setAuditLogs] = useState<VisibilityAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    role: 'citizen',
    region: 'Centre'
  });
  const [previewModules, setPreviewModules] = useState<any[]>([]);
  
  // Edit dialog state
  const [editingModule, setEditingModule] = useState<ModuleVisibility | null>(null);
  const [editForm, setEditForm] = useState({
    is_public_visible: true,
    enabled_for_roles: [] as string[],
    region_restrictions: [] as string[],
    change_reason: ''
  });

  const availableRoles = [
    { value: 'citizen', label: '👤 Citizen', description: 'Public Portal View only' },
    { value: 'analyst', label: '🧠 Analyst', description: 'Extended metrics, no red buttons' },
    { value: 'admin', label: '👑 Admin', description: 'Full control, alert triggers, report publishing' },
    { value: 'gov_partner', label: '🛰️ Gov Partner', description: 'Partial data + export' }
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    if (user) {
      checkAuthorization();
      loadModuleSettings();
      loadAuditLogs();
    }
  }, [user]);

  const checkAuthorization = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (data && data.role === 'admin') {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_module_visibility')
        .select('*')
        .order('module_name');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading module settings:', error);
      toast({
        title: "Error",
        description: "Failed to load module settings",
        variant: "destructive"
      });
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_visibility_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const toggleModuleVisibility = async (moduleId: string, currentVisibility: boolean) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      const newVisibility = !currentVisibility;
      
      // Update the module
      const { error } = await supabase
        .from('civic_module_visibility')
        .update({ 
          is_public_visible: newVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;

      // Log the change
      await supabase
        .from('civic_visibility_audit')
        .insert({
          module_name: module.module_name,
          action_type: newVisibility ? 'enabled' : 'disabled',
          previous_state: { is_public_visible: currentVisibility },
          new_state: { is_public_visible: newVisibility },
          changed_by: user?.id,
          change_reason: `Quick toggle: ${newVisibility ? 'Enabled' : 'Disabled'} public visibility`
        });

      toast({
        title: `Module ${newVisibility ? 'Enabled' : 'Disabled'}`,
        description: `${module.module_name} is now ${newVisibility ? 'visible to' : 'hidden from'} the public`,
        variant: newVisibility ? "default" : "destructive"
      });

      loadModuleSettings();
      loadAuditLogs();
    } catch (error) {
      console.error('Error toggling module visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update module visibility",
        variant: "destructive"
      });
    }
  };

  const updateModuleSettings = async () => {
    if (!editingModule) return;

    try {
      const { error } = await supabase
        .from('civic_module_visibility')
        .update({
          is_public_visible: editForm.is_public_visible,
          enabled_for_roles: editForm.enabled_for_roles,
          region_restrictions: editForm.region_restrictions,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingModule.id);

      if (error) throw error;

      // Log the detailed change
      await supabase
        .from('civic_visibility_audit')
        .insert({
          module_name: editingModule.module_name,
          action_type: 'settings_updated',
          previous_state: {
            is_public_visible: editingModule.is_public_visible,
            enabled_for_roles: editingModule.enabled_for_roles,
            region_restrictions: editingModule.region_restrictions
          },
          new_state: {
            is_public_visible: editForm.is_public_visible,
            enabled_for_roles: editForm.enabled_for_roles,
            region_restrictions: editForm.region_restrictions
          },
          affected_regions: editForm.region_restrictions,
          changed_by: user?.id,
          change_reason: editForm.change_reason || 'Settings updated via control panel'
        });

      toast({
        title: "Settings Updated",
        description: `Module settings for ${editingModule.module_name} have been updated`
      });

      setEditingModule(null);
      loadModuleSettings();
      loadAuditLogs();
    } catch (error) {
      console.error('Error updating module settings:', error);
      toast({
        title: "Error",
        description: "Failed to update module settings",
        variant: "destructive"
      });
    }
  };

  const loadPreview = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_module_visibility', {
          p_user_role: previewSettings.role,
          p_region: previewSettings.region
        });

      if (error) throw error;
      setPreviewModules(data || []);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (module: ModuleVisibility) => {
    setEditingModule(module);
    setEditForm({
      is_public_visible: module.is_public_visible,
      enabled_for_roles: module.enabled_for_roles,
      region_restrictions: module.region_restrictions,
      change_reason: ''
    });
  };

  const getModuleIcon = (moduleName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      civic_feed: <Activity className="h-4 w-4" />,
      fusion_core: <Zap className="h-4 w-4" />,
      trust_index: <Shield className="h-4 w-4" />,
      promise_tracker: <CheckCircle className="h-4 w-4" />,
      red_room_alerts: <AlertTriangle className="h-4 w-4" />,
      regional_sentiment: <MapPin className="h-4 w-4" />,
      trending_topics: <Activity className="h-4 w-4" />,
      insider_feed: <Lock className="h-4 w-4" />,
      sentiment_ledger: <FileText className="h-4 w-4" />,
      disinformation_shield: <Shield className="h-4 w-4" />,
      election_monitoring: <Eye className="h-4 w-4" />,
      civic_reports: <FileText className="h-4 w-4" />
    };
    
    return iconMap[moduleName] || <Settings className="h-4 w-4" />;
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.module_description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || module.enabled_for_roles.includes(filterRole);
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">🔒 ACCESS DENIED</h3>
          <p className="text-muted-foreground">
            This control panel is restricted to system administrators only.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Monitor className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">🔧 CIVIC VIEW CONTROL PANEL</h1>
                <p className="text-blue-100">Dynamic Public Portal Visibility Management</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Admin: {user?.email}</div>
              <div className="text-xs text-blue-300">Last Update: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">
            <Settings className="h-4 w-4 mr-2" />
            Module Control
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Monitor className="h-4 w-4 mr-2" />
            Preview Portal
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="h-4 w-4 mr-2" />
            Role Definitions
          </TabsTrigger>
        </TabsList>

        {/* Module Control Tab */}
        <TabsContent value="modules" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {availableRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className={`transition-all duration-200 ${
                module.is_public_visible 
                  ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                  : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModuleIcon(module.module_name)}
                      <CardTitle className="text-sm font-medium">
                        {module.module_name.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={module.is_public_visible}
                        onCheckedChange={() => toggleModuleVisibility(module.id, module.is_public_visible)}
                      />
                      {module.is_public_visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3">
                    {module.module_description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Public Visible:</span>
                      <Badge variant={module.is_public_visible ? "default" : "destructive"}>
                        {module.is_public_visible ? "YES" : "NO"}
                      </Badge>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-muted-foreground">Roles: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {module.enabled_for_roles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {module.region_restrictions.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Restricted: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {module.region_restrictions.map(region => (
                            <Badge key={region} variant="destructive" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(module)}
                    className="w-full mt-3"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Preview Portal Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Public Portal Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">User Role</label>
                    <Select 
                      value={previewSettings.role} 
                      onValueChange={(value: any) => setPreviewSettings(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Region</label>
                    <Select 
                      value={previewSettings.region} 
                      onValueChange={(value) => setPreviewSettings(prev => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cameroonRegions.map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={loadPreview} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Portal for {previewSettings.role} in {previewSettings.region}
                </Button>
                
                {previewModules.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-semibold mb-3">Visible Modules for Preview Settings:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {previewModules.map((module, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${module.is_visible ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm ${module.is_visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                            {module.module_name.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {previewModules.filter(m => !m.is_visible).length > 0 && (
                      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            This section is temporarily restricted by administrative control. For access, contact civic@camerpulse.org.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Visibility Change Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {log.module_name.replace(/_/g, ' ').toUpperCase()} - {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.change_reason || 'No reason provided'}
                        </div>
                        {log.affected_regions.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Affected regions: {log.affected_regions.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Definitions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRoles.map((role) => (
              <Card key={role.value}>
                <CardHeader>
                  <CardTitle className="text-lg">{role.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Typical Access:</h4>
                    <div className="text-xs space-y-1">
                      {role.value === 'citizen' && (
                        <>
                          <div>• Civic Feed - Timeline view only</div>
                          <div>• Promise Tracker - Full access</div>
                          <div>• Regional Sentiment - Summary view</div>
                          <div>• Civic Reports - Submit and view</div>
                        </>
                      )}
                      {role.value === 'analyst' && (
                        <>
                          <div>• All Citizen access plus:</div>
                          <div>• Fusion Core - Full metrics</div>
                          <div>• Sentiment Ledger - Complete logs</div>
                          <div>• Red Room Alerts - Read only</div>
                        </>
                      )}
                      {role.value === 'admin' && (
                        <>
                          <div>• Full system access</div>
                          <div>• Red Room Command Center</div>
                          <div>• All control panels</div>
                          <div>• Emergency alert triggers</div>
                        </>
                      )}
                      {role.value === 'gov_partner' && (
                        <>
                          <div>• Institutional data access</div>
                          <div>• Report export capabilities</div>
                          <div>• Insider feed (optional)</div>
                          <div>• Election monitoring</div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configure {editingModule?.module_name.replace(/_/g, ' ').toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          
          {editingModule && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.is_public_visible}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_public_visible: checked }))}
                />
                <label className="text-sm font-medium">Visible to Public</label>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Enabled for Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map(role => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.enabled_for_roles.includes(role.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm(prev => ({
                              ...prev,
                              enabled_for_roles: [...prev.enabled_for_roles, role.value]
                            }));
                          } else {
                            setEditForm(prev => ({
                              ...prev,
                              enabled_for_roles: prev.enabled_for_roles.filter(r => r !== role.value)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label className="text-xs">{role.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Region Restrictions (Hide from these regions)</label>
                <div className="grid grid-cols-2 gap-2">
                  {cameroonRegions.map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.region_restrictions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm(prev => ({
                              ...prev,
                              region_restrictions: [...prev.region_restrictions, region]
                            }));
                          } else {
                            setEditForm(prev => ({
                              ...prev,
                              region_restrictions: prev.region_restrictions.filter(r => r !== region)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label className="text-xs">{region}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Change Reason</label>
                <Textarea
                  value={editForm.change_reason}
                  onChange={(e) => setEditForm(prev => ({ ...prev, change_reason: e.target.value }))}
                  placeholder="Describe why you're making this change..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={updateModuleSettings} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingModule(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CivicViewControlPanel;