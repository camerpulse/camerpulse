import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, AlertTriangle, Search, Undo2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReputationScore {
  id: string;
  entity_name: string;
  entity_type: string;
  total_score: number;
  reputation_badge: string;
  last_calculated_at: string;
}

interface HistoryEntry {
  id: string;
  reputation_id: string;
  old_score: number;
  new_score: number;
  score_change: number;
  change_reason: string;
  change_source: string;
  changed_at: string;
}

export function ScoreOverrideControls() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<ReputationScore | null>(null);
  const [newScore, setNewScore] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [searchResults, setSearchResults] = useState<ReputationScore[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentOverrides();
  }, []);

  const searchEntities = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('civic_reputation_scores')
        .select('*')
        .or(`entity_name.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%`)
        .order('total_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search entities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOverrides = async () => {
    try {
      // Placeholder data for demo
      const placeholderHistory: HistoryEntry[] = [
        {
          id: '1',
          reputation_id: 'rep-1',
          old_score: 65,
          new_score: 45,
          score_change: -20,
          change_reason: 'Emergency adjustment due to corruption allegations',
          change_source: 'admin_override',
          changed_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          reputation_id: 'rep-2',
          old_score: 72,
          new_score: 78,
          score_change: 6,
          change_reason: 'Recognition of recent transparency initiatives',
          change_source: 'admin_override',
          changed_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setHistoryEntries(placeholderHistory);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load override history",
        variant: "destructive",
      });
    }
  };

  const applyScoreOverride = async () => {
    if (!selectedEntity || !newScore || !overrideReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const numericScore = parseInt(newScore);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast({
        title: "Error",
        description: "Score must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // For demo, just show success and update local history
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        reputation_id: selectedEntity.id,
        old_score: selectedEntity.total_score,
        new_score: numericScore,
        score_change: numericScore - selectedEntity.total_score,
        change_reason: overrideReason,
        change_source: 'admin_override',
        changed_at: new Date().toISOString()
      };

      setHistoryEntries(prev => [newHistoryEntry, ...prev]);

      toast({
        title: "Success",
        description: `Score override applied successfully`,
      });

      setShowOverrideDialog(false);
      setSelectedEntity(null);
      setNewScore('');
      setOverrideReason('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to apply score override",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rollbackOverride = async (historyEntry: HistoryEntry) => {
    try {
      setLoading(true);
      
      // For demo, just update local state
      setHistoryEntries(prev => prev.filter(entry => entry.id !== historyEntry.id));

      toast({
        title: "Success",
        description: "Score override rolled back successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to rollback override",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'default';
      case 'trusted': return 'secondary';
      case 'under_watch': return 'outline';
      case 'flagged': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Override */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Score Override Controls
          </CardTitle>
          <CardDescription>
            Search for entities and manually override their reputation scores when necessary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by entity name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEntities()}
              />
            </div>
            <Button onClick={searchEntities} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results</h4>
              {searchResults.map((entity) => (
                <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h5 className="font-medium">{entity.entity_name}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entity.entity_type}</Badge>
                      <Badge variant={getBadgeVariant(entity.reputation_badge)}>
                        {entity.reputation_badge}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {entity.total_score}/100
                      </span>
                    </div>
                  </div>
                  <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedEntity(entity)}
                      >
                        Override Score
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Score Override
                        </DialogTitle>
                        <DialogDescription>
                          This action will manually override the calculated reputation score for{' '}
                          <strong>{selectedEntity?.entity_name}</strong>
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Current Score</label>
                          <div className="text-2xl font-bold text-muted-foreground">
                            {selectedEntity?.total_score}/100
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">New Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={newScore}
                            onChange={(e) => setNewScore(e.target.value)}
                            placeholder="Enter new score..."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Reason for Override *</label>
                          <Textarea
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Explain why this override is necessary..."
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
                          Cancel
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Apply Override
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Score Override</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to override the score from{' '}
                                <strong>{selectedEntity?.total_score}</strong> to{' '}
                                <strong>{newScore}</strong>? This action will be logged and can be rolled back.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={applyScoreOverride} disabled={loading}>
                                {loading ? 'Applying...' : 'Confirm Override'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Score Overrides
          </CardTitle>
          <CardDescription>
            Review and manage recent manual score overrides
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent score overrides found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Override</Badge>
                      <span className="font-medium">
                        {entry.old_score} → {entry.new_score}
                      </span>
                      <span className={`text-sm ${entry.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({entry.score_change > 0 ? '+' : ''}{entry.score_change})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.change_reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.changed_at).toLocaleString()}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Undo2 className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rollback Score Override</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will restore the score from <strong>{entry.new_score}</strong> back to{' '}
                          <strong>{entry.old_score}</strong>. This action will be logged.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => rollbackOverride(entry)}
                          disabled={loading}
                        >
                          {loading ? 'Rolling back...' : 'Rollback'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}