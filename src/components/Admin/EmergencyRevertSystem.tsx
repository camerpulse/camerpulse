import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Camera,
  FileText,
  Database,
  Settings,
  Zap,
  Shield,
  GitBranch,
  Download,
  Upload,
  Trash2,
  Eye,
  Copy,
  RefreshCw
} from 'lucide-react';

interface Snapshot {
  id: string;
  snapshot_name: string;
  snapshot_type: string;
  description?: string;
  tags: string[];
  status: string;
  total_files: number;
  total_size_mb: number;
  created_at: string;
  creation_completed_at?: string;
}

interface RestoreOperation {
  id: string;
  snapshot_id: string;
  restore_type: string;
  status: string;
  progress_percentage: number;
  files_restored: number;
  tables_restored: number;
  started_at: string;
  completed_at?: string;
}

interface RetentionConfig {
  max_snapshots: number;
  max_age_days: number;
  auto_cleanup_enabled: boolean;
  auto_snapshot_enabled: boolean;
  auto_snapshot_frequency: string;
  pre_patch_snapshots: boolean;
  pre_plugin_snapshots: boolean;
  emergency_restore_enabled: boolean;
  auto_rollback_on_critical_error: boolean;
}

export const EmergencyRevertSystem: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [restoreOperations, setRestoreOperations] = useState<RestoreOperation[]>([]);
  const [retentionConfig, setRetentionConfig] = useState<RetentionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('');
  const [restoreType, setRestoreType] = useState<string>('full');
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDescription, setNewSnapshotDescription] = useState('');
  const [newSnapshotTags, setNewSnapshotTags] = useState('');
  const [compareSnapshots, setCompareSnapshots] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSnapshots();
    loadRestoreOperations();
    loadRetentionConfig();
  }, []);

  const loadSnapshots = async () => {
    try {
      const response = await supabase.functions.invoke('ashen-snapshot-manager', {
        body: { action: 'list' }
      });

      if (response.error) throw response.error;
      
      const { data } = response;
      if (data.success) {
        setSnapshots(data.snapshots || []);
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      toast({
        title: "Error",
        description: "Failed to load snapshots",
        variant: "destructive"
      });
    }
  };

  const loadRestoreOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_restore_operations')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRestoreOperations(data || []);
    } catch (error) {
      console.error('Failed to load restore operations:', error);
    }
  };

  const loadRetentionConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_snapshot_retention_config')
        .select('*')
        .eq('policy_name', 'default_policy')
        .single();

      if (error) throw error;
      setRetentionConfig(data);
    } catch (error) {
      console.error('Failed to load retention config:', error);
    }
  };

  const createSnapshot = async () => {
    if (!newSnapshotName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a snapshot name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ashen-snapshot-manager', {
        body: {
          action: 'create',
          snapshotName: newSnapshotName,
          description: newSnapshotDescription,
          tags: newSnapshotTags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (data.success) {
        toast({
          title: "Success",
          description: `Snapshot "${newSnapshotName}" created successfully`
        });
        setNewSnapshotName('');
        setNewSnapshotDescription('');
        setNewSnapshotTags('');
        loadSnapshots();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      toast({
        title: "Error",
        description: "Failed to create snapshot",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreSnapshot = async () => {
    if (!selectedSnapshot) {
      toast({
        title: "Error",
        description: "Please select a snapshot to restore",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ashen-snapshot-manager', {
        body: {
          action: 'restore',
          snapshotId: selectedSnapshot,
          restoreType
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (data.success) {
        toast({
          title: "Success",
          description: "Restoration completed successfully"
        });
        loadRestoreOperations();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      toast({
        title: "Error",
        description: "Failed to restore snapshot",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const compareSnapshotPair = async () => {
    if (compareSnapshots.length !== 2) {
      toast({
        title: "Error",
        description: "Please select exactly 2 snapshots to compare",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ashen-snapshot-manager', {
        body: {
          action: 'compare',
          compareIds: compareSnapshots
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (data.success) {
        toast({
          title: "Success",
          description: "Snapshot comparison completed"
        });
        // In a real implementation, you'd show the comparison results
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to compare snapshots:', error);
      toast({
        title: "Error",
        description: "Failed to compare snapshots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRetentionConfig = async (updates: Partial<RetentionConfig>) => {
    if (!retentionConfig) return;

    try {
      const { error } = await supabase
        .from('ashen_snapshot_retention_config')
        .update(updates)
        .eq('policy_name', 'default_policy');

      if (error) throw error;

      setRetentionConfig({ ...retentionConfig, ...updates });
      toast({
        title: "Success",
        description: "Retention policy updated"
      });
    } catch (error) {
      console.error('Failed to update retention config:', error);
      toast({
        title: "Error",
        description: "Failed to update retention policy",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'in_progress': case 'creating': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSnapshotTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Camera className="h-4 w-4" />;
      case 'auto': return <RefreshCw className="h-4 w-4" />;
      case 'pre_patch': return <GitBranch className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Revert & Snapshot System</h2>
          <p className="text-muted-foreground">
            Protect your platform with automated snapshots and instant restoration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadSnapshots}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="snapshots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Create Manual Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="snapshot-name">Snapshot Name</Label>
                  <Input
                    id="snapshot-name"
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    placeholder="e.g., Before dashboard update"
                  />
                </div>
                <div>
                  <Label htmlFor="snapshot-tags">Tags (comma-separated)</Label>
                  <Input
                    id="snapshot-tags"
                    value={newSnapshotTags}
                    onChange={(e) => setNewSnapshotTags(e.target.value)}
                    placeholder="e.g., feature, update, bugfix"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="snapshot-description">Description</Label>
                <Textarea
                  id="snapshot-description"
                  value={newSnapshotDescription}
                  onChange={(e) => setNewSnapshotDescription(e.target.value)}
                  placeholder="Optional description of what this snapshot captures..."
                  rows={3}
                />
              </div>
              <Button
                onClick={createSnapshot}
                disabled={loading || !newSnapshotName.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Snapshot...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Snapshot
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Snapshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snapshots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No snapshots created yet</p>
                  </div>
                ) : (
                  snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSnapshotTypeIcon(snapshot.snapshot_type)}
                          <h4 className="font-medium">{snapshot.snapshot_name}</h4>
                          <Badge className={getStatusColor(snapshot.status)}>
                            {snapshot.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSnapshot(snapshot.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {snapshot.description && (
                        <p className="text-sm text-muted-foreground">{snapshot.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{snapshot.total_files} files</span>
                        <span>{snapshot.total_size_mb} MB</span>
                        <span>{new Date(snapshot.created_at).toLocaleString()}</span>
                      </div>
                      {snapshot.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {snapshot.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Restore System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restore-snapshot">Select Snapshot</Label>
                  <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose snapshot to restore" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots
                        .filter(s => s.status === 'completed')
                        .map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id}>
                          {snapshot.snapshot_name} - {new Date(snapshot.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="restore-type">Restore Type</Label>
                  <Select value={restoreType} onValueChange={setRestoreType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full System Restore</SelectItem>
                      <SelectItem value="files_only">Files Only</SelectItem>
                      <SelectItem value="db_only">Database Only</SelectItem>
                      <SelectItem value="config_only">Configuration Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedSnapshot && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Safety Notice</span>
                  </div>
                  <p className="text-sm mt-2">
                    A pre-restore backup will be automatically created before restoration begins.
                    This operation will overwrite current system state.
                  </p>
                </div>
              )}

              <Button
                onClick={restoreSnapshot}
                disabled={loading || !selectedSnapshot}
                className="w-full"
                variant="destructive"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Begin Restoration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Restore Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restoreOperations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No restore operations yet</p>
                  </div>
                ) : (
                  restoreOperations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          <span className="font-medium">{operation.restore_type} restore</span>
                          <Badge className={getStatusColor(operation.status)}>
                            {operation.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(operation.started_at).toLocaleString()}
                        </span>
                      </div>
                      {operation.status === 'in_progress' && (
                        <Progress value={operation.progress_percentage} className="w-full" />
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{operation.files_restored} files restored</span>
                        <span>{operation.tables_restored} tables restored</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Compare Snapshots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Snapshot</Label>
                  <Select 
                    value={compareSnapshots[0] || ''} 
                    onValueChange={(value) => setCompareSnapshots([value, compareSnapshots[1] || ''])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select first snapshot" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots
                        .filter(s => s.status === 'completed')
                        .map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id}>
                          {snapshot.snapshot_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Second Snapshot</Label>
                  <Select 
                    value={compareSnapshots[1] || ''} 
                    onValueChange={(value) => setCompareSnapshots([compareSnapshots[0] || '', value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select second snapshot" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots
                        .filter(s => s.status === 'completed' && s.id !== compareSnapshots[0])
                        .map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id}>
                          {snapshot.snapshot_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={compareSnapshotPair}
                disabled={loading || compareSnapshots.length !== 2}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Compare Snapshots
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {retentionConfig && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Retention Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-snapshots">Maximum Snapshots</Label>
                      <Input
                        id="max-snapshots"
                        type="number"
                        value={retentionConfig.max_snapshots}
                        onChange={(e) => updateRetentionConfig({ max_snapshots: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-age">Maximum Age (days)</Label>
                      <Input
                        id="max-age"
                        type="number"
                        value={retentionConfig.max_age_days}
                        onChange={(e) => updateRetentionConfig({ max_age_days: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automated Snapshots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-snapshots">Enable Auto Snapshots</Label>
                    <Switch
                      id="auto-snapshots"
                      checked={retentionConfig.auto_snapshot_enabled}
                      onCheckedChange={(checked) => updateRetentionConfig({ auto_snapshot_enabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pre-patch">Pre-Patch Snapshots</Label>
                    <Switch
                      id="pre-patch"
                      checked={retentionConfig.pre_patch_snapshots}
                      onCheckedChange={(checked) => updateRetentionConfig({ pre_patch_snapshots: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pre-plugin">Pre-Plugin Snapshots</Label>
                    <Switch
                      id="pre-plugin"
                      checked={retentionConfig.pre_plugin_snapshots}
                      onCheckedChange={(checked) => updateRetentionConfig({ pre_plugin_snapshots: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emergency-restore">Emergency Restore Enabled</Label>
                    <Switch
                      id="emergency-restore"
                      checked={retentionConfig.emergency_restore_enabled}
                      onCheckedChange={(checked) => updateRetentionConfig({ emergency_restore_enabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-rollback">Auto Rollback on Critical Error</Label>
                    <Switch
                      id="auto-rollback"
                      checked={retentionConfig.auto_rollback_on_critical_error}
                      onCheckedChange={(checked) => updateRetentionConfig({ auto_rollback_on_critical_error: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};