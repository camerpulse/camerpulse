import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Calendar, User, TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditEntry {
  id: string;
  reputation_id: string;
  old_score: number;
  new_score: number;
  score_change: number;
  change_reason: string;
  change_source: string;
  calculation_details: any;
  changed_at: string;
}

interface ScoreSource {
  id: string;
  reputation_id: string;
  source_type: string;
  source_reference_id: string | null;
  score_impact: number;
  weight: number;
  description: string;
  verified: boolean;
  created_at: string;
  created_by: string | null;
}

const CHANGE_SOURCES = [
  { value: 'system', label: 'Automatic Calculation', icon: Activity },
  { value: 'admin_override', label: 'Admin Override', icon: User },
  { value: 'admin_rollback', label: 'Admin Rollback', icon: TrendingDown },
  { value: 'ai_adjustment', label: 'AI Adjustment', icon: TrendingUp }
];

export function AuditLogsViewer() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [scoreSources, setScoreSources] = useState<ScoreSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [viewMode, setViewMode] = useState<'history' | 'sources'>('history');
  const { toast } = useToast();

  useEffect(() => {
    if (viewMode === 'history') {
      fetchAuditHistory();
    } else {
      fetchScoreSources();
    }
  }, [filterSource, dateFilter, viewMode]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      
      // Placeholder audit data for demo
      const placeholderAudits: AuditEntry[] = [
        {
          id: '1',
          reputation_id: 'rep-1',
          old_score: 72,
          new_score: 68,
          score_change: -4,
          change_reason: 'Automatic calculation based on new citizen feedback',
          change_source: 'system',
          calculation_details: { 
            transparency_score: 65, 
            performance_score: 70, 
            citizen_rating: 2.8 
          },
          changed_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          reputation_id: 'rep-2',
          old_score: 45,
          new_score: 75,
          score_change: 30,
          change_reason: 'Emergency manual adjustment - corruption allegations cleared',
          change_source: 'admin_override',
          calculation_details: null,
          changed_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          reputation_id: 'rep-3',
          old_score: 82,
          new_score: 85,
          score_change: 3,
          change_reason: 'AI adjustment based on sentiment analysis improvement',
          change_source: 'ai_adjustment',
          calculation_details: { 
            sentiment_improvement: 0.15, 
            media_mentions: 'positive_trend' 
          },
          changed_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setAuditEntries(placeholderAudits.filter(entry => {
        if (filterSource !== 'all' && entry.change_source !== filterSource) return false;
        return true;
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load audit history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScoreSources = async () => {
    try {
      setLoading(true);
      
      // Placeholder score sources for demo
      const placeholderSources: ScoreSource[] = [
        {
          id: '1',
          reputation_id: 'rep-1',
          source_type: 'bill_passed',
          source_reference_id: 'bill-2024-001',
          score_impact: 10,
          weight: 1.0,
          description: 'Successfully sponsored Education Reform Bill 2024',
          verified: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          created_by: 'system'
        },
        {
          id: '2',
          reputation_id: 'rep-1',
          source_type: 'citizen_rating',
          source_reference_id: null,
          score_impact: -5,
          weight: 0.8,
          description: 'Negative citizen feedback on transparency measures',
          verified: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          created_by: 'citizen-123'
        },
        {
          id: '3',
          reputation_id: 'rep-2',
          source_type: 'audit_result',
          source_reference_id: 'audit-2024-q1',
          score_impact: 15,
          weight: 1.2,
          description: 'Excellent performance in quarterly transparency audit',
          verified: true,
          created_at: new Date(Date.now() - 259200000).toISOString(),
          created_by: 'auditor-456'
        }
      ];

      setScoreSources(placeholderSources);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load score sources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (change: number, source: string) => {
    if (source === 'admin_override') return <User className="h-4 w-4 text-blue-500" />;
    if (source === 'admin_rollback') return <TrendingDown className="h-4 w-4 text-orange-500" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getSourceBadge = (source: string) => {
    const config = CHANGE_SOURCES.find(s => s.value === source);
    return (
      <Badge variant="secondary">
        {config?.label || source}
      </Badge>
    );
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Log Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">View Mode</label>
            <Select value={viewMode} onValueChange={(value: 'history' | 'sources') => setViewMode(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="history">Score History</SelectItem>
                <SelectItem value="sources">Score Sources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'history' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Filter</label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {CHANGE_SOURCES.map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={viewMode === 'history' ? fetchAuditHistory : fetchScoreSources} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewMode === 'history' ? 'Score Change History' : 'Score Source Logs'}
            </span>
            <Badge variant="secondary">
              {viewMode === 'history' ? auditEntries.length : scoreSources.length} entries
            </Badge>
          </CardTitle>
          <CardDescription>
            {viewMode === 'history' 
              ? 'Comprehensive log of all reputation score changes and their sources'
              : 'Detailed breakdown of score calculation inputs and their impact'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading audit logs...</p>
            </div>
          ) : viewMode === 'history' ? (
            auditEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found for the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(entry.score_change, entry.change_source)}
                      {getSourceBadge(entry.change_source)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {entry.old_score} → {entry.new_score}
                        </span>
                        <span className={`text-sm font-medium ${entry.score_change > 0 ? 'text-green-600' : entry.score_change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          ({entry.score_change > 0 ? '+' : ''}{entry.score_change})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{entry.change_reason}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.changed_at).toLocaleString()}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Audit Entry Details
                          </DialogTitle>
                          <DialogDescription>
                            Detailed information about this score change
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedEntry && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Score Change</label>
                                <div className="text-lg font-semibold">
                                  {selectedEntry.old_score} → {selectedEntry.new_score}
                                  <span className={`ml-2 text-sm ${selectedEntry.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({selectedEntry.score_change > 0 ? '+' : ''}{selectedEntry.score_change})
                                  </span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Source</label>
                                <div className="mt-1">{getSourceBadge(selectedEntry.change_source)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Change Reason</label>
                              <p className="mt-1 text-sm">{selectedEntry.change_reason}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Timestamp</label>
                              <p className="mt-1 text-sm">{new Date(selectedEntry.changed_at).toLocaleString()}</p>
                            </div>

                            {selectedEntry.calculation_details && (
                              <div>
                                <label className="text-sm font-medium">Calculation Details</label>
                                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(selectedEntry.calculation_details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Score Sources View
            scoreSources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No score sources found for the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scoreSources.map((source) => (
                  <div key={source.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant={source.verified ? 'default' : 'secondary'}>
                        {source.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Badge variant="outline">{source.source_type}</Badge>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{source.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className={`font-medium ${getImpactColor(source.score_impact)}`}>
                          Impact: {source.score_impact > 0 ? '+' : ''}{source.score_impact}
                        </span>
                        <span>Weight: {source.weight}</span>
                        <span>{new Date(source.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}