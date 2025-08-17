import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Database, Download, Upload, Clock, CheckCircle, AlertTriangle,
  RefreshCw, Settings, Shield, HardDrive, Cloud, Calendar
} from 'lucide-react';

interface BackupRecoveryManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface BackupRecord {
  id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'pending';
  size_mb: number;
  created_at: string;
  completed_at: string | null;
  retention_days: number;
  backup_location: string;
  metadata: {
    tables_count: number;
    rows_count: number;
    compression_ratio: number;
  };
}

interface RestoreJob {
  id: string;
  backup_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target_environment: 'development' | 'staging' | 'production';
  started_at: string;
  completed_at: string | null;
  progress_percentage: number;
}

export const BackupRecoveryManager: React.FC<BackupRecoveryManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBackupType, setSelectedBackupType] = useState<string>('full');
  const [restoreTarget, setRestoreTarget] = useState<string>('development');

  // Fetch backup records
  const { data: backupRecords, isLoading: backupsLoading } = useQuery({
    queryKey: ['backup_records'],
    queryFn: async (): Promise<BackupRecord[]> => {
      // Mock backup data - in production, this would connect to actual backup systems
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          backup_type: 'full',
          status: 'completed',
          size_mb: 2048,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          completed_at: new Date(Date.now() - 86400000 + 1800000).toISOString(),
          retention_days: 30,
          backup_location: 's3://camerpulse-backups/full-backup-2024-01-15.sql.gz',
          metadata: {
            tables_count: 245,
            rows_count: 1250000,
            compression_ratio: 0.15
          }
        },
        {
          id: '2',
          backup_type: 'incremental',
          status: 'completed',
          size_mb: 156,
          created_at: new Date(Date.now() - 43200000).toISOString(),
          completed_at: new Date(Date.now() - 43200000 + 300000).toISOString(),
          retention_days: 7,
          backup_location: 's3://camerpulse-backups/inc-backup-2024-01-16.sql.gz',
          metadata: {
            tables_count: 245,
            rows_count: 15000,
            compression_ratio: 0.12
          }
        },
        {
          id: '3',
          backup_type: 'full',
          status: 'running',
          size_mb: 0,
          created_at: new Date().toISOString(),
          completed_at: null,
          retention_days: 30,
          backup_location: 's3://camerpulse-backups/full-backup-2024-01-17.sql.gz',
          metadata: {
            tables_count: 245,
            rows_count: 0,
            compression_ratio: 0
          }
        }
      ];

      return mockBackups;
    },
    enabled: hasPermission('all') || hasPermission('backup_management')
  });

  // Fetch restore jobs
  const { data: restoreJobs, isLoading: restoreLoading } = useQuery({
    queryKey: ['restore_jobs'],
    queryFn: async (): Promise<RestoreJob[]> => {
      const mockRestores: RestoreJob[] = [
        {
          id: '1',
          backup_id: '1',
          status: 'completed',
          target_environment: 'development',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 1800000).toISOString(),
          progress_percentage: 100
        }
      ];

      return mockRestores;
    },
    enabled: hasPermission('all') || hasPermission('backup_management')
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (backupType: string) => {
      await logActivity('backup_initiated', { backup_type: backupType });
      
      // Simulate backup creation
      return {
        backup_id: `backup_${Date.now()}`,
        backup_type: backupType,
        status: 'pending'
      };
    },
    onSuccess: () => {
      toast({
        title: "Backup Initiated",
        description: "Database backup has been started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['backup_records'] });
    }
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async ({ backupId, targetEnv }: { backupId: string; targetEnv: string }) => {
      await logActivity('restore_initiated', { 
        backup_id: backupId, 
        target_environment: targetEnv 
      });
      
      return {
        restore_id: `restore_${Date.now()}`,
        backup_id: backupId,
        target_environment: targetEnv
      };
    },
    onSuccess: () => {
      toast({
        title: "Restore Initiated",
        description: "Database restore has been started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['restore_jobs'] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1024) {
      return `${sizeInMB} MB`;
    }
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
  };

  if (!hasPermission('all') && !hasPermission('backup_management')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You need backup management permissions to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Database className="h-6 w-6 mr-2 text-purple-600" />
            Backup & Recovery Management
          </h2>
          <p className="text-muted-foreground">
            Database backup, restore, and disaster recovery operations
          </p>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {backupRecords?.filter(b => b.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Completed Backups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {backupRecords?.reduce((sum, b) => sum + b.size_mb, 0) || 0} MB
                </p>
                <p className="text-sm text-muted-foreground">Total Backup Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {backupRecords?.filter(b => b.status === 'running').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">24h</p>
                <p className="text-sm text-muted-foreground">Last Full Backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">Backup Management</TabsTrigger>
          <TabsTrigger value="restore">Restore Operations</TabsTrigger>
          <TabsTrigger value="schedule">Backup Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="backups">
          <div className="space-y-4">
            {/* Create New Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Backup</CardTitle>
                <CardDescription>
                  Initiate a new database backup operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="backup-type">Backup Type</Label>
                    <Select value={selectedBackupType} onValueChange={setSelectedBackupType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="incremental">Incremental Backup</SelectItem>
                        <SelectItem value="differential">Differential Backup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={() => createBackupMutation.mutate(selectedBackupType)}
                    disabled={createBackupMutation.isPending}
                    className="mt-6"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Create Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backupRecords?.map((backup) => (
                    <div key={backup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(backup.status)}
                          <div>
                            <h3 className="font-semibold">
                              {backup.backup_type.charAt(0).toUpperCase() + backup.backup_type.slice(1)} Backup
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(backup.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status.toUpperCase()}
                          </Badge>
                          {backup.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {backup.status === 'running' && (
                        <div className="mb-3">
                          <Progress value={65} className="w-full" />
                          <p className="text-sm text-muted-foreground mt-1">
                            Backup in progress... 65% complete
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Size:</span>
                          <span className="ml-1">{formatFileSize(backup.size_mb)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Tables:</span>
                          <span className="ml-1">{backup.metadata.tables_count}</span>
                        </div>
                        <div>
                          <span className="font-medium">Rows:</span>
                          <span className="ml-1">{backup.metadata.rows_count.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Retention:</span>
                          <span className="ml-1">{backup.retention_days} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="restore">
          <div className="space-y-4">
            {/* Restore Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Restore Database</CardTitle>
                <CardDescription>
                  Restore database from a previous backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Database restore operations will overwrite existing data. 
                    Ensure you have a current backup before proceeding.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-env">Target Environment</Label>
                    <Select value={restoreTarget} onValueChange={setRestoreTarget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production" disabled>
                          Production (Restricted)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Backups for Restore */}
            <Card>
              <CardHeader>
                <CardTitle>Available Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backupRecords?.filter(b => b.status === 'completed').map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">
                          {backup.backup_type.charAt(0).toUpperCase() + backup.backup_type.slice(1)} Backup
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(backup.created_at).toLocaleString()} • {formatFileSize(backup.size_mb)}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => restoreBackupMutation.mutate({
                          backupId: backup.id,
                          targetEnv: restoreTarget
                        })}
                        disabled={restoreBackupMutation.isPending}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Restore History */}
            {restoreJobs && restoreJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Restore Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {restoreJobs.map((restore) => (
                      <div key={restore.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              Restore to {restore.target_environment}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(restore.started_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(restore.status)}>
                            {restore.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {restore.status === 'running' && (
                          <div className="mt-3">
                            <Progress value={restore.progress_percentage} />
                            <p className="text-sm text-muted-foreground mt-1">
                              {restore.progress_percentage}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automated Backup Schedule</CardTitle>
              <CardDescription>
                Configure automated backup scheduling and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Backup Scheduling</h3>
                <p className="text-muted-foreground">
                  Configure automated backup schedules and retention policies
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>
                Global backup and recovery settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Backup Settings</h3>
                <p className="text-muted-foreground">
                  Configure backup storage, encryption, and global policies
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};