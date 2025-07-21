import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Download, 
  Undo2, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  History,
  Package
} from 'lucide-react';
import { 
  usePluginUpdateChecker,
  usePluginUpdate,
  usePluginRollback,
  usePluginVersions,
  usePluginSnapshots,
  useVersionCompatibility
} from '@/hooks/usePluginVersionControl';
import { usePlugins } from '@/hooks/usePluginSystem';
import { formatDistanceToNow } from 'date-fns';

export const PluginVersionControl = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  const { data: plugins } = usePlugins();
  const { updates, isChecking, manualCheck, lastChecked } = usePluginUpdateChecker();
  const updatePlugin = usePluginUpdate();
  const rollbackPlugin = usePluginRollback();
  const checkCompatibility = useVersionCompatibility();

  const { data: versions } = usePluginVersions(selectedPlugin || '');
  const { data: snapshots } = usePluginSnapshots(selectedPlugin || '');

  const handleUpdateClick = (update: any) => {
    setSelectedUpdate(update);
    setShowUpdateDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedUpdate) return;
    
    // Check compatibility first
    const compatibilityResult = await checkCompatibility.mutateAsync({
      pluginId: selectedUpdate.plugin_id,
      targetVersion: selectedUpdate.latest_version
    });

    if (!compatibilityResult.compatible && !confirm(
      `This update has compatibility issues:\n${compatibilityResult.issues.join('\n')}\n\nContinue anyway?`
    )) {
      return;
    }

    updatePlugin.mutate({
      pluginId: selectedUpdate.plugin_id,
      newVersionId: selectedUpdate.latest_version,
      createSnapshot: true
    });
    
    setShowUpdateDialog(false);
  };

  const handleRollback = () => {
    if (!selectedPlugin) return;
    
    rollbackPlugin.mutate({ pluginId: selectedPlugin });
    setShowRollbackDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plugin Version Control</h2>
          <p className="text-muted-foreground">
            Manage plugin versions, updates, and rollbacks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => manualCheck()}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Updates
          </Button>
          {lastChecked && (
            <p className="text-sm text-muted-foreground">
              Last checked: {formatDistanceToNow(lastChecked, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="updates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="updates">Available Updates ({updates.length})</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots & Rollback</TabsTrigger>
        </TabsList>

        <TabsContent value="updates">
          <div className="grid gap-4">
            {updates.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">All plugins are up to date</h3>
                    <p className="text-muted-foreground">No updates available at this time.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              updates.map((update) => {
                const plugin = plugins?.find(p => p.id === update.plugin_id);
                return (
                  <Card key={update.plugin_id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {plugin?.plugin_name || 'Unknown Plugin'}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              v{update.current_version} → v{update.latest_version}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Released {formatDistanceToNow(new Date(update.released_on), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => handleUpdateClick(update)}>
                          <Download className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </CardHeader>
                    {update.changelog && (
                      <CardContent>
                        <div>
                          <h4 className="font-medium mb-2">What's New:</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {update.changelog}
                          </p>
                        </div>
                        {update.compatibility_issues.length > 0 && (
                          <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Compatibility Issues:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {update.compatibility_issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Plugin</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {plugins?.map((plugin) => (
                      <div
                        key={plugin.id}
                        className={`p-3 rounded border cursor-pointer hover:bg-accent ${
                          selectedPlugin === plugin.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedPlugin(plugin.id)}
                      >
                        <div className="font-medium">{plugin.plugin_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: v{plugin.plugin_version}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPlugin ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {versions?.map((version) => (
                        <div key={version.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">v{version.version}</span>
                              {version.is_current && (
                                <Badge variant="default">Current</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(version.released_on), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {version.changelog}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {version.download_count} downloads
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a plugin to view version history
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="snapshots">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Available Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPlugin ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {snapshots?.map((snapshot) => (
                        <div key={snapshot.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              v{snapshot.snapshot_data.plugin_version}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRollbackDialog(true)}
                            >
                              <Undo2 className="h-3 w-3 mr-1" />
                              Rollback
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true })}
                          </p>
                          {snapshot.created_before_update && (
                            <Badge variant="secondary" className="mt-2">
                              Pre-update snapshot
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a plugin to view snapshots
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rollback Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>About Rollbacks:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Snapshots are created before each update</li>
                      <li>Rollback restores the plugin to its previous state</li>
                      <li>All data and configurations are preserved</li>
                      <li>You can rollback multiple times if needed</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plugin Update</DialogTitle>
            <DialogDescription>
              Update {plugins?.find(p => p.id === selectedUpdate?.plugin_id)?.plugin_name} from 
              v{selectedUpdate?.current_version} to v{selectedUpdate?.latest_version}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUpdate?.changelog && (
              <div>
                <h4 className="font-medium mb-2">Release Notes:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedUpdate.changelog}
                </p>
              </div>
            )}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A snapshot will be created before updating, allowing you to rollback if needed.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updatePlugin.isPending}
              >
                {updatePlugin.isPending ? 'Updating...' : 'Update Plugin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plugin Rollback</DialogTitle>
            <DialogDescription>
              This will restore the plugin to its previous version. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Rolling back will restore all plugin files and configuration to the snapshot state.
              Any changes made after the snapshot will be lost.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRollback}
              disabled={rollbackPlugin.isPending}
            >
              {rollbackPlugin.isPending ? 'Rolling back...' : 'Rollback Plugin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};