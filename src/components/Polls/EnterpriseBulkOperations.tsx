import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Check, 
  Copy, 
  Archive, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  votes_count: number;
  created_at: string;
  creator_id: string;
  privacy_mode: string;
}

interface BulkOperationProgress {
  operation: string;
  total: number;
  completed: number;
  failed: number;
  errors: string[];
}

export const EnterpriseBulkOperations: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bulkOperation, setBulkOperation] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [operationProgress, setOperationProgress] = useState<BulkOperationProgress | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const togglePollSelection = (pollId: string) => {
    const newSelection = new Set(selectedPolls);
    if (newSelection.has(pollId)) {
      newSelection.delete(pollId);
    } else {
      newSelection.add(pollId);
    }
    setSelectedPolls(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPolls.size === polls.length) {
      setSelectedPolls(new Set());
    } else {
      setSelectedPolls(new Set(polls.map(poll => poll.id)));
    }
  };

  const executeBulkOperation = async () => {
    if (!bulkOperation || selectedPolls.size === 0) return;

    setIsExecuting(true);
    setOperationProgress({
      operation: bulkOperation,
      total: selectedPolls.size,
      completed: 0,
      failed: 0,
      errors: []
    });

    const pollIds = Array.from(selectedPolls);
    let completed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const pollId of pollIds) {
      try {
        switch (bulkOperation) {
          case 'activate':
            await supabase
              .from('polls')
              .update({ is_active: true })
              .eq('id', pollId);
            break;

          case 'deactivate':
            await supabase
              .from('polls')
              .update({ is_active: false })
              .eq('id', pollId);
            break;

          case 'archive':
            await supabase
              .from('polls')
              .update({ 
                is_active: false,
                archived_at: new Date().toISOString()
              })
              .eq('id', pollId);
            break;

          case 'delete':
            // Delete votes first
            await supabase
              .from('poll_votes')
              .delete()
              .eq('poll_id', pollId);
            
            // Delete poll
            await supabase
              .from('polls')
              .delete()
              .eq('id', pollId);
            break;

          case 'duplicate':
            const { data: originalPoll } = await supabase
              .from('polls')
              .select('*')
              .eq('id', pollId)
              .single();

            if (originalPoll) {
              await supabase
                .from('polls')
                .insert([{
                  ...originalPoll,
                  id: undefined,
                  title: `${originalPoll.title} (Copy)`,
                  created_at: new Date().toISOString(),
                  votes_count: 0
                }]);
            }
            break;

          case 'export':
            // Export poll data
            const { data: exportData, error: exportError } = await supabase.functions.invoke('poll-analytics-export', {
              body: {
                pollId,
                format: 'csv',
                includeVotes: true
              }
            });
            
            if (exportError) throw exportError;
            break;

          default:
            throw new Error(`Unknown operation: ${bulkOperation}`);
        }

        completed++;
      } catch (error) {
        failed++;
        errors.push(`Poll ${pollId}: ${error.message}`);
      }

      setOperationProgress(prev => prev ? {
        ...prev,
        completed: completed,
        failed: failed,
        errors: errors
      } : null);

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Complete operation
    toast.success(`Bulk operation completed: ${completed} successful, ${failed} failed`);
    setIsExecuting(false);
    setShowConfirmDialog(false);
    setSelectedPolls(new Set());
    
    // Refresh polls if not export operation
    if (bulkOperation !== 'export') {
      fetchPolls();
    }
  };

  const getBulkOperationDescription = (operation: string): string => {
    const count = selectedPolls.size;
    switch (operation) {
      case 'activate':
        return `Activate ${count} selected poll(s)`;
      case 'deactivate':
        return `Deactivate ${count} selected poll(s)`;
      case 'archive':
        return `Archive ${count} selected poll(s)`;
      case 'delete':
        return `Permanently delete ${count} selected poll(s) and all their votes`;
      case 'duplicate':
        return `Create copies of ${count} selected poll(s)`;
      case 'export':
        return `Export data from ${count} selected poll(s)`;
      default:
        return '';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'activate':
        return <Eye className="h-4 w-4" />;
      case 'deactivate':
        return <EyeOff className="h-4 w-4" />;
      case 'archive':
        return <Archive className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'duplicate':
        return <Copy className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enterprise Bulk Operations</h2>
        <p className="text-muted-foreground">
          Perform operations on multiple polls simultaneously
        </p>
      </div>

      {/* Bulk Operation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Select polls and choose an operation to perform on all selected items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                <Checkbox 
                  checked={selectedPolls.size === polls.length && polls.length > 0}
                  className="mr-2"
                />
                Select All ({selectedPolls.size})
              </Button>
              
              {selectedPolls.size > 0 && (
                <Badge variant="secondary">
                  {selectedPolls.size} poll(s) selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={bulkOperation} onValueChange={setBulkOperation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Activate Polls
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Deactivate Polls
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive Polls
                    </div>
                  </SelectItem>
                  <SelectItem value="duplicate">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Duplicate Polls
                    </div>
                  </SelectItem>
                  <SelectItem value="export">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span className="text-destructive">Delete Polls</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  <Button
                    disabled={!bulkOperation || selectedPolls.size === 0}
                    variant={bulkOperation === 'delete' ? 'destructive' : 'default'}
                  >
                    {getOperationIcon(bulkOperation)}
                    Execute
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {bulkOperation === 'delete' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                      Confirm Bulk Operation
                    </DialogTitle>
                    <DialogDescription>
                      {getBulkOperationDescription(bulkOperation)}
                      {bulkOperation === 'delete' && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                          Warning: This action cannot be undone. All votes and data will be permanently deleted.
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {operationProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{operationProgress.completed + operationProgress.failed}/{operationProgress.total}</span>
                      </div>
                      <Progress 
                        value={((operationProgress.completed + operationProgress.failed) / operationProgress.total) * 100} 
                      />
                      {operationProgress.errors.length > 0 && (
                        <div className="text-sm text-destructive">
                          {operationProgress.failed} operations failed
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      disabled={isExecuting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={executeBulkOperation}
                      disabled={isExecuting}
                      variant={bulkOperation === 'delete' ? 'destructive' : 'default'}
                    >
                      {isExecuting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isExecuting ? 'Executing...' : 'Confirm'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Polls List */}
      <Card>
        <CardHeader>
          <CardTitle>All Polls ({polls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPolls.has(poll.id) 
                    ? 'bg-primary/5 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => togglePollSelection(poll.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedPolls.has(poll.id)}
                    onChange={() => togglePollSelection(poll.id)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{poll.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {poll.votes_count} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={poll.is_active ? "default" : "secondary"}>
                    {poll.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {poll.privacy_mode}
                  </Badge>
                </div>
              </div>
            ))}
            
            {polls.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No polls found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};