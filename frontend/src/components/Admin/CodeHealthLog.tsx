import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  AlertTriangle, 
  FileCode, 
  Bug, 
  Zap, 
  Activity,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CodeIssue {
  id: string;
  component_path: string;
  error_type: string;
  error_message: string;
  line_number: number;
  severity: string;
  confidence_score: number;
  suggested_fix: string;
  created_at: string;
  metadata: any;
}

interface ScanSummary {
  files_scanned: number;
  total_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  quality_score: number;
  last_scan: string;
}

export default function CodeHealthLog() {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCodeHealthData();
  }, []);

  const loadCodeHealthData = async () => {
    try {
      // Load latest scan summary
      const { data: latestScan } = await supabase
        .from('ashen_code_analysis')
        .select('*')
        .eq('analysis_type', 'ast_code_scan')
        .order('last_analyzed', { ascending: false })
        .limit(1)
        .single();

      if (latestScan) {
        const metadata = latestScan.metadata as any;
        setSummary({
          files_scanned: metadata?.files_scanned || 0,
          total_issues: latestScan.issues_found,
          critical_issues: metadata?.issues_by_severity?.critical || 0,
          high_issues: metadata?.issues_by_severity?.high || 0,
          medium_issues: metadata?.issues_by_severity?.medium || 0,
          low_issues: metadata?.issues_by_severity?.low || 0,
          quality_score: latestScan.quality_score * 100,
          last_scan: latestScan.last_analyzed
        });
      }

      // Load code scan issues
      const { data: codeIssues } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .eq('status', 'code_scan')
        .order('created_at', { ascending: false })
        .limit(200);

      if (codeIssues) {
        setIssues(codeIssues);
      }

    } catch (error) {
      console.error('Error loading code health data:', error);
      toast.error('Failed to load code health data');
    }
  };

  const runCodeScan = async () => {
    setIsScanning(true);
    try {
      const response = await supabase.functions.invoke('ashen-code-scanner');
      
      if (response.error) {
        throw response.error;
      }

      toast.success('Code scan completed successfully');
      loadCodeHealthData(); // Refresh data
    } catch (error) {
      console.error('Error running code scan:', error);
      toast.error('Failed to run code scan');
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getFileTypeIcon = (filePath: string) => {
    if (filePath.includes('/components/')) return '🧩';
    if (filePath.includes('/pages/')) return '📄';
    if (filePath.includes('/hooks/')) return '🪝';
    if (filePath.includes('/functions/')) return '⚡';
    if (filePath.includes('/contexts/')) return '🔄';
    return '📁';
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesType = filterType === 'all' || issue.error_type === filterType;
    const matchesSearch = searchTerm === '' || 
      issue.component_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.error_message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesType && matchesSearch;
  });

  const uniqueTypes = Array.from(new Set(issues.map(issue => issue.error_type)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileCode className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Code Health Log</h1>
            <p className="text-muted-foreground">AST-powered code analysis and issue detection</p>
          </div>
        </div>
        <Button 
          onClick={runCodeScan} 
          disabled={isScanning}
          className="space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Run Code Scan'}</span>
        </Button>
      </div>

      {/* Scan Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Files Scanned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.files_scanned}</div>
              <p className="text-xs text-muted-foreground">
                Last scan: {new Date(summary.last_scan).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.total_issues}</div>
              <div className="text-xs text-muted-foreground">
                {summary.critical_issues} critical • {summary.high_issues} high
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{summary.quality_score.toFixed(1)}%</div>
                <Progress value={summary.quality_score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Issue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <span className="text-red-600">{summary.critical_issues}</span>
                </div>
                <div className="flex justify-between">
                  <span>High:</span>
                  <span className="text-orange-600">{summary.high_issues}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="text-yellow-600">{summary.medium_issues}</span>
                </div>
                <div className="flex justify-between">
                  <span>Low:</span>
                  <span className="text-blue-600">{summary.low_issues}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Files/Issues</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by file path or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="h-5 w-5" />
              <span>Code Issues ({filteredIssues.length})</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {getFileTypeIcon(issue.component_path)} {issue.component_path}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Line {issue.line_number}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{issue.error_message}</h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">
                        {issue.error_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {issue.suggested_fix && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <div className="flex items-start space-x-2">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Suggested Fix:</strong>
                          <p className="mt-1">{issue.suggested_fix}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Detected: {new Date(issue.created_at).toLocaleString()}
                    </span>
                    <span>
                      Confidence: {Math.round(issue.confidence_score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredIssues.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                  <p>No code issues match your current filters.</p>
                  {!summary && (
                    <Button 
                      onClick={runCodeScan} 
                      className="mt-4"
                      disabled={isScanning}
                    >
                      Run First Code Scan
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}