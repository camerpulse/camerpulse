import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link2, Zap, RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle, GitBranch, Play, Pause, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ErrorGroup {
  id: string;
  group_type: 'source' | 'module' | 'class' | 'api_failure';
  group_name: string;
  error_count: number;
  errors: ErrorLog[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimated_fix_time: number;
  can_batch_fix: boolean;
}

interface FixChain {
  id: string;
  name: string;
  group_ids: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  total_fixes: number;
  successful_fixes: number;
  failed_fixes: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  rollback_reason?: string;
  execution_order: string[];
  patches: FixPatch[];
}

interface FixPatch {
  id: string;
  chain_id: string;
  error_id: string;
  component_path: string;
  fix_type: string;
  fix_description: string;
  status: 'pending' | 'applying' | 'success' | 'failed' | 'rolled_back';
  applied_at?: string;
  rollback_info?: any;
  execution_order: number;
}

interface ErrorLog {
  id: string;
  component_path: string;
  error_type: string;
  error_message: string;
  severity: string;
  status: string;
  created_at: string;
}

export default function BatchFixManager() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorGroups, setErrorGroups] = useState<ErrorGroup[]>([]);
  const [fixChains, setFixChains] = useState<FixChain[]>([]);
  const [activeChain, setActiveChain] = useState<FixChain | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    loadBatchFixConfig();
    if (isEnabled) {
      loadErrorGroups();
      loadFixChains();
    }
  }, [isEnabled]);

  const loadBatchFixConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'batch_fix_enabled')
        .single();

      if (data) {
        setIsEnabled(data.config_value === 'true');
      }
    } catch (error) {
      console.log('Batch fix config not found, using default');
    }
  };

  const toggleBatchFix = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: 'batch_fix_enabled',
          config_value: enabled.toString(),
          is_active: true,
          updated_at: new Date().toISOString()
        });

      setIsEnabled(enabled);
      
      if (enabled) {
        await scanForErrorGroups();
        toast.success('Batch fix enabled - scanning for error groups...');
      } else {
        toast.info('Batch fix disabled');
      }
    } catch (error) {
      toast.error('Failed to update batch fix settings');
    }
  };

  const scanForErrorGroups = async () => {
    setIsScanning(true);
    try {
      // Load recent errors
      const { data: errors } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!errors) {
        setErrorGroups([]);
        return;
      }

      // Group errors by different criteria
      const groups = groupErrors(errors);
      setErrorGroups(groups);

      toast.success(`Found ${groups.length} error groups for batch fixing`);
    } catch (error) {
      toast.error('Failed to scan for error groups');
      console.error('Error scanning:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const groupErrors = (errors: ErrorLog[]): ErrorGroup[] => {
    const groups: ErrorGroup[] = [];
    
    // Group by module
    const moduleGroups = new Map<string, ErrorLog[]>();
    const sourceGroups = new Map<string, ErrorLog[]>();
    const classGroups = new Map<string, ErrorLog[]>();
    const apiGroups = new Map<string, ErrorLog[]>();

    errors.forEach(error => {
      // Module grouping
      const module = extractModule(error.component_path);
      if (!moduleGroups.has(module)) moduleGroups.set(module, []);
      moduleGroups.get(module)!.push(error);

      // Source grouping (by file)
      const source = error.component_path;
      if (!sourceGroups.has(source)) sourceGroups.set(source, []);
      sourceGroups.get(source)!.push(error);

      // Class grouping (by error type)
      const errorClass = error.error_type;
      if (!classGroups.has(errorClass)) classGroups.set(errorClass, []);
      classGroups.get(errorClass)!.push(error);

      // API failure grouping
      if (error.error_message.toLowerCase().includes('api') || 
          error.error_message.toLowerCase().includes('network') ||
          error.error_message.toLowerCase().includes('fetch')) {
        const apiKey = 'api_failures';
        if (!apiGroups.has(apiKey)) apiGroups.set(apiKey, []);
        apiGroups.get(apiKey)!.push(error);
      }
    });

    // Convert to ErrorGroup objects
    moduleGroups.forEach((groupErrors, module) => {
      if (groupErrors.length > 1) {
        groups.push(createErrorGroup('module', module, groupErrors));
      }
    });

    sourceGroups.forEach((groupErrors, source) => {
      if (groupErrors.length > 2) {
        groups.push(createErrorGroup('source', source.split('/').pop() || source, groupErrors));
      }
    });

    classGroups.forEach((groupErrors, errorClass) => {
      if (groupErrors.length > 2) {
        groups.push(createErrorGroup('class', errorClass, groupErrors));
      }
    });

    apiGroups.forEach((groupErrors, apiKey) => {
      if (groupErrors.length > 1) {
        groups.push(createErrorGroup('api_failure', 'API Failures', groupErrors));
      }
    });

    return groups.sort((a, b) => b.error_count - a.error_count);
  };

  const extractModule = (path: string): string => {
    if (path.includes('Politicians')) return 'Politicians';
    if (path.includes('Polls')) return 'Polls';
    if (path.includes('Promises')) return 'Promises';
    if (path.includes('Civic')) return 'CivicImportCore';
    if (path.includes('Pulse')) return 'PulseFeed';
    if (path.includes('Admin')) return 'Admin';
    if (path.includes('Auth')) return 'Auth';
    return 'Core';
  };

  const createErrorGroup = (type: 'source' | 'module' | 'class' | 'api_failure', name: string, errors: ErrorLog[]): ErrorGroup => {
    const highSeverityCount = errors.filter(e => e.severity === 'high' || e.severity === 'critical').length;
    const severity = highSeverityCount > errors.length / 2 ? 'high' : 
                    highSeverityCount > 0 ? 'medium' : 'low';

    const canBatchFix = determineBatchFixability(type, errors);
    
    return {
      id: `group_${type}_${name}_${Date.now()}`,
      group_type: type,
      group_name: name,
      error_count: errors.length,
      errors,
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      estimated_fix_time: errors.length * 2, // 2 minutes per error estimate
      can_batch_fix: canBatchFix
    };
  };

  const determineBatchFixability = (type: string, errors: ErrorLog[]): boolean => {
    // Simple heuristics for batch fixability
    if (type === 'api_failure') return true; // Can add error boundaries
    if (type === 'class' && errors[0]?.error_type === 'TypeError') return true;
    if (type === 'source' && errors.length > 3) return true;
    return errors.length > 1 && errors.every(e => e.error_type === errors[0].error_type);
  };

  const createFixChain = async () => {
    if (selectedGroups.length === 0) {
      toast.error('Please select at least one error group');
      return;
    }

    try {
      const selectedGroupData = errorGroups.filter(g => selectedGroups.includes(g.id));
      const totalFixes = selectedGroupData.reduce((sum, group) => sum + group.error_count, 0);

      const newChain: FixChain = {
        id: `chain_${Date.now()}`,
        name: `Batch Fix Chain - ${selectedGroupData.map(g => g.group_name).join(', ')}`,
        group_ids: selectedGroups,
        status: 'pending',
        total_fixes: totalFixes,
        successful_fixes: 0,
        failed_fixes: 0,
        created_at: new Date().toISOString(),
        execution_order: generateExecutionOrder(selectedGroupData),
        patches: generatePatches(selectedGroupData)
      };

      setFixChains(prev => [newChain, ...prev]);
      setSelectedGroups([]);
      
      toast.success(`Created fix chain with ${totalFixes} fixes`);
    } catch (error) {
      toast.error('Failed to create fix chain');
    }
  };

  const generateExecutionOrder = (groups: ErrorGroup[]): string[] => {
    // Sort by severity and dependency order
    return groups
      .sort((a, b) => {
        // API failures first, then by severity
        if (a.group_type === 'api_failure' && b.group_type !== 'api_failure') return -1;
        if (b.group_type === 'api_failure' && a.group_type !== 'api_failure') return 1;
        
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .map(g => g.id);
  };

  const generatePatches = (groups: ErrorGroup[]): FixPatch[] => {
    const patches: FixPatch[] = [];
    let order = 1;

    groups.forEach(group => {
      group.errors.forEach(error => {
        patches.push({
          id: `patch_${error.id}_${Date.now()}`,
          chain_id: '',
          error_id: error.id,
          component_path: error.component_path,
          fix_type: generateFixType(group.group_type, error),
          fix_description: generateFixDescription(group.group_type, error),
          status: 'pending',
          execution_order: order++
        });
      });
    });

    return patches;
  };

  const generateFixType = (groupType: string, error: ErrorLog): string => {
    if (groupType === 'api_failure') return 'error_boundary';
    if (error.error_type === 'TypeError') return 'null_check';
    if (error.error_type === 'ReferenceError') return 'import_fix';
    if (error.component_path.includes('button')) return 'mobile_button_fix';
    if (error.component_path.includes('date')) return 'datepicker_update';
    return 'generic_fix';
  };

  const generateFixDescription = (groupType: string, error: ErrorLog): string => {
    const fixes = {
      'error_boundary': 'Add error boundary and retry logic',
      'null_check': 'Add null/undefined safety checks',
      'import_fix': 'Fix missing imports and dependencies',
      'mobile_button_fix': 'Update button for mobile compatibility',
      'datepicker_update': 'Update datepicker to latest Shadcn format',
      'generic_fix': 'Apply automated fix based on error pattern'
    };

    const fixType = generateFixType(groupType, error);
    return fixes[fixType as keyof typeof fixes] || 'Apply generic error fix';
  };

  const executeFixChain = async (chain: FixChain) => {
    setActiveChain({ ...chain, status: 'running', started_at: new Date().toISOString() });
    
    try {
      // Simulate fix chain execution
      for (let i = 0; i < chain.patches.length; i++) {
        const patch = chain.patches[i];
        
        // Update patch status
        setActiveChain(prev => prev ? {
          ...prev,
          patches: prev.patches.map(p => 
            p.id === patch.id ? { ...p, status: 'applying' } : p
          )
        } : null);

        // Simulate fix application
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Randomly succeed or fail for demo
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          setActiveChain(prev => prev ? {
            ...prev,
            successful_fixes: prev.successful_fixes + 1,
            patches: prev.patches.map(p => 
              p.id === patch.id ? { 
                ...p, 
                status: 'success',
                applied_at: new Date().toISOString()
              } : p
            )
          } : null);
        } else {
          // Failure - rollback chain
          setActiveChain(prev => prev ? {
            ...prev,
            status: 'failed',
            failed_fixes: prev.failed_fixes + 1,
            rollback_reason: `Failed at patch ${i + 1}: ${patch.fix_description}`
          } : null);
          
          await rollbackChain(chain);
          return;
        }
      }

      // Success - complete chain
      setActiveChain(prev => prev ? {
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString()
      } : null);

      toast.success(`Fix chain completed successfully: ${chain.successful_fixes} fixes applied`);

    } catch (error) {
      await rollbackChain(chain);
      toast.error('Fix chain failed - rolled back all changes');
    }
  };

  const rollbackChain = async (chain: FixChain) => {
    setActiveChain(prev => prev ? { ...prev, status: 'rolled_back' } : null);
    
    // Simulate rollback
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.warning('Fix chain rolled back due to failure');
  };

  const loadErrorGroups = async () => {
    if (errorGroups.length === 0) {
      await scanForErrorGroups();
    }
  };

  const loadFixChains = async () => {
    // In a real implementation, this would load from database
    // For now, we'll use demo data
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive bg-destructive/10';
      case 'high': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'medium': return 'text-amber-500 border-amber-500 bg-amber-500/10';
      case 'low': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-500';
      case 'running': return 'text-blue-500';
      case 'failed': return 'text-destructive';
      case 'rolled_back': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'rolled_back': return <RotateCcw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Batch Fix Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Batch Error Fixing</h4>
              <p className="text-sm text-muted-foreground">
                Group related errors and apply coordinated fixes in chains
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleBatchFix}
            />
          </div>

          {isEnabled && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={scanForErrorGroups}
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Scan for Error Groups'}
              </Button>
              
              {selectedGroups.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Create Fix Chain ({selectedGroups.length} groups)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create Batch Fix Chain</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a coordinated fix chain for {selectedGroups.length} error groups. 
                        Fixes will be applied in smart order with automatic rollback on failure.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={createFixChain}>
                        Create Fix Chain
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEnabled && (
        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">Error Groups</TabsTrigger>
            <TabsTrigger value="chains">Fix Chains</TabsTrigger>
            <TabsTrigger value="active">Active Chain</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Groups ({errorGroups.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {errorGroups.map((group) => (
                      <div key={group.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroups([...selectedGroups, group.id]);
                                } else {
                                  setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                }
                              }}
                              disabled={!group.can_batch_fix}
                            />
                            <h4 className="font-medium">{group.group_name}</h4>
                            <Badge variant="outline" className={getSeverityColor(group.severity)}>
                              {group.severity}
                            </Badge>
                            <Badge variant="secondary">
                              {group.group_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {group.error_count} errors • ~{group.estimated_fix_time}min
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {group.can_batch_fix ? (
                            <span className="text-emerald-600">✓ Can batch fix</span>
                          ) : (
                            <span className="text-amber-600">⚠ Manual review required</span>
                          )}
                        </div>

                        <div className="text-xs">
                          Sample errors: {group.errors.slice(0, 2).map(e => e.error_type).join(', ')}
                          {group.errors.length > 2 && ` +${group.errors.length - 2} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chains">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Fix Chains ({fixChains.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {fixChains.map((chain) => (
                      <div key={chain.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(chain.status)}
                            <h4 className="font-medium">{chain.name}</h4>
                            <Badge variant="outline" className={getStatusColor(chain.status)}>
                              {chain.status}
                            </Badge>
                          </div>
                          {chain.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => executeFixChain(chain)}
                              className="flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" />
                              Execute
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total:</span> {chain.total_fixes}
                          </div>
                          <div>
                            <span className="text-emerald-600">Success:</span> {chain.successful_fixes}
                          </div>
                          <div>
                            <span className="text-destructive">Failed:</span> {chain.failed_fixes}
                          </div>
                        </div>

                        {chain.rollback_reason && (
                          <div className="text-sm p-2 bg-amber-50 rounded">
                            <strong>Rollback reason:</strong> {chain.rollback_reason}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(chain.created_at).toLocaleString()}
                          {chain.completed_at && ` • Completed: ${new Date(chain.completed_at).toLocaleString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Active Fix Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeChain ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{activeChain.name}</h3>
                      <Badge className={getStatusColor(activeChain.status)}>
                        {activeChain.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{activeChain.successful_fixes + activeChain.failed_fixes}/{activeChain.total_fixes}</span>
                      </div>
                      <Progress 
                        value={((activeChain.successful_fixes + activeChain.failed_fixes) / activeChain.total_fixes) * 100} 
                        className="w-full"
                      />
                    </div>

                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {activeChain.patches.map((patch, index) => (
                          <div key={patch.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                            <span className="w-6 text-center">{index + 1}</span>
                            <div className="flex-1">
                              <div className="font-medium">{patch.fix_description}</div>
                              <div className="text-xs text-muted-foreground">{patch.component_path}</div>
                            </div>
                            <Badge variant="outline" className={getStatusColor(patch.status)}>
                              {patch.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active fix chain
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}