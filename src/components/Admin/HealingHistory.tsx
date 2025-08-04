import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CheckCircle, XCircle, Clock, Search, RefreshCw, FileCode, Undo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface HealingHistory {
  id: string;
  error_id: string;
  fix_applied: boolean;
  fix_confidence: number;
  fix_method: string;
  fix_description: string;
  code_changes: any;
  result_status: string;
  error_message?: string;
  created_at: string;
  applied_by: string;
  files_modified: string[];
  backup_created: boolean;
  rollback_info: any;
}

export default function HealingHistory() {
  const [healingHistory, setHealingHistory] = useState<HealingHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HealingHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [autoHealerStatus, setAutoHealerStatus] = useState<{
    enabled: boolean;
    lastRun: string;
    nextRun: string;
  }>({
    enabled: false,
    lastRun: 'Never',
    nextRun: 'Not scheduled'
  });

  useEffect(() => {
    loadHealingHistory();
    loadAutoHealerStatus();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [healingHistory, searchTerm, statusFilter]);

  const loadHealingHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ashen_auto_healing_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHealingHistory(data || []);
    } catch (error) {
      console.error('Error loading healing history:', error);
      toast.error('Failed to load healing history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutoHealerStatus = async () => {
    try {
      const { data: configs } = await supabase
        .from('ashen_monitoring_config')
        .select('config_key, config_value')
        .in('config_key', ['auto_healing_enabled', 'auto_healing_last_run']);

      if (configs) {
        const enabled = configs.find(c => c.config_key === 'auto_healing_enabled')?.config_value === true;
        const lastRunConfig = configs.find(c => c.config_key === 'auto_healing_last_run')?.config_value;
        
        let lastRunFormatted = 'Never';
        if (lastRunConfig && typeof lastRunConfig === 'string' && lastRunConfig !== 'never') {
          try {
            lastRunFormatted = format(new Date(lastRunConfig), 'MMM dd, yyyy HH:mm');
          } catch {
            lastRunFormatted = 'Never';
          }
        }
        
        setAutoHealerStatus({
          enabled,
          lastRun: lastRunFormatted,
          nextRun: enabled ? 'Every 6 hours' : 'Disabled'
        });
      }
    } catch (error) {
      console.error('Error loading auto-healer status:', error);
    }
  };

  const filterHistory = () => {
    let filtered = healingHistory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.fix_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.files_modified.some(file => file.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'applied') {
        filtered = filtered.filter(item => item.fix_applied);
      } else if (statusFilter === 'suggested') {
        filtered = filtered.filter(item => !item.fix_applied);
      } else {
        filtered = filtered.filter(item => item.result_status === statusFilter);
      }
    }

    setFilteredHistory(filtered);
  };

  const runAutoHealer = async () => {
    try {
      setIsLoading(true);
      toast.info('Running auto-healer...');
      
      const { data, error } = await supabase.functions.invoke('ashen-auto-healer');
      
      if (error) throw error;
      
      toast.success(`Auto-healer completed. Healed: ${data.healed}, Suggestions: ${data.suggestions}`);
      await loadHealingHistory();
      await loadAutoHealerStatus();
    } catch (error) {
      console.error('Error running auto-healer:', error);
      toast.error('Failed to run auto-healer');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, fixApplied: boolean) => {
    if (fixApplied) return 'default';
    if (status === 'success') return 'default';
    if (status === 'failed') return 'destructive';
    if (status === 'suggestion_only') return 'secondary';
    return 'outline';
  };

  const getStatusIcon = (status: string, fixApplied: boolean) => {
    if (fixApplied) return <CheckCircle className="h-4 w-4" />;
    if (status === 'failed') return <XCircle className="h-4 w-4" />;
    if (status === 'suggestion_only') return <FileCode className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span>Healing History</span>
          </h2>
          <p className="text-muted-foreground">Auto-healer repair log and suggestions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={runAutoHealer} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run Auto-Healer
          </Button>
          <Button variant="outline" onClick={loadHealingHistory} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Auto-Healer Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Auto-Healer Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${autoHealerStatus.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">{autoHealerStatus.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Run</p>
              <p className="font-medium">{autoHealerStatus.lastRun}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Run</p>
              <p className="font-medium">{autoHealerStatus.nextRun}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{healingHistory.filter(h => h.fix_applied).length}</p>
                <p className="text-sm text-muted-foreground">Auto-Fixed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileCode className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{healingHistory.filter(h => !h.fix_applied).length}</p>
                <p className="text-sm text-muted-foreground">Suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{healingHistory.filter(h => h.result_status === 'failed').length}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Undo className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{healingHistory.filter(h => h.backup_created).length}</p>
                <p className="text-sm text-muted-foreground">Backed Up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search healing history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Auto-Fixed</SelectItem>
                <SelectItem value="suggested">Suggestions Only</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="suggestion_only">Manual Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Healing History List */}
      <Card>
        <CardHeader>
          <CardTitle>Healing History ({filteredHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading healing history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No healing history found</p>
              <p className="text-sm">Auto-healer hasn't run yet or no fixes were needed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge variant={getStatusColor(item.result_status, item.fix_applied)} className="flex items-center space-x-1">
                          {getStatusIcon(item.result_status, item.fix_applied)}
                          <span>{item.fix_applied ? 'Auto-Fixed' : 'Suggestion'}</span>
                        </Badge>
                        <Badge variant="outline">
                          {item.fix_method}
                        </Badge>
                        {item.backup_created && (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Undo className="h-3 w-3" />
                            <span>Backed Up</span>
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">
                          Files: {item.files_modified.join(', ') || 'No files modified'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Applied by: {item.applied_by}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(item.fix_confidence)}`}>
                        {Math.round(item.fix_confidence * 100)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">{item.fix_description}</p>
                    
                    {item.error_message && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <h5 className="font-medium text-red-900 mb-1">Error:</h5>
                        <p className="text-sm text-red-800">{item.error_message}</p>
                      </div>
                    )}

                    {item.code_changes && Object.keys(item.code_changes).length > 0 && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <h5 className="font-medium text-green-900 mb-1">Code Changes:</h5>
                        <pre className="text-xs text-green-800 overflow-auto">
                          {JSON.stringify(item.code_changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}