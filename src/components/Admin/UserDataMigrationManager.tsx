import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  PlayCircle,
  RefreshCw,
  FileText,
  Link,
  TestTube
} from 'lucide-react';

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  function: string;
  results?: any;
  error?: string;
}

interface DuplicateProfile {
  primary_profile_id: string;
  duplicate_profile_ids: string[];
  match_type: string;
  confidence_score: number;
  merge_strategy: any;
}

/**
 * Comprehensive User Data Migration Manager
 * Handles legacy data consolidation with duplicate detection and cleanup
 */
export const UserDataMigrationManager: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'detect_duplicates',
      name: 'Detect Duplicates',
      description: 'Scan for duplicate profiles by email, username, and display name',
      status: 'pending',
      function: 'detect_user_duplicates'
    },
    {
      id: 'merge_profiles',
      name: 'Merge Duplicates',
      description: 'Intelligently merge duplicate profiles preserving all data',
      status: 'pending',
      function: 'merge_duplicate_profiles'
    },
    {
      id: 'clean_usernames',
      name: 'Clean Usernames',
      description: 'Generate clean, SEO-friendly usernames using slug function',
      status: 'pending',
      function: 'clean_and_generate_usernames'
    },
    {
      id: 'validate_urls',
      name: 'Validate URLs',
      description: 'Validate and update profile URLs and permalinks',
      status: 'pending',
      function: 'validate_migrated_urls'
    },
    {
      id: 'smoke_tests',
      name: 'Smoke Tests',
      description: 'Run comprehensive tests to verify migration integrity',
      status: 'pending',
      function: 'run_migration_smoke_tests'
    }
  ]);

  const [duplicates, setDuplicates] = useState<DuplicateProfile[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadMigrationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_migration_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMigrationLogs(data || []);
    } catch (error) {
      console.error('Failed to load migration logs:', error);
    }
  };

  const runMigrationStep = async (step: MigrationStep): Promise<any> => {
    setMigrationSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, status: 'running' } : s
    ));

    try {
      let result;
      
      switch (step.function) {
        case 'detect_user_duplicates':
          const { data: duplicatesData, error: duplicatesError } = await supabase
            .rpc('detect_user_duplicates');
          if (duplicatesError) throw duplicatesError;
          setDuplicates(duplicatesData || []);
          result = { duplicates_found: duplicatesData?.length || 0 };
          break;

        case 'clean_and_generate_usernames':
          const { data: usernameData, error: usernameError } = await supabase
            .rpc('clean_and_generate_usernames');
          if (usernameError) throw usernameError;
          result = { usernames_cleaned: usernameData?.length || 0 };
          break;

        case 'validate_migrated_urls':
          const { data: urlData, error: urlError } = await supabase
            .rpc('validate_migrated_urls');
          if (urlError) throw urlError;
          result = { urls_validated: urlData?.length || 0 };
          break;

        case 'run_migration_smoke_tests':
          const { data: testData, error: testError } = await supabase
            .rpc('run_migration_smoke_tests');
          if (testError) throw testError;
          result = testData;
          break;

        default:
          throw new Error(`Unknown migration function: ${step.function}`);
      }

      setMigrationSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'completed', results: result } : s
      ));

      return result;
    } catch (error) {
      console.error(`Migration step ${step.id} failed:`, error);
      setMigrationSteps(prev => prev.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : s
      ));
      throw error;
    }
  };

  const mergeDuplicate = async (duplicate: DuplicateProfile) => {
    try {
      const { data, error } = await supabase
        .rpc('merge_duplicate_profiles', {
          p_primary_profile_id: duplicate.primary_profile_id,
          p_duplicate_profile_ids: duplicate.duplicate_profile_ids
        });

      if (error) throw error;

      toast({
        title: "Profiles Merged",
        description: `Successfully merged ${duplicate.duplicate_profile_ids.length} duplicate profiles`,
      });

      // Refresh duplicates list
      await runMigrationStep(migrationSteps.find(s => s.id === 'detect_duplicates')!);
    } catch (error) {
      console.error('Failed to merge profiles:', error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge duplicate profiles. Check logs for details.",
        variant: "destructive",
      });
    }
  };

  const runFullMigration = async () => {
    setIsRunning(true);
    
    try {
      for (const step of migrationSteps.filter(s => s.id !== 'merge_profiles')) {
        await runMigrationStep(step);
        
        // Brief pause between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Migration Completed",
        description: "User data migration completed successfully!",
      });
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration Failed",
        description: "Migration encountered errors. Check the logs for details.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      await loadMigrationLogs();
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepProgress = () => {
    const completed = migrationSteps.filter(s => s.status === 'completed').length;
    return (completed / migrationSteps.length) * 100;
  };

  useEffect(() => {
    if (isAdmin()) {
      loadMigrationLogs();
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You need administrator privileges to access the migration manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Data Migration Manager</h1>
          <p className="text-muted-foreground">
            Consolidate legacy user data and clean up duplicates
          </p>
        </div>
        <Button 
          onClick={runFullMigration} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Migration...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Start Full Migration
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Migration Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {migrationSteps.filter(s => s.status === 'completed').length} / {migrationSteps.length} completed
                    </span>
                  </div>
                  <Progress value={getStepProgress()} className="h-2" />
                </div>

                <div className="grid gap-4">
                  {migrationSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStepIcon(step.status)}
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.error && (
                            <p className="text-sm text-red-500 mt-1">Error: {step.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'failed' ? 'destructive' :
                          step.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {step.status}
                        </Badge>
                        {step.status === 'pending' && step.id !== 'merge_profiles' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runMigrationStep(step)}
                            disabled={isRunning}
                          >
                            Run Step
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Duplicate Profiles ({duplicates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {duplicates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No Duplicates Found</p>
                  <p className="text-muted-foreground">
                    Run duplicate detection to identify potential duplicate profiles.
                  </p>
                  <Button 
                    onClick={() => runMigrationStep(migrationSteps.find(s => s.id === 'detect_duplicates')!)}
                    className="mt-4"
                  >
                    Scan for Duplicates
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicates.map((duplicate, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{duplicate.match_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Confidence: {Math.round(duplicate.confidence_score * 100)}%
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => mergeDuplicate(duplicate)}
                        >
                          Merge Profiles
                        </Button>
                      </div>
                      
                      <div className="text-sm">
                        <p><strong>Primary Profile:</strong> {duplicate.primary_profile_id}</p>
                        <p><strong>Duplicates:</strong> {duplicate.duplicate_profile_ids.join(', ')}</p>
                        <p><strong>Strategy:</strong> {duplicate.merge_strategy.strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Migration Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {migrationLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        log.status === 'completed' ? 'default' :
                        log.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {log.migration_step}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Records Processed:</strong> {log.records_processed || 0}</p>
                        <p><strong>Records Migrated:</strong> {log.records_migrated || 0}</p>
                      </div>
                      <div>
                        <p><strong>Duplicates Found:</strong> {log.duplicates_found || 0}</p>
                        <p><strong>Errors:</strong> {log.errors_count || 0}</p>
                      </div>
                    </div>
                    
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Migration Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Run smoke tests to verify the integrity of the migration and ensure all data is properly consolidated.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={() => runMigrationStep(migrationSteps.find(s => s.id === 'smoke_tests')!)}
                  className="w-full"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Smoke Tests
                </Button>

                {migrationSteps.find(s => s.id === 'smoke_tests')?.results && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Test Results</h4>
                    <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(migrationSteps.find(s => s.id === 'smoke_tests')?.results, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};