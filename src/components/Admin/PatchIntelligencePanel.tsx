import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Code,
  Zap,
  Target,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAshenLearning } from '@/hooks/useAshenLearning';
import { toast } from 'sonner';

export const PatchIntelligencePanel: React.FC = () => {
  const {
    insights,
    isLoading,
    getLearningInsights,
    calculateTrustScores,
    blockUnstablePattern,
    resetLearningMemory,
    learnFromManualFix
  } = useAshenLearning();

  const [selectedPatch, setSelectedPatch] = useState<any>(null);
  const [manualFixData, setManualFixData] = useState({
    filePath: '',
    originalCode: '',
    fixedCode: '',
    problemDescription: ''
  });

  useEffect(() => {
    getLearningInsights().catch(console.error);
  }, [getLearningInsights]);

  const handleRecalculateTrustScores = async () => {
    try {
      await calculateTrustScores();
      await getLearningInsights();
      toast.success('Trust scores recalculated successfully');
    } catch (error) {
      toast.error('Failed to recalculate trust scores');
    }
  };

  const handleBlockPattern = async (pattern: any) => {
    try {
      await blockUnstablePattern(
        pattern.pattern_signature,
        'Manually blocked by admin',
        false
      );
      await getLearningInsights();
      toast.success('Pattern blocked successfully');
    } catch (error) {
      toast.error('Failed to block pattern');
    }
  };

  const handleResetMemory = async () => {
    if (confirm('Are you sure you want to reset all learning memory? This action cannot be undone.')) {
      try {
        await resetLearningMemory();
        toast.success('Learning memory reset successfully');
      } catch (error) {
        toast.error('Failed to reset learning memory');
      }
    }
  };

  const handleTrainFromManualFix = async () => {
    if (!manualFixData.filePath || !manualFixData.fixedCode || !manualFixData.problemDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await learnFromManualFix(
        manualFixData.filePath,
        manualFixData.originalCode,
        manualFixData.fixedCode,
        manualFixData.problemDescription
      );
      await getLearningInsights();
      setManualFixData({
        filePath: '',
        originalCode: '',
        fixedCode: '',
        problemDescription: ''
      });
      toast.success('Manual fix learned successfully');
    } catch (error) {
      toast.error('Failed to learn from manual fix');
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'rolled_back': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'edited': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading learning insights...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Patch Intelligence</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculateTrustScores}
          >
            <Zap className="h-4 w-4 mr-2" />
            Recalculate Trust Scores
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetMemory}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Memory
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rollbacks">Rollback Logs</TabsTrigger>
          <TabsTrigger value="library">Fix Library</TabsTrigger>
          <TabsTrigger value="styles">Code Styles</TabsTrigger>
          <TabsTrigger value="trust">Trust Scores</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patches</p>
                    <p className="text-2xl font-bold">{insights.patchHistory.length}</p>
                  </div>
                  <Code className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {insights.patchHistory.length > 0 
                        ? Math.round((insights.patchHistory.filter(p => p.outcome === 'accepted').length / insights.patchHistory.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Style Patterns</p>
                    <p className="text-2xl font-bold">{insights.stylePatterns.length}</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Blocked Patterns</p>
                    <p className="text-2xl font-bold text-destructive">
                      {insights.unstablePatterns.filter(p => p.is_permanently_blocked || p.blocked_until).length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Patch Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {insights.patchHistory.slice(0, 10).map((patch) => (
                    <div key={patch.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(patch.outcome)}
                        <span className="text-sm font-medium">{patch.file_path}</span>
                        <Badge variant="outline">{patch.patch_type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getTrustScoreColor(patch.fix_trust_score)}`}>
                          {patch.fix_trust_score.toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(patch.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollbacks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rollback Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {insights.patchHistory
                    .filter(patch => patch.outcome === 'rolled_back')
                    .map((patch) => (
                      <div key={patch.id} className="p-3 rounded border border-destructive/20 bg-destructive/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="font-medium">{patch.file_path}</span>
                            <Badge variant="destructive">{patch.patch_type}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(patch.created_at).toLocaleString()}
                          </span>
                        </div>
                        {patch.rollback_reason && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Reason:</strong> {patch.rollback_reason}
                          </p>
                        )}
                        {patch.admin_feedback && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Feedback:</strong> {patch.admin_feedback}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Patch Index</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {insights.personalPatches.map((patch) => (
                    <div key={patch.id} className="p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{patch.pattern_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={patch.admin_approved ? "default" : "secondary"}>
                            {patch.admin_approved ? "Approved" : "Pending"}
                          </Badge>
                          <span className="text-sm text-emerald-500">
                            {(patch.success_rate * 100).toFixed(0)}% success
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Used {patch.usage_count} times
                      </p>
                      <Progress value={patch.success_rate * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learned Code Style Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {insights.stylePatterns.map((pattern) => (
                    <div key={pattern.id} className="p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pattern.pattern_category}</Badge>
                          <span className="font-medium">{pattern.pattern_description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-500">
                            {pattern.confidence_score.toFixed(0)}% confidence
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pattern.usage_frequency} times
                          </span>
                        </div>
                      </div>
                      <Progress value={pattern.confidence_score} className="h-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fix Trust Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {insights.trustMetrics.map((metric) => (
                    <div key={metric.id} className="p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{metric.fix_type}</Badge>
                          {getTrendIcon(metric.trend_direction)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getTrustScoreColor(metric.current_trust_score)}`}>
                            {metric.current_trust_score.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>Attempts: {metric.total_attempts}</div>
                        <div>Success: {metric.successful_fixes}</div>
                        <div>Rollbacks: {metric.rollbacks}</div>
                      </div>
                      <Progress value={metric.current_trust_score} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Train Ashen from Manual Fix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">File Path</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mt-1"
                  placeholder="src/components/Example.tsx"
                  value={manualFixData.filePath}
                  onChange={(e) => setManualFixData(prev => ({ ...prev, filePath: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Problem Description</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mt-1"
                  placeholder="TypeScript error: Property 'x' does not exist"
                  value={manualFixData.problemDescription}
                  onChange={(e) => setManualFixData(prev => ({ ...prev, problemDescription: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Original Code (Optional)</label>
                <textarea
                  className="w-full p-2 border rounded mt-1 h-24"
                  placeholder="const broken = (props) => { ... }"
                  value={manualFixData.originalCode}
                  onChange={(e) => setManualFixData(prev => ({ ...prev, originalCode: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fixed Code</label>
                <textarea
                  className="w-full p-2 border rounded mt-1 h-32"
                  placeholder="const fixed = (props: Props) => { ... }"
                  value={manualFixData.fixedCode}
                  onChange={(e) => setManualFixData(prev => ({ ...prev, fixedCode: e.target.value }))}
                />
              </div>
              <Button onClick={handleTrainFromManualFix} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Train Ashen from This Fix
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unstable Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {insights.unstablePatterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-center justify-between p-2 rounded border border-amber-200 bg-amber-50">
                      <div>
                        <span className="text-sm font-medium">{pattern.pattern_description}</span>
                        <p className="text-xs text-muted-foreground">
                          {pattern.rollback_count} rollbacks, {pattern.failure_count} failures
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pattern.is_permanently_blocked && (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockPattern(pattern)}
                          disabled={pattern.is_permanently_blocked}
                        >
                          Block
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};