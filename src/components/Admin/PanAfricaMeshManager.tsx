import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Plus, 
  Zap, 
  Activity, 
  BarChart3, 
  AlertTriangle,
  Shield,
  Map,
  RotateCcw,
  Flag,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Bell,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeshNode {
  id: string;
  country_code: string;
  country_name: string;
  flag_emoji: string;
  region: string;
  mesh_status: string;
  data_quality_score: number;
  last_sync_at: string;
  ministers_count: number;
  parties_count: number;
  legislators_count: number;
  civic_issues_count: number;
}

interface MeshAlert {
  id: string;
  alert_type: string;
  affected_countries: string[];
  alert_title: string;
  severity_level: string;
  created_at: string;
  status: string;
}

interface CrossBorderAnalytic {
  id: string;
  analysis_type: string;
  countries_analyzed: string[];
  urgency_level: string;
  confidence_score: number;
  created_at: string;
}

const PanAfricaMeshManager = () => {
  const [meshData, setMeshData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountryData, setNewCountryData] = useState({
    country_code: '',
    country_name: '',
    flag_emoji: '',
    region: '',
    primary_language: 'en',
    currency_code: '',
    capital_city: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMeshData();
  }, []);

  const loadMeshData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pan-africa-mesh-manager', {
        body: { operation: 'get_mesh_overview' }
      });

      if (error) throw error;
      setMeshData(data);
    } catch (error) {
      console.error('Error loading mesh data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load Pan-African mesh data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCountryNode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('pan-africa-mesh-manager', {
        body: { 
          operation: 'add_country_node',
          payload: newCountryData
        }
      });

      if (error) throw error;

      toast({
        title: "Country Added",
        description: `${newCountryData.country_name} has been added to the mesh.`,
        variant: "default"
      });

      setShowAddCountry(false);
      setNewCountryData({
        country_code: '',
        country_name: '',
        flag_emoji: '',
        region: '',
        primary_language: 'en',
        currency_code: '',
        capital_city: ''
      });
      loadMeshData();
    } catch (error) {
      console.error('Error adding country:', error);
      toast({
        title: "Add Country Failed",
        description: "Failed to add country to mesh.",
        variant: "destructive"
      });
    }
  };

  const updateNodeStatus = async (countryCode: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('pan-africa-mesh-manager', {
        body: { 
          operation: 'update_node_status',
          payload: { country_code: countryCode, mesh_status: status }
        }
      });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Node status updated to ${status}.`,
        variant: "default"
      });

      loadMeshData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update node status.",
        variant: "destructive"
      });
    }
  };

  const syncCountryData = async (countryCode: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('pan-africa-mesh-manager', {
        body: { 
          operation: 'sync_country_data',
          payload: { 
            country_code: countryCode, 
            sync_operations: ['ministers', 'parties', 'legislators', 'civic_issues']
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Completed",
        description: `Data sync completed for ${countryCode}.`,
        variant: "default"
      });

      loadMeshData();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync country data.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerCrossBorderAnalysis = async (analysisType: string) => {
    try {
      const activeCountries = meshData?.countries
        ?.filter((c: MeshNode) => c.mesh_status === 'active')
        ?.map((c: MeshNode) => c.country_code) || [];

      const { error } = await supabase.functions.invoke('pan-africa-mesh-manager', {
        body: { 
          operation: 'trigger_cross_border_analysis',
          payload: { 
            analysis_type: analysisType,
            countries: activeCountries,
            region_scope: 'continental'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis Started",
        description: `Cross-border ${analysisType} analysis initiated.`,
        variant: "default"
      });

      loadMeshData();
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to trigger cross-border analysis.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'maintenance': return 'bg-secondary text-secondary-foreground';
      case 'disabled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Pan-African Mesh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Pan-African Civic Mesh (PACME)</h1>
              <p className="text-emerald-100">Continental civic intelligence network management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-white/10 border-white/20 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Mesh Status: {meshData?.mesh_status?.mesh_health || 'Unknown'}
            </Badge>
            <Dialog open={showAddCountry} onOpenChange={setShowAddCountry}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Country to Mesh</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country_code">Country Code</Label>
                      <Input
                        id="country_code"
                        placeholder="e.g., ZM"
                        value={newCountryData.country_code}
                        onChange={(e) => setNewCountryData({...newCountryData, country_code: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country_name">Country Name</Label>
                      <Input
                        id="country_name"
                        placeholder="e.g., Zambia"
                        value={newCountryData.country_name}
                        onChange={(e) => setNewCountryData({...newCountryData, country_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flag_emoji">Flag Emoji</Label>
                      <Input
                        id="flag_emoji"
                        placeholder="🇿🇲"
                        value={newCountryData.flag_emoji}
                        onChange={(e) => setNewCountryData({...newCountryData, flag_emoji: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Select 
                        value={newCountryData.region} 
                        onValueChange={(value) => setNewCountryData({...newCountryData, region: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="West Africa">West Africa</SelectItem>
                          <SelectItem value="East Africa">East Africa</SelectItem>
                          <SelectItem value="Central Africa">Central Africa</SelectItem>
                          <SelectItem value="Southern Africa">Southern Africa</SelectItem>
                          <SelectItem value="North Africa">North Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency_code">Currency Code</Label>
                      <Input
                        id="currency_code"
                        placeholder="e.g., ZMW"
                        value={newCountryData.currency_code}
                        onChange={(e) => setNewCountryData({...newCountryData, currency_code: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="capital_city">Capital City</Label>
                      <Input
                        id="capital_city"
                        placeholder="e.g., Lusaka"
                        value={newCountryData.capital_city}
                        onChange={(e) => setNewCountryData({...newCountryData, capital_city: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={addCountryNode} className="w-full">
                    Add to Mesh
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Countries</p>
                <p className="text-2xl font-bold">{meshData?.mesh_status?.total_countries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Active Nodes</p>
                <p className="text-2xl font-bold">{meshData?.mesh_status?.active_countries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Pending Syncs</p>
                <p className="text-2xl font-bold">{meshData?.mesh_status?.pending_syncs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Active Alerts</p>
                <p className="text-2xl font-bold">{meshData?.mesh_status?.active_alerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nodes">Mesh Nodes</TabsTrigger>
          <TabsTrigger value="analytics">Cross-Border Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Mesh Alerts</TabsTrigger>
          <TabsTrigger value="regional">Regional Insights</TabsTrigger>
          <TabsTrigger value="sync">Sync Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Civic Mesh Nodes</h3>
            <Button onClick={() => loadMeshData()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meshData?.countries?.map((node: MeshNode) => (
              <Card key={node.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{node.flag_emoji}</span>
                      <div>
                        <CardTitle className="text-base">{node.country_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{node.region}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(node.mesh_status)}>
                      {node.mesh_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Ministers: {node.ministers_count}</div>
                    <div>Parties: {node.parties_count}</div>
                    <div>Legislators: {node.legislators_count}</div>
                    <div>Issues: {node.civic_issues_count}</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Quality</span>
                      <span>{Math.round((node.data_quality_score || 0) * 100)}%</span>
                    </div>
                    <Progress value={(node.data_quality_score || 0) * 100} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => syncCountryData(node.country_code)}
                      disabled={isSyncing}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateNodeStatus(
                        node.country_code, 
                        node.mesh_status === 'active' ? 'maintenance' : 'active'
                      )}
                    >
                      {node.mesh_status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cross-Border Analytics</h3>
            <div className="flex space-x-2">
              <Button 
                onClick={() => triggerCrossBorderAnalysis('sentiment_comparison')}
                variant="outline" 
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Sentiment Analysis
              </Button>
              <Button 
                onClick={() => triggerCrossBorderAnalysis('corruption_signals')}
                variant="outline" 
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Corruption Analysis
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {meshData?.analytics?.map((analysis: CrossBorderAnalytic) => (
              <Card key={analysis.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{analysis.analysis_type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-muted-foreground">
                          {analysis.countries_analyzed.length} countries analyzed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getSeverityColor(analysis.urgency_level)}>
                        {analysis.urgency_level}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {Math.round(analysis.confidence_score * 100)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Countries: {analysis.countries_analyzed.join(', ')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Mesh Alerts</h3>
          </div>

          <div className="space-y-4">
            {meshData?.alerts?.map((alert: MeshAlert) => (
              <Alert key={alert.id} className="border-l-4 border-l-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{alert.alert_title}</h4>
                    <Badge className={getSeverityColor(alert.severity_level)}>
                      {alert.severity_level}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    Affected: {alert.affected_countries.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <h3 className="text-lg font-semibold">Regional Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(meshData?.regional_breakdown || {}).map(([region, data]: [string, any]) => (
              <Card key={region}>
                <CardHeader>
                  <CardTitle className="text-base">{region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Countries:</span>
                      <span className="font-semibold">{data.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Nodes:</span>
                      <span className="font-semibold text-success">{data.active}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Activity Rate</span>
                        <span>{Math.round((data.active / data.total) * 100)}%</span>
                      </div>
                      <Progress value={(data.active / data.total) * 100} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.countries?.map((country: MeshNode) => (
                        <span key={country.country_code} className="text-lg">
                          {country.flag_emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <h3 className="text-lg font-semibold">Synchronization Status</h3>
          
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Next scheduled sync: Every 6 hours for high-priority countries, 12 hours for medium priority.
              Manual syncs can be triggered from the Mesh Nodes tab.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PanAfricaMeshManager;