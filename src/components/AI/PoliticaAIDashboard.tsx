import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Activity, CheckCircle, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import { BulkImportButton } from "./BulkImportButton";
import { CivicNarrativeGenerator } from "./CivicNarrativeGenerator";
import SignalIntelligenceCore from "./SignalIntelligenceCore";
import { useToast } from "@/hooks/use-toast";

interface AIStats {
  total_scans: number;
  verified_politicians: number;
  verified_parties: number;
  pending_reviews: number;
  recent_activity: number;
}

interface AILog {
  id: string;
  target_type: string;
  action_type: string;
  status: string;
  created_at: string;
  completed_at?: string;
  ai_confidence_score?: number;
  changes_made: any;
  sources_verified?: any;
  error_message?: string;
}

export const PoliticaAIDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Fetch AI statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["politica-ai-stats"],
    queryFn: async (): Promise<AIStats> => {
      const [logsResult, politiciansResult, partiesResult] = await Promise.all([
        supabase.from("politica_ai_logs").select("id, status, created_at"),
        supabase.from("politician_ai_verification").select("verification_status"),
        supabase.from("party_ai_verification").select("verification_status")
      ]);

      const logs = logsResult.data || [];
      const politicians = politiciansResult.data || [];
      const parties = partiesResult.data || [];

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      return {
        total_scans: logs.length,
        verified_politicians: politicians.filter(p => p.verification_status === 'verified').length,
        verified_parties: parties.filter(p => p.verification_status === 'verified').length,
        pending_reviews: logs.filter(l => l.status === 'requires_review').length,
        recent_activity: logs.filter(l => new Date(l.created_at) > twentyFourHoursAgo).length
      };
    }
  });

  // Fetch recent AI activity
  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["politica-ai-recent-logs"],
    queryFn: async (): Promise<AILog[]> => {
      const { data, error } = await supabase
        .from("politica_ai_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch AI configuration
  const { data: config } = useQuery({
    queryKey: ["politica-ai-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politica_ai_config")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    }
  });

  // Trigger scan mutation
  const triggerScanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('politica-ai-manager', {
        body: { action: 'trigger_scan' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Scan Triggered",
        description: `Politica AI scan started for ${data.politicians_scanned + data.parties_scanned} profiles`,
      });
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["politica-ai-stats"] });
      queryClient.invalidateQueries({ queryKey: ["politica-ai-recent-logs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to trigger Politica AI scan",
        variant: "destructive",
      });
    }
  });

  const triggerScan = () => {
    triggerScanMutation.mutate();
  };

  if (statsLoading) {
    return <div>Loading Politica AI Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8" />
            Politica AI
          </h1>
          <p className="text-muted-foreground">
            Autonomous fact-checking and verification system
          </p>
        </div>
        <div className="flex gap-2">
          <BulkImportButton />
          <Button 
            variant="outline" 
            onClick={triggerScan}
            disabled={triggerScanMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${triggerScanMutation.isPending ? 'animate-spin' : ''}`} />
            {triggerScanMutation.isPending ? 'Scanning...' : 'Trigger Scan'}
          </Button>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            View Logs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_scans || 0}</div>
            <p className="text-xs text-muted-foreground">
              All verification scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Politicians</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.verified_politicians || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI verified profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Parties</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.verified_parties || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI verified parties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require admin review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="intelligence">Signal Intelligence</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
              <CardDescription>
                Latest verification scans and detailed field updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div>Loading activity...</div>
              ) : (
                <div className="space-y-4">
                  {recentLogs?.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {log.action_type.toUpperCase()} - {log.target_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(log.created_at).toLocaleString()}
                            {log.completed_at && (
                              <span> • Completed: {new Date(log.completed_at).toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.ai_confidence_score && (
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {Math.round(log.ai_confidence_score * 100)}% confidence
                            </Badge>
                          )}
                          <Badge variant={
                            log.status === 'completed' ? 'default' :
                            log.status === 'failed' ? 'destructive' :
                            log.status === 'requires_review' ? 'secondary' : 'outline'
                          } className="text-sm px-3 py-1">
                            {log.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Sources Verified */}
                      {log.sources_verified && Array.isArray(log.sources_verified) && log.sources_verified.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="font-medium text-sm text-blue-900 mb-2">
                            🔍 Sources Verified ({log.sources_verified.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {log.sources_verified.map((source: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Changes */}
                      {log.changes_made && Array.isArray(log.changes_made) && log.changes_made.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">
                            📝 Field Updates ({log.changes_made.length}):
                          </p>
                          <div className="grid gap-2">
                            {log.changes_made.map((change: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm">
                                <div className="flex items-start justify-between mb-1">
                                  <span className="font-medium text-gray-900 capitalize">
                                    {change.field?.replace(/_/g, ' ')}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round((change.confidence || 0) * 100)}% confidence
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-gray-600">
                                    <span className="font-medium">Before:</span> {change.current_value || 'Empty'}
                                  </p>
                                  <p className="text-gray-900">
                                    <span className="font-medium">After:</span> {change.found_value || 'No change'}
                                  </p>
                                  {change.source_url && (
                                    <p className="text-blue-600 text-xs">
                                      Source: {change.source_url}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {log.error_message && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="font-medium text-sm text-red-900 mb-1">❌ Error:</p>
                          <p className="text-red-700 text-sm">{log.error_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {recentLogs?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent AI activity found. Click "Trigger Scan" to start verification.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Current Politica AI settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.config_key}</h4>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(item.config_value, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <SignalIntelligenceCore />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CivicNarrativeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};