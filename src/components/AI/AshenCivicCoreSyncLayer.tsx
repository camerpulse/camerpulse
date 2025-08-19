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
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  GitBranch,
  Layers,
  Brain,
  Zap,
  Eye,
  BookOpen,
  Cpu
} from "lucide-react";

interface SyncLayerStatus {
  total_features_tracked: number;
  duplicates_prevented: number;
  features_upgraded: number;
  last_sync_scan: string;
  sync_status: string;
  active_monitors: number;
  build_journal_entries: number;
}

interface DuplicateCheckResult {
  exists: boolean;
  existing_features: any[];
  recommendation: 'SKIP' | 'EXTEND' | 'UPGRADE' | 'PROCEED';
  similarity_score: number;
  upgrade_plan?: any;
}

interface BuildJournalEntry {
  id: string;
  created_at: string;
  feature_scanned: string;
  scan_result: string;
  conflict_status: string;
  conflict_details: any;
  scan_type: string;
  scan_duration_ms: number;
  metadata: any;
  recommendations: string[];
}

const AshenCivicCoreSyncLayer: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncLayerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Duplicate detection state
  const [checkFeatureName, setCheckFeatureName] = useState('');
  const [checkFeatureType, setCheckFeatureType] = useState('component');
  const [checkDescription, setCheckDescription] = useState('');
  const [checkResults, setCheckResults] = useState<DuplicateCheckResult | null>(null);
  
  // Build journal state
  const [buildJournal, setBuildJournal] = useState<BuildJournalEntry[]>([]);
  const [journalFilter, setJournalFilter] = useState('all');
  
  // Learning patterns
  const [learningPatterns, setLearningPatterns] = useState<any[]>([]);
  const [namingCollisions, setNamingCollisions] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadSyncLayerStatus();
    loadBuildJournal();
    loadLearningPatterns();
  }, []);

  const loadSyncLayerStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: { action: 'get_sync_layer_status' }
      });

      if (error) throw error;

      setSyncStatus(data);
      setLastRefresh(new Date());
      
      toast({
        title: "Sync Layer Status Updated",
        description: "Core sync layer status refreshed successfully",
      });
    } catch (error) {
      logger.error('Error loading sync layer status', { error: error.message });
      toast({
        title: "Status Load Failed",
        description: "Could not load Sync Layer status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBuildJournal = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBuildJournal(data || []);
    } catch (error) {
      logger.error('Error loading build journal', { error: error.message });
    }
  };

  const loadLearningPatterns = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_learning_patterns')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLearningPatterns(data || []);
    } catch (error) {
      logger.error('Error loading learning patterns', { error: error.message });
    }
  };

  const runDuplicateDetection = async () => {
    if (!checkFeatureName.trim()) {
      toast({
        title: "Feature Name Required",
        description: "Please enter a feature name to check for duplicates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: {
          action: 'check_duplicates',
          feature_name: checkFeatureName,
          feature_type: checkFeatureType,
          description: checkDescription
        }
      });

      if (error) throw error;

      setCheckResults(data);
      
      toast({
        title: "Duplicate Check Complete",
        description: `Recommendation: ${data.recommendation}`,
        variant: data.recommendation === 'PROCEED' ? "default" : "destructive",
      });
    } catch (error) {
      logger.error('Error checking for duplicates', { error: error.message });
      toast({
        title: "Check Failed",
        description: "Could not complete duplicate detection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullSystemScan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-sync-guard', {
        body: { action: 'run_full_system_scan' }
      });

      if (error) throw error;

      toast({
        title: "Full System Scan Complete",
        description: `Analyzed ${data.total_modules} modules, found ${data.potential_issues} potential issues`,
      });

      loadSyncLayerStatus();
      loadBuildJournal();
    } catch (error) {
      logger.error('Error running full scan', { error: error.message });
      toast({
        title: "Scan Failed",
        description: "Could not complete full system scan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'PROCEED': return 'bg-success text-success-foreground';
      case 'EXTEND': return 'bg-primary text-primary-foreground';
      case 'UPGRADE': return 'bg-warning text-warning-foreground';
      case 'SKIP': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'skipped': return 'text-red-600';
      case 'extended': return 'text-blue-600';
      case 'upgraded': return 'text-yellow-600';
      case 'proceeded': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary /* animate-pulse - disabled */" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ashen-Civic Core Sync Layer
            </h2>
            <p className="text-muted-foreground">
              Guardian co-developer preventing duplication and ensuring clean upgrades
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            Guardian Active
          </Badge>
          <Button onClick={loadSyncLayerStatus} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? '/* animate-spin - disabled */' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.total_features_tracked}</p>
                  <p className="text-sm text-muted-foreground">Features Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.duplicates_prevented}</p>
                  <p className="text-sm text-muted-foreground">Duplicates Prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.features_upgraded}</p>
                  <p className="text-sm text-muted-foreground">Smart Upgrades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{syncStatus.active_monitors}</p>
                  <p className="text-sm text-muted-foreground">Active Monitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="detection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="detection">
            <Search className="h-4 w-4 mr-2" />
            Duplicate Detection
          </TabsTrigger>
          <TabsTrigger value="journal">
            <BookOpen className="h-4 w-4 mr-2" />
            Build Journal
          </TabsTrigger>
          <TabsTrigger value="learning">
            <Brain className="h-4 w-4 mr-2" />
            Learning Engine
          </TabsTrigger>
          <TabsTrigger value="controls">
            <Settings className="h-4 w-4 mr-2" />
            Fail-Safe Controls
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <Cpu className="h-4 w-4 mr-2" />
            System Monitor
          </TabsTrigger>
        </TabsList>

        {/* Duplicate Detection System */}
        <TabsContent value="detection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Smart Duplicate Detection
              </CardTitle>
              <CardDescription>
                Check if a feature already exists before building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-feature-name">Feature Name</Label>
                  <Input
                    id="check-feature-name"
                    placeholder="e.g., CivicSentimentTimeline, PoliticianCard"
                    value={checkFeatureName}
                    onChange={(e) => setCheckFeatureName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-feature-type">Feature Type</Label>
                  <Select value={checkFeatureType} onValueChange={setCheckFeatureType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="component">React Component</SelectItem>
                      <SelectItem value="page">Page/Route</SelectItem>
                      <SelectItem value="hook">Custom Hook</SelectItem>
                      <SelectItem value="function">Edge Function</SelectItem>
                      <SelectItem value="table">Database Table</SelectItem>
                      <SelectItem value="integration">External Integration</SelectItem>
                      <SelectItem value="module">AI Module</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="check-description">Feature Description</Label>
                <Textarea
                  id="check-description"
                  placeholder="Describe what this feature does..."
                  value={checkDescription}
                  onChange={(e) => setCheckDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={runDuplicateDetection} disabled={isLoading} className="w-full">
                <Search className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Run Duplicate Detection
              </Button>

              {/* Detection Results */}
              {checkResults && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {checkResults.recommendation === 'PROCEED' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                      <h4 className="font-semibold">Detection Results</h4>
                    </div>
                    <Badge className={getRecommendationColor(checkResults.recommendation)}>
                      {checkResults.recommendation}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Label>Similarity Score</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={checkResults.similarity_score} className="flex-1" />
                            <span className="text-sm font-medium">{checkResults.similarity_score}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Label>Existing Features Found</Label>
                          <p className="text-2xl font-bold">{checkResults.existing_features?.length || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {checkResults.existing_features && checkResults.existing_features.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Similar Existing Features:</h5>
                      {checkResults.existing_features.map((feature, index) => (
                        <Alert key={index}>
                          <GitBranch className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{feature.feature_name}</strong> ({feature.feature_type}) - 
                            Status: <Badge variant="outline">{feature.status}</Badge>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {checkResults.upgrade_plan && (
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Upgrade Plan Available:</strong> {checkResults.upgrade_plan.description}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Journal */}
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Build Journal & Decision Log
              </CardTitle>
              <CardDescription>
                Track every decision made by the Ashen guardian system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={journalFilter} onValueChange={setJournalFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="skipped">Skipped Duplicates</SelectItem>
                    <SelectItem value="extended">Extended Features</SelectItem>
                    <SelectItem value="upgraded">Upgraded Features</SelectItem>
                    <SelectItem value="proceeded">Proceeded Builds</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadBuildJournal} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {buildJournal
                  .filter(entry => journalFilter === 'all' || entry.scan_result === journalFilter)
                  .map((entry, index) => (
                    <Card key={index} className="border-l-4 border-l-muted">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.created_at).toLocaleString()}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={getActionColor(entry.scan_result)}
                              >
                                {entry.scan_result?.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="font-medium">{entry.feature_scanned}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.conflict_status} - {entry.scan_type} scan
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {buildJournal.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No journal entries found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Engine */}
        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Continuous Learning Engine
              </CardTitle>
              <CardDescription>
                Patterns learned from analyzing CamerPulse modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Learning Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {learningPatterns.slice(0, 5).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{pattern.pattern_type}</span>
                        <Badge variant="outline">{pattern.usage_count} uses</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Naming Collisions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {namingCollisions.length > 0 ? (
                      namingCollisions.map((collision, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{collision.pattern}</AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No naming collisions detected</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Button onClick={runFullSystemScan} disabled={isLoading} className="w-full">
                <Brain className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Run Learning Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fail-Safe Controls */}
        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Fail-Safe Control Panel
              </CardTitle>
              <CardDescription>
                Emergency controls and override options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  The Ashen guardian can be overridden in emergency situations. Use these controls carefully.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <XCircle className="h-6 w-6 mb-2" />
                  Force Skip Validation
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Reset Learning Cache
                </Button>
                <Button variant="destructive" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Emergency Bypass
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Export Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Monitor */}
        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Real-Time System Monitor
              </CardTitle>
              <CardDescription>
                Live monitoring of Ashen guardian operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Scans</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                      <Play className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="text-2xl font-bold">150ms</p>
                      </div>
                      <Zap className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Queue Depth</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                      <Database className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>System Status:</strong> All guardian systems operational. 
                  Last full scan completed {syncStatus?.last_sync_scan ? new Date(syncStatus.last_sync_scan).toLocaleString() : 'Never'}.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AshenCivicCoreSyncLayer;