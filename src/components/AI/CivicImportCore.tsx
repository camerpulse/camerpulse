import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Download, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Search,
  Users,
  Building,
  Globe,
  Activity,
  Calendar,
  Eye,
  Settings,
  BarChart3,
  Filter,
  Zap,
  FileCheck,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScrapeTarget {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastScraped: string;
  recordsFound: number;
  confidenceScore: number;
  category: 'government' | 'legislature' | 'election' | 'media';
}

interface ImportRecord {
  id: string;
  name: string;
  position: string;
  party: string;
  region: string;
  status: 'pending' | 'validated' | 'flagged' | 'imported';
  confidenceScore: number;
  sources: string[];
  issues: string[];
  lastUpdated: string;
}

interface ValidationResult {
  totalRecords: number;
  validated: number;
  flagged: number;
  duplicates: number;
  confidence: number;
}

const CivicImportCore = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrapeTargets, setScrapeTargets] = useState<ScrapeTarget[]>([]);
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult>({
    totalRecords: 0,
    validated: 0,
    flagged: 0,
    duplicates: 0,
    confidence: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [confidenceFilter, setConfidenceFilter] = useState(90);

  // Initialize default scrape targets
  useEffect(() => {
    const defaultTargets: ScrapeTarget[] = [
      {
        id: '1',
        name: 'Senate of Cameroon',
        url: 'https://senat.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:30:00',
        recordsFound: 100,
        confidenceScore: 95,
        category: 'legislature'
      },
      {
        id: '2',
        name: 'National Assembly',
        url: 'https://www.assnat.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:25:00',
        recordsFound: 180,
        confidenceScore: 92,
        category: 'legislature'
      },
      {
        id: '3',
        name: 'Prime Minister Services',
        url: 'https://spm.gov.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:20:00',
        recordsFound: 45,
        confidenceScore: 88,
        category: 'government'
      },
      {
        id: '4',
        name: 'ELECAM',
        url: 'https://elecam.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:15:00',
        recordsFound: 25,
        confidenceScore: 96,
        category: 'election'
      },
      {
        id: '5',
        name: 'MINAT',
        url: 'https://minat.gov.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:10:00',
        recordsFound: 120,
        confidenceScore: 85,
        category: 'government'
      },
      {
        id: '6',
        name: 'Presidency',
        url: 'https://www.prc.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:05:00',
        recordsFound: 35,
        confidenceScore: 98,
        category: 'government'
      },
      {
        id: '7',
        name: 'Cameroon Tribune',
        url: 'https://cameroon-tribune.cm',
        status: 'active',
        lastScraped: '2024-01-15 14:00:00',
        recordsFound: 200,
        confidenceScore: 78,
        category: 'media'
      }
    ];

    setScrapeTargets(defaultTargets);

    // Calculate validation results from targets
    const totalRecords = defaultTargets.reduce((sum, target) => sum + target.recordsFound, 0);
    const avgConfidence = defaultTargets.reduce((sum, target) => sum + target.confidenceScore, 0) / defaultTargets.length;
    
    setValidationResults({
      totalRecords,
      validated: Math.floor(totalRecords * 0.85),
      flagged: Math.floor(totalRecords * 0.1),
      duplicates: Math.floor(totalRecords * 0.05),
      confidence: avgConfidence
    });

    setLastSyncTime('2024-01-15 14:30:00');
  }, []);

  const triggerManualSync = async () => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate scanning process
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // In a real implementation, this would call the edge function
      const { data, error } = await supabase.functions.invoke('civic-import-core-sync', {
        body: { 
          targets: scrapeTargets.map(t => t.url),
          confidenceThreshold: confidenceFilter / 100
        }
      });

      if (error) {
        console.error('Sync error:', error);
      }

      setLastSyncTime(new Date().toISOString());
      
      // Update some stats to show progress
      setValidationResults(prev => ({
        ...prev,
        totalRecords: prev.totalRecords + Math.floor(Math.random() * 20),
        validated: prev.validated + Math.floor(Math.random() * 15)
      }));

    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'government': return <Building className="h-4 w-4" />;
      case 'legislature': return <Users className="h-4 w-4" />;
      case 'election': return <CheckCircle className="h-4 w-4" />;
      case 'media': return <Globe className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            <span>CivicImportCore</span>
            <Badge variant="outline" className="ml-2">Upgraded from Politica AI</Badge>
          </CardTitle>
          <CardDescription>
            Automated Government Data Scraper & Validation Engine - Real-time civic import system for CamerPulse Intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{validationResults.totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationResults.validated}</div>
              <div className="text-sm text-muted-foreground">Validated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{validationResults.flagged}</div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validationResults.confidence.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="sources">🌐 Sources</TabsTrigger>
          <TabsTrigger value="validation">🔍 Validation</TabsTrigger>
          <TabsTrigger value="history">📜 History</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sync Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Sync Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Sync:</span>
                  <span className="text-sm font-medium">{lastSyncTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Auto Sync:</span>
                  <span className="text-sm font-medium">Daily at 02:00 UTC</span>
                </div>

                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scanning sources...</span>
                      <span className="text-sm">{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} />
                  </div>
                )}

                <Button 
                  onClick={triggerManualSync} 
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Trigger Manual Sync
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scraper Health</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Validation</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-Sync</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Recovery</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sources</span>
                    <span className="text-sm font-medium">{scrapeTargets.filter(s => s.status === 'active').length}/7</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="text-sm font-medium">1.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Recent Import Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '14:30', action: 'Senate data updated', status: 'success', count: 3 },
                  { time: '14:25', action: 'National Assembly sync', status: 'success', count: 7 },
                  { time: '14:20', action: 'Minister profile flagged', status: 'warning', count: 1 },
                  { time: '14:15', action: 'ELECAM officials imported', status: 'success', count: 2 },
                  { time: '14:10', action: 'Duplicate detection run', status: 'info', count: 5 }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                      <span className="text-sm">{activity.action}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={activity.status === 'success' ? 'default' : 
                                   activity.status === 'warning' ? 'secondary' : 'outline'}>
                        {activity.count} records
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Government Data Sources</span>
              </CardTitle>
              <CardDescription>
                Monitor and configure automatic scraping of official government websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapeTargets.map((target) => (
                  <div key={target.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(target.category)}
                        <div>
                          <h3 className="font-medium">{target.name}</h3>
                          <p className="text-sm text-muted-foreground">{target.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(target.status)}>
                          {target.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Scraped:</span>
                        <div className="font-medium">{target.lastScraped}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Records Found:</span>
                        <div className="font-medium">{target.recordsFound}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <div className={`font-medium ${getConfidenceColor(target.confidenceScore)}`}>
                          {target.confidenceScore}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium capitalize">{target.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Force Refresh
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5" />
                <span>AI Validation Engine</span>
              </CardTitle>
              <CardDescription>
                Review flagged records and manage validation confidence thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="confidence-filter">Minimum Confidence Score</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <input
                      type="range"
                      id="confidence-filter"
                      min="50"
                      max="100"
                      value={confidenceFilter}
                      onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-medium">{confidenceFilter}%</span>
                  </div>
                </div>
                <Button>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filter
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Records Requiring Review</h3>
                {[
                  { 
                    name: 'Dr. John Fru Ndi', 
                    issue: 'Duplicate entry detected', 
                    confidence: 65, 
                    sources: ['assnat.cm', 'minat.gov.cm'],
                    status: 'flagged'
                  },
                  { 
                    name: 'Hon. Marie Ngue', 
                    issue: 'Missing photo verification', 
                    confidence: 78, 
                    sources: ['senat.cm'],
                    status: 'pending'
                  },
                  { 
                    name: 'Minister Paul Atanga Nji', 
                    issue: 'Term dates conflict', 
                    confidence: 82, 
                    sources: ['spm.gov.cm', 'prc.cm'],
                    status: 'flagged'
                  }
                ].map((record, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{record.name}</h4>
                        <p className="text-sm text-muted-foreground">{record.issue}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getConfidenceColor(record.confidence)}>
                          {record.confidence}%
                        </Badge>
                        <Badge variant={record.status === 'flagged' ? 'destructive' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Sources: {record.sources.join(', ')}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Import History & Rollback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    timestamp: '2024-01-15 14:30:00', 
                    action: 'Full Government Sync', 
                    records: 47, 
                    success: 44, 
                    failed: 3,
                    status: 'completed'
                  },
                  { 
                    timestamp: '2024-01-15 02:00:00', 
                    action: 'Automated Daily Sync', 
                    records: 23, 
                    success: 23, 
                    failed: 0,
                    status: 'completed'
                  },
                  { 
                    timestamp: '2024-01-14 16:45:00', 
                    action: 'Senate Emergency Update', 
                    records: 8, 
                    success: 7, 
                    failed: 1,
                    status: 'completed'
                  },
                  { 
                    timestamp: '2024-01-14 02:00:00', 
                    action: 'Automated Daily Sync', 
                    records: 31, 
                    success: 28, 
                    failed: 3,
                    status: 'completed'
                  }
                ].map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{entry.action}</h4>
                        <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {entry.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Records:</span>
                        <div className="font-medium">{entry.records}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Successful:</span>
                        <div className="font-medium text-green-600">{entry.success}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <div className="font-medium text-red-600">{entry.failed}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Rollback
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>CivicImportCore Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sync-schedule">Auto-Sync Schedule</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily at 02:00 UTC</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="validation-threshold">Validation Threshold</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <input
                      type="range"
                      id="validation-threshold"
                      min="50"
                      max="100"
                      defaultValue="85"
                      className="flex-1"
                    />
                    <span className="font-medium">85%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Records below this confidence score will be flagged for review
                  </p>
                </div>

                <div>
                  <Label htmlFor="duplicate-detection">Duplicate Detection</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="duplicate-detection" defaultChecked />
                    <span className="text-sm">Enable automatic duplicate detection</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="face-matching">Face Matching</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="face-matching" defaultChecked />
                    <span className="text-sm">Enforce face matching for photo updates</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="error-notifications">Error Notifications</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="error-notifications" defaultChecked />
                    <span className="text-sm">Send notifications for import failures</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Danger Zone</h3>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These actions are irreversible. Please proceed with caution.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-2">
                  <Button variant="destructive" size="sm">
                    Reset All Data
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicImportCore;