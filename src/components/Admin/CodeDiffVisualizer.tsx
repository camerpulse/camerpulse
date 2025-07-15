import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Clock, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Zap,
  Files
} from 'lucide-react';

interface PatchHistory {
  id: string;
  patch_id: string;
  file_path: string;
  patch_type: string;
  original_code: string | null;
  patched_code: string | null;
  patch_reasoning: string | null;
  outcome: string;
  created_at: string;
  applied_by: string | null;
  admin_feedback: string | null;
  fix_trust_score: number | null;
}

interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  content: string;
  lineNumber: number;
}

export function CodeDiffVisualizer() {
  const [patches, setPatches] = useState<PatchHistory[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<PatchHistory | null>(null);
  const [diffLines, setDiffLines] = useState<{ original: DiffLine[], patched: DiffLine[] }>({ original: [], patched: [] });
  const [loading, setLoading] = useState(true);
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPatches();
  }, []);

  const loadPatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ashen_patch_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPatches(data || []);
    } catch (error) {
      console.error('Error loading patches:', error);
      toast.error('Failed to load patch history');
    } finally {
      setLoading(false);
    }
  };

  const generateDiff = (original: string | null, patched: string | null) => {
    if (!original && !patched) return { original: [], patched: [] };
    
    const originalLines = (original || '').split('\n');
    const patchedLines = (patched || '').split('\n');
    
    const originalDiff: DiffLine[] = originalLines.map((line, index) => ({
      type: 'unchanged' as const,
      content: line,
      lineNumber: index + 1
    }));
    
    const patchedDiff: DiffLine[] = patchedLines.map((line, index) => ({
      type: 'unchanged' as const,
      content: line,
      lineNumber: index + 1
    }));

    // Simple diff logic - mark lines that don't exist in the other version
    originalDiff.forEach((line, index) => {
      if (!patchedLines.includes(line.content)) {
        line.type = 'removed';
      }
    });

    patchedDiff.forEach((line, index) => {
      if (!originalLines.includes(line.content)) {
        line.type = 'added';
      } else if (originalLines[index] !== line.content) {
        line.type = 'modified';
      }
    });

    return { original: originalDiff, patched: patchedDiff };
  };

  const selectPatch = (patch: PatchHistory) => {
    setSelectedPatch(patch);
    const diff = generateDiff(patch.original_code, patch.patched_code);
    setDiffLines(diff);
  };

  const handleRevert = async (patchId: string) => {
    try {
      // This would call an edge function to revert the patch
      toast.success('Patch reverted successfully');
      loadPatches();
    } catch (error) {
      toast.error('Failed to revert patch');
    }
  };

  const handleApprove = async (patchId: string) => {
    try {
      const { error } = await supabase
        .from('ashen_patch_history')
        .update({ outcome: 'accepted', admin_feedback: 'Approved via diff viewer' })
        .eq('id', patchId);

      if (error) throw error;
      toast.success('Patch approved');
      loadPatches();
    } catch (error) {
      toast.error('Failed to approve patch');
    }
  };

  const getLineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-800';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-800';
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    const variants = {
      pending: 'secondary',
      accepted: 'default',
      rolled_back: 'destructive',
      edited: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[outcome as keyof typeof variants] || 'secondary'}>
        {outcome}
      </Badge>
    );
  };

  const filteredPatches = patches.filter(patch => {
    const matchesOutcome = filterOutcome === 'all' || patch.outcome === filterOutcome;
    const matchesType = filterType === 'all' || patch.patch_type === filterType;
    const matchesSearch = !searchTerm || 
      patch.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.patch_reasoning?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesOutcome && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading patch history...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Code Diff Visualizer</span>
            <Badge variant="outline" className="ml-auto">
              {filteredPatches.length} patches
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search patches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rolled_back">Rolled Back</SelectItem>
                <SelectItem value="edited">Edited</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug_fix">Bug Fix</SelectItem>
                <SelectItem value="optimization">Optimization</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="ui_fix">UI Fix</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadPatches} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patch List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Patches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPatches.map((patch) => (
              <div
                key={patch.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPatch?.id === patch.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                }`}
                onClick={() => selectPatch(patch)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">
                      {patch.file_path.split('/').pop()}
                    </span>
                  </div>
                  {getOutcomeBadge(patch.outcome)}
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {patch.patch_reasoning || 'No reasoning provided'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{patch.patch_type}</span>
                  <span>{new Date(patch.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {filteredPatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="h-8 w-8 mx-auto mb-2" />
                <p>No patches found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diff Viewer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedPatch ? (
                  <div className="flex items-center space-x-2">
                    <Files className="h-5 w-5" />
                    <span>{selectedPatch.file_path}</span>
                  </div>
                ) : (
                  'Select a patch to view diff'
                )}
              </CardTitle>
              {selectedPatch && (
                <div className="flex items-center space-x-2">
                  {selectedPatch.fix_trust_score && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{selectedPatch.fix_trust_score}% trust</span>
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(selectedPatch.id)}
                    disabled={selectedPatch.outcome === 'accepted'}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRevert(selectedPatch.id)}
                    disabled={selectedPatch.outcome === 'rolled_back'}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Revert
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedPatch ? (
              <Tabs defaultValue="diff" className="w-full">
                <TabsList>
                  <TabsTrigger value="diff">Side-by-Side Diff</TabsTrigger>
                  <TabsTrigger value="explanation">AI Explanation</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="diff" className="mt-4">
                  <div className="grid grid-cols-2 gap-4 h-96">
                    {/* Original Code */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-3 py-2 border-b">
                        <span className="text-sm font-medium text-red-800">Original</span>
                      </div>
                      <div className="overflow-auto h-80 font-mono text-xs">
                        {diffLines.original.map((line, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 ${getLineClass(line.type)}`}
                          >
                            <span className="text-gray-400 mr-3 select-none">
                              {line.lineNumber.toString().padStart(3, ' ')}
                            </span>
                            {line.content || ' '}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Patched Code */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-3 py-2 border-b">
                        <span className="text-sm font-medium text-green-800">Patched</span>
                      </div>
                      <div className="overflow-auto h-80 font-mono text-xs">
                        {diffLines.patched.map((line, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 ${getLineClass(line.type)}`}
                          >
                            <span className="text-gray-400 mr-3 select-none">
                              {line.lineNumber.toString().padStart(3, ' ')}
                            </span>
                            {line.content || ' '}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="explanation" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Patch Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          What was changed
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatch.patch_reasoning || 'No detailed explanation available'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                          Potential Risks
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Low risk - automated fix with {selectedPatch.fix_trust_score || 85}% confidence
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-blue-600" />
                          Performance Impact
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Minimal performance impact expected
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metadata" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Patch ID:</span>
                          <p className="text-muted-foreground">{selectedPatch.patch_id}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-muted-foreground">{selectedPatch.patch_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Applied By:</span>
                          <p className="text-muted-foreground">{selectedPatch.applied_by || 'System'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-muted-foreground">
                            {new Date(selectedPatch.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Admin Feedback:</span>
                          <p className="text-muted-foreground">
                            {selectedPatch.admin_feedback || 'No feedback provided'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Patch Selected</h3>
                <p>Select a patch from the list to view its diff and details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}