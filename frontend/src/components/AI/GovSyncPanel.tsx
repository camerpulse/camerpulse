import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Shield, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Key, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Activity,
  Eye,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface GovernmentAgency {
  id: string;
  agency_name: string;
  agency_code: string;
  category: string;
  contact_person_name: string;
  contact_email: string;
  phone_number?: string;
  role_type: string;
  security_clearance: string;
  is_verified: boolean;
  is_active: boolean;
  regions_access: string[];
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

interface AgencyUser {
  id: string;
  user_id: string;
  agency_id: string;
  role_in_agency: string;
  access_level: string;
  is_primary_contact: boolean;
  profiles?: {
    display_name: string;
    email: string;
  };
}

interface AgencyResponse {
  id: string;
  agency_id: string;
  response_type: string;
  title: string;
  content: string;
  verified_status: string;
  visibility: string;
  created_at: string;
  government_agencies: {
    agency_name: string;
    category: string;
  };
}

const GovSyncPanel: React.FC = () => {
  const [agencies, setAgencies] = useState<GovernmentAgency[]>([]);
  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([]);
  const [agencyResponses, setAgencyResponses] = useState<AgencyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewAgencyDialog, setShowNewAgencyDialog] = useState(false);
  const { toast } = useToast();

  // New agency form state
  const [newAgency, setNewAgency] = useState({
    agency_name: '',
    agency_code: '',
    category: '',
    contact_person_name: '',
    contact_email: '',
    phone_number: '',
    role_type: 'observer',
    security_clearance: 'basic',
    regions_access: [] as string[]
  });

  const agencyCategories = [
    { value: 'health', label: 'Ministry of Public Health' },
    { value: 'security', label: 'Ministry of Defence' },
    { value: 'elections', label: 'Elections Committee' },
    { value: 'communication', label: 'Ministry of Communication' },
    { value: 'judiciary', label: 'Ministry of Justice' },
    { value: 'defense', label: 'Ministry of Defence' },
    { value: 'territorial_administration', label: 'Ministry of Territorial Administration' },
    { value: 'education', label: 'Ministry of Education' },
    { value: 'economy', label: 'Ministry of Economy' },
    { value: 'environment', label: 'Ministry of Environment' }
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchAgencies();
    fetchAgencyUsers();
    fetchAgencyResponses();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('government_agencies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch government agencies",
        variant: "destructive"
      });
    }
  };

  const fetchAgencyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('government_agency_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgencyUsers(data || []);
    } catch (error) {
      console.error('Error fetching agency users:', error);
    }
  };

  const fetchAgencyResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('agency_responses')
        .select(`
          *,
          government_agencies (
            agency_name,
            category
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAgencyResponses(data || []);
    } catch (error) {
      console.error('Error fetching agency responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgency = async () => {
    try {
      const { error } = await supabase
        .from('government_agencies')
        .insert([newAgency]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Government agency registered successfully"
      });

      setShowNewAgencyDialog(false);
      setNewAgency({
        agency_name: '',
        agency_code: '',
        category: '',
        contact_person_name: '',
        contact_email: '',
        phone_number: '',
        role_type: 'observer',
        security_clearance: 'basic',
        regions_access: []
      });
      fetchAgencies();
    } catch (error) {
      console.error('Error creating agency:', error);
      toast({
        title: "Error",
        description: "Failed to register agency",
        variant: "destructive"
      });
    }
  };

  const toggleAgencyVerification = async (agencyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('government_agencies')
        .update({ 
          is_verified: !currentStatus,
          approved_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', agencyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Agency ${!currentStatus ? 'verified' : 'unverified'} successfully`
      });

      fetchAgencies();
    } catch (error) {
      console.error('Error updating agency verification:', error);
      toast({
        title: "Error",
        description: "Failed to update agency verification",
        variant: "destructive"
      });
    }
  };

  const generateApiKey = async (agencyId: string) => {
    try {
      // Generate a random API key
      const apiKey = `gov_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      
      const { error } = await supabase
        .from('government_agencies')
        .update({ api_key_hash: apiKey })
        .eq('id', agencyId);

      if (error) throw error;

      toast({
        title: "API Key Generated",
        description: `API Key: ${apiKey}`,
        duration: 10000
      });

      fetchAgencies();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive"
      });
    }
  };

  const getVerificationStats = () => {
    const total = agencies.length;
    const verified = agencies.filter(a => a.is_verified).length;
    const pending = total - verified;
    
    return { total, verified, pending };
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    agencies.forEach(agency => {
      stats[agency.category] = (stats[agency.category] || 0) + 1;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getVerificationStats();
  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Government Sync Panel
          </h2>
          <p className="text-muted-foreground">
            Manage government agency integrations and secure coordination
          </p>
        </div>
        <Dialog open={showNewAgencyDialog} onOpenChange={setShowNewAgencyDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserCheck className="w-4 h-4 mr-2" />
              Register Agency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register Government Agency</DialogTitle>
              <DialogDescription>
                Add a new government agency to the coordination system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency_name">Agency Name</Label>
                  <Input
                    id="agency_name"
                    value={newAgency.agency_name}
                    onChange={(e) => setNewAgency({...newAgency, agency_name: e.target.value})}
                    placeholder="e.g., Ministry of Public Health"
                  />
                </div>
                <div>
                  <Label htmlFor="agency_code">Agency Code</Label>
                  <Input
                    id="agency_code"
                    value={newAgency.agency_code}
                    onChange={(e) => setNewAgency({...newAgency, agency_code: e.target.value})}
                    placeholder="e.g., MINSANTE"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newAgency.category} 
                  onValueChange={(value) => setNewAgency({...newAgency, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency category" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencyCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={newAgency.contact_person_name}
                    onChange={(e) => setNewAgency({...newAgency, contact_person_name: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newAgency.contact_email}
                    onChange={(e) => setNewAgency({...newAgency, contact_email: e.target.value})}
                    placeholder="official@ministry.gov.cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role_type">Role Type</Label>
                  <Select 
                    value={newAgency.role_type} 
                    onValueChange={(value) => setNewAgency({...newAgency, role_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observer">Observer</SelectItem>
                      <SelectItem value="responder">Responder</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="security_clearance">Security Clearance</Label>
                  <Select 
                    value={newAgency.security_clearance} 
                    onValueChange={(value) => setNewAgency({...newAgency, security_clearance: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={createAgency} className="w-full">
                Register Agency
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Agencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{agencyResponses.length}</p>
                <p className="text-xs text-muted-foreground">Recent Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agency Categories</CardTitle>
                <CardDescription>Distribution of registered agencies by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const categoryLabel = agencyCategories.find(c => c.value === category)?.label || category;
                  const percentage = (count / stats.total) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{categoryLabel}</span>
                        <span>{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest agency responses and actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {agencyResponses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{response.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {response.government_agencies.agency_name} • {response.response_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(response.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      response.verified_status === 'verified' ? 'default' :
                      response.verified_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {response.verified_status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agencies" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {agencies.map((agency) => (
              <Card key={agency.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{agency.agency_name}</h3>
                        <Badge variant="outline">{agency.agency_code}</Badge>
                        <Badge variant={agency.is_verified ? 'default' : 'secondary'}>
                          {agency.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span className="capitalize">{agency.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="capitalize">{agency.role_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{agency.contact_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{agency.contact_person_name}</span>
                        </div>
                      </div>

                      {agency.regions_access.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Regions: {agency.regions_access.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAgencyVerification(agency.id, agency.is_verified)}
                      >
                        {agency.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        {agency.is_verified ? 'Revoke' : 'Verify'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateApiKey(agency.id)}
                      >
                        <Key className="h-4 w-4 mr-1" />
                        API Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {agencyResponses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{response.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {response.government_agencies.agency_name} • {response.response_type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          response.verified_status === 'verified' ? 'default' :
                          response.verified_status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {response.verified_status}
                        </Badge>
                        <Badge variant="outline">{response.visibility}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm">{response.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(response.created_at).toLocaleString()}</span>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-3 w-3" />
                        <span>{response.visibility}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure global settings for government agency integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Government Sync Panel is active. All verified agencies receive real-time civic alerts and have secure API access.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-verify">Auto-verify agencies</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically verify agencies with government email domains
                    </p>
                  </div>
                  <Switch id="auto-verify" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="secure-api">Secure API access</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all agency API access
                    </p>
                  </div>
                  <Switch id="secure-api" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="alert-routing">Automated alert routing</Label>
                    <p className="text-sm text-muted-foreground">
                      Route alerts to relevant agencies based on category
                    </p>
                  </div>
                  <Switch id="alert-routing" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovSyncPanel;