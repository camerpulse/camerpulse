import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag, AlertTriangle, CheckCircle, X, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReputationFlag {
  id: string;
  reputation_id: string;
  flag_type: string;
  flag_reason: string;
  evidence: string | null;
  severity: string;
  status: string;
  flagged_by: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

const FLAG_TYPES = [
  { value: 'manipulation', label: 'Score Manipulation', color: 'destructive' },
  { value: 'fake_data', label: 'Fake Data', color: 'destructive' },
  { value: 'bias', label: 'Algorithmic Bias', color: 'warning' },
  { value: 'spam', label: 'Spam/Flooding', color: 'warning' },
  { value: 'misinformation', label: 'Misinformation', color: 'destructive' }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'critical', label: 'Critical', color: 'destructive' }
];

export function FlagManagementInterface() {
  const [flags, setFlags] = useState<ReputationFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterType, setFilterType] = useState('all');
  const [selectedFlag, setSelectedFlag] = useState<ReputationFlag | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFlags();
  }, [filterStatus, filterType]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      
      // For now, use placeholder data since the tables don't exist yet
      const placeholderFlags: ReputationFlag[] = [
        {
          id: '1',
          reputation_id: 'rep-1',
          flag_type: 'manipulation',
          flag_reason: 'Suspected artificial score inflation',
          evidence: 'Multiple identical positive ratings from similar accounts',
          severity: 'high',
          status: 'active',
          flagged_by: 'user-123',
          resolved_by: null,
          resolved_at: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          reputation_id: 'rep-2',
          flag_type: 'fake_data',
          flag_reason: 'Unverified project completion claims',
          evidence: null,
          severity: 'medium',
          status: 'resolved',
          flagged_by: 'user-456',
          resolved_by: 'admin-789',
          resolved_at: new Date(Date.now() - 86400000).toISOString(),
          resolution_notes: 'Verified with official records',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setFlags(placeholderFlags);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load reputation flags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveFlag = async (flagId: string, action: 'resolved' | 'dismissed') => {
    try {
      // For demo purposes, just update local state
      setFlags(prev => prev.map(flag => 
        flag.id === flagId 
          ? {
              ...flag,
              status: action,
              resolved_by: 'current-admin',
              resolved_at: new Date().toISOString(),
              resolution_notes: resolutionNotes,
              updated_at: new Date().toISOString()
            }
          : flag
      ));

      toast({
        title: "Success",
        description: `Flag ${action} successfully`,
      });

      setSelectedFlag(null);
      setResolutionNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} flag`,
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = SEVERITY_LEVELS.find(s => s.value === severity);
    return (
      <Badge variant={config?.color as any || 'secondary'}>
        {config?.label || severity}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = FLAG_TYPES.find(t => t.value === type);
    return (
      <Badge variant={config?.color as any || 'secondary'}>
        {config?.label || type}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <X className="h-4 w-4 text-gray-500" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Options</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Flag Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {FLAG_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchFlags} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Flags List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reputation Flags</span>
            <Badge variant="secondary">{flags.length} flags</Badge>
          </CardTitle>
          <CardDescription>
            Review and manage reputation-related flags and concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading flags...</p>
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No flags found for the selected criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(flag.status)}
                    {getSeverityBadge(flag.severity)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(flag.flag_type)}
                      <span className="text-sm text-muted-foreground">
                        Flag ID: {flag.id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{flag.flag_reason}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(flag.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFlag(flag)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5" />
                            Flag Details
                          </DialogTitle>
                          <DialogDescription>
                            Review and resolve this reputation flag
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedFlag && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Type</label>
                                <div className="mt-1">{getTypeBadge(selectedFlag.flag_type)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Severity</label>
                                <div className="mt-1">{getSeverityBadge(selectedFlag.severity)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Reason</label>
                              <p className="mt-1 text-sm">{selectedFlag.flag_reason}</p>
                            </div>

                            {selectedFlag.evidence && (
                              <div>
                                <label className="text-sm font-medium">Evidence</label>
                                <p className="mt-1 text-sm text-muted-foreground">{selectedFlag.evidence}</p>
                              </div>
                            )}

                            {selectedFlag.status === 'active' && (
                              <div>
                                <label className="text-sm font-medium">Resolution Notes</label>
                                <Textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Add notes about the resolution..."
                                  className="mt-1"
                                />
                              </div>
                            )}

                            {selectedFlag.resolution_notes && (
                              <div>
                                <label className="text-sm font-medium">Previous Resolution Notes</label>
                                <p className="mt-1 text-sm text-muted-foreground">{selectedFlag.resolution_notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedFlag?.status === 'active' && (
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => resolveFlag(selectedFlag.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                            <Button
                              onClick={() => resolveFlag(selectedFlag.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </DialogFooter>
                        )}
                      </DialogContent>
                    </Dialog>
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