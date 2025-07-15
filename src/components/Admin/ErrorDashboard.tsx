import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Clock, Eye, X, Filter, Search, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ErrorLog {
  id: string;
  component_path: string;
  error_type: string;
  error_message: string;
  severity: string;
  confidence_score: number;
  suggested_fix: string;
  status: string;
  created_at: string;
  screenshot_url?: string;
  line_number?: number;
  metadata?: any;
}

export default function ErrorDashboard() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadErrorLogs();
  }, []);

  useEffect(() => {
    filterErrors();
  }, [errorLogs, searchTerm, sourceFilter, severityFilter, statusFilter]);

  const loadErrorLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setErrorLogs(data || []);
    } catch (error) {
      console.error('Error loading error logs:', error);
      toast.error('Failed to load error logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterErrors = () => {
    let filtered = errorLogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(error =>
        error.component_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.suggested_fix?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter (derived from error_type)
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(error => {
        const source = getErrorSource(error.error_type);
        return source.toLowerCase() === sourceFilter;
      });
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(error => error.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(error => error.status === statusFilter);
    }

    setFilteredErrors(filtered);
  };

  const getErrorSource = (errorType: string): string => {
    if (errorType.includes('component') || errorType.includes('ui') || errorType.includes('render')) return 'UI';
    if (errorType.includes('api') || errorType.includes('network') || errorType.includes('request')) return 'API';
    if (errorType.includes('logic') || errorType.includes('validation') || errorType.includes('business')) return 'Logic';
    return 'Code';
  };

  const updateErrorStatus = async (errorId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ashen_error_logs')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
          resolved_by: newStatus === 'resolved' ? 'admin' : null
        })
        .eq('id', errorId);

      if (error) throw error;

      await loadErrorLogs();
      toast.success(`Error marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update error status');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'ignored': return 'secondary';
      default: return 'destructive';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'ignored': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Error Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage system errors</p>
        </div>
        <Button onClick={loadErrorLogs} disabled={isLoading}>
          <AlertCircle className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{errorLogs.filter(e => e.status === 'open').length}</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{errorLogs.filter(e => e.status === 'resolved').length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{errorLogs.filter(e => e.severity === 'high').length}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{errorLogs.filter(e => e.confidence_score >= 0.8).length}</p>
                <p className="text-sm text-muted-foreground">High Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="logic">Logic</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({filteredErrors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading error logs...</p>
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No errors found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredErrors.map((error) => (
                <div key={error.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge variant={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge variant="outline">
                          {getErrorSource(error.error_type)}
                        </Badge>
                        <Badge variant={getStatusColor(error.status)} className="flex items-center space-x-1">
                          {getStatusIcon(error.status)}
                          <span>{error.status}</span>
                        </Badge>
                        {error.screenshot_url && (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Image className="h-3 w-3" />
                            <span>Screenshot</span>
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">{error.component_path}</h4>
                        {error.line_number && (
                          <p className="text-sm text-muted-foreground">Line {error.line_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(error.confidence_score)}`}>
                        {Math.round(error.confidence_score * 100)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(error.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">{error.error_message}</p>
                    {error.suggested_fix && (
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Suggested Fix:</h5>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{error.suggested_fix}</p>
                      </div>
                    )}
                  </div>

                  {error.status === 'open' && (
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => updateErrorStatus(error.id, 'resolved')}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Mark Resolved</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateErrorStatus(error.id, 'ignored')}
                        className="flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Ignore</span>
                      </Button>
                      {error.screenshot_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(error.screenshot_url, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Screenshot</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}