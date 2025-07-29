import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Database,
  Play,
  TrendingUp
} from "lucide-react";

interface SyncGuardStatus {
  active_modules: number;
  skipped_duplicates: number;
  auto_upgraded: number;
  last_scan: string;
  status: string;
  recent_logs: any[];
  recent_conflicts: any[];
  configuration: any[];
}

interface ConflictScanResult {
  conflicts: any[];
  recommendations: any[];
  can_proceed: boolean;
  scan_timestamp: string;
}

export const AshenSyncGuard: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncGuardStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Conflict scanning state
  const [scanFeatureName, setScanFeatureName] = useState('');
  const [scanFeatureType, setScanFeatureType] = useState('component');
  const [scanDescription, setScanDescription] = useState('');
  const [scanResults, setScanResults] = useState<ConflictScanResult | null>(null);
  
  // Feature registration state
  const [registerFeatureName, setRegisterFeatureName] = useState('');
  const [registerFeatureType, setRegisterFeatureType] = useState('component');
  const [registerVersion, setRegisterVersion] = useState('v1.0');
  const [registerDescription, setRegisterDescription] = useState('');
  const [registerFilePaths, setRegisterFilePaths] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadSyncGuardStatus();
  }, []);

  const loadSyncGuardStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: { action: 'get_status' }
      });

      if (error) throw error;

      setSyncStatus(data);
      setLastRefresh(new Date());
      
      toast({
        title: "Sync Guard Status Updated",
        description: "System status refreshed successfully",
      });
    } catch (error) {
      console.error('Error loading sync status:', error);
      toast({
        title: "Status Load Failed",
        description: "Could not load Sync Guard status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scanForConflicts = async () => {
    if (!scanFeatureName.trim()) {
      toast({
        title: "Feature Name Required",
        description: "Please enter a feature name to scan for conflicts",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: {
          action: 'scan_conflicts',
          feature_name: scanFeatureName,
          feature_type: scanFeatureType,
          description: scanDescription
        }
      });

      if (error) throw error;

      setScanResults(data.scan_result);
      
      const conflictCount = data.scan_result.conflicts?.length || 0;
      toast({
        title: conflictCount > 0 ? "Conflicts Detected" : "No Conflicts Found",
        description: conflictCount > 0 
          ? `Found ${conflictCount} potential conflicts`
          : "Feature can be built safely",
        variant: conflictCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Error scanning for conflicts:', error);
      toast({
        title: "Scan Failed",
        description: "Could not complete conflict scan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registerFeature = async () => {
    if (!registerFeatureName.trim()) {
      toast({
        title: "Feature Name Required",
        description: "Please enter a feature name to register",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const filePaths = registerFilePaths ? registerFilePaths.split('\n').filter(p => p.trim()) : [];
      
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: {
          action: 'register_feature',
          feature_name: registerFeatureName,
          feature_type: registerFeatureType,
          version_tag: registerVersion,
          file_paths: filePaths,
          description: registerDescription
        }
      });

      if (error) throw error;

      toast({
        title: "Feature Registered",
        description: `${registerFeatureName} has been added to the registry`,
      });

      // Clear form
      setRegisterFeatureName('');
      setRegisterDescription('');
      setRegisterFilePaths('');
      
      // Refresh status
      loadSyncGuardStatus();
    } catch (error) {
      console.error('Error registering feature:', error);
      toast({
        title: "Registration Failed",
        description: "Could not register feature",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullScan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: { action: 'run_full_scan' }
      });

      if (error) throw error;

      toast({
        title: "Full Scan Complete",
        description: `Scanned ${data.total_features} features in ${data.scan_duration_ms}ms`,
      });

      // Refresh status
      loadSyncGuardStatus();
    } catch (error) {
      console.error('Error running full scan:', error);
      toast({
        title: "Scan Failed",
        description: "Could not complete full system scan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Ashen Sync Guard</h2>
            <p className="text-muted-foreground">
              Prevent feature duplication and ensure system integrity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last Update: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button onClick={loadSyncGuardStatus} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.active_modules}</p>
                  <p className="text-sm text-muted-foreground">Active Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.skipped_duplicates}</p>
                  <p className="text-sm text-muted-foreground">Skipped Duplicates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.auto_upgraded}</p>
                  <p className="text-sm text-muted-foreground">Auto-Upgraded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Scan</p>
                  <p className="text-xs text-muted-foreground">
                    {syncStatus.last_scan ? new Date(syncStatus.last_scan).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">
            <Search className="h-4 w-4 mr-2" />
            Conflict Scanner
          </TabsTrigger>
          <TabsTrigger value="registry">
            <Database className="h-4 w-4 mr-2" />
            Feature Registry
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Clock className="h-4 w-4 mr-2" />
            Sync Logs
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Conflict Scanner */}
        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Build Conflict Scanner</CardTitle>
              <CardDescription>
                Scan for existing features before building new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scan-feature-name">Feature Name</Label>
                  <Input
                    id="scan-feature-name"
                    placeholder="e.g., UserDashboard, PoliticianCard"
                    value={scanFeatureName}
                    onChange={(e) => setScanFeatureName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scan-feature-type">Feature Type</Label>
                  <Select value={scanFeatureType} onValueChange={setScanFeatureType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="component">Component</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="hook">Hook</SelectItem>
                      <SelectItem value="function">Edge Function</SelectItem>
                      <SelectItem value="table">Database Table</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-description">Description (Optional)</Label>
                <Textarea
                  id="scan-description"
                  placeholder="Brief description of what this feature does..."
                  value={scanDescription}
                  onChange={(e) => setScanDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={scanForConflicts} disabled={isLoading} className="w-full">
                <Search className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Scan for Conflicts
              </Button>

              {/* Scan Results */}
              {scanResults && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    {scanResults.can_proceed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                    <h4 className="font-semibold">
                      {scanResults.can_proceed ? 'No Conflicts Found' : 'Conflicts Detected'}
                    </h4>
                  </div>

                  {scanResults.conflicts && scanResults.conflicts.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Conflicting Features:</h5>
                      {scanResults.conflicts.map((conflict, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{conflict.existing_name}</strong> - 
                            {conflict.similarity_score}% similarity ({conflict.status})
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {scanResults.recommendations && scanResults.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Recommendations:</h5>
                      {scanResults.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <AlertDescription>
                            <strong>{rec.action.toUpperCase()}</strong>: {rec.reason}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Registry */}
        <TabsContent value="registry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Register New Feature</CardTitle>
              <CardDescription>
                Add a new feature to the Ashen registry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-feature-name">Feature Name</Label>
                  <Input
                    id="register-feature-name"
                    placeholder="Feature name"
                    value={registerFeatureName}
                    onChange={(e) => setRegisterFeatureName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-feature-type">Type</Label>
                  <Select value={registerFeatureType} onValueChange={setRegisterFeatureType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="component">Component</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="hook">Hook</SelectItem>
                      <SelectItem value="function">Edge Function</SelectItem>
                      <SelectItem value="table">Database Table</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-version">Version</Label>
                  <Input
                    id="register-version"
                    placeholder="v1.0"
                    value={registerVersion}
                    onChange={(e) => setRegisterVersion(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-description">Description</Label>
                <Textarea
                  id="register-description"
                  placeholder="Describe what this feature does..."
                  value={registerDescription}
                  onChange={(e) => setRegisterDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-file-paths">File Paths (one per line)</Label>
                <Textarea
                  id="register-file-paths"
                  placeholder="src/components/MyComponent.tsx&#10;src/hooks/useMyHook.tsx"
                  value={registerFilePaths}
                  onChange={(e) => setRegisterFilePaths(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={registerFeature} disabled={isLoading} className="w-full">
                <Database className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Register Feature
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Logs</CardTitle>
              <CardDescription>
                View recent conflict scans and system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus?.recent_logs && syncStatus.recent_logs.length > 0 ? (
                <div className="space-y-2">
                  {syncStatus.recent_logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{log.scan_type}</Badge>
                        <span className="font-medium">{log.feature_scanned}</span>
                        <Badge className={getConflictSeverityColor(log.conflict_status)}>
                          {log.conflict_status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent logs available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Guard Configuration</CardTitle>
              <CardDescription>
                Manage system-wide sync and duplication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Configuration management interface coming soon. 
                  Current settings are managed via database functions.
                </AlertDescription>
              </Alert>

              <Button onClick={runFullScan} disabled={isLoading} variant="outline">
                <Play className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Run Full System Scan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};