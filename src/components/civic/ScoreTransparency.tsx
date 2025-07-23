import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Calendar, TrendingUp, TrendingDown, Info, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScoreSource {
  id: string;
  source_type: string;
  score_impact: number;
  weight: number;
  description: string;
  verified: boolean;
  created_at: string;
  source_reference_id: string | null;
}

interface ScoreHistory {
  id: string;
  old_score: number;
  new_score: number;
  score_change: number;
  change_reason: string;
  change_source: string;
  changed_at: string;
  calculation_details: any;
}

interface ScoreTransparencyProps {
  entityId: string;
  entityName: string;
  currentScore: number;
  compact?: boolean;
}

export function ScoreTransparency({ entityId, entityName, currentScore, compact = false }: ScoreTransparencyProps) {
  const [scoreSources, setScoreSources] = useState<ScoreSource[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showDetails) {
      fetchScoreTransparency();
    }
  }, [showDetails, entityId]);

  const fetchScoreTransparency = async () => {
    try {
      setLoading(true);
      
      // Placeholder data for score sources
      const mockSources: ScoreSource[] = [
        {
          id: '1',
          source_type: 'bill_passed',
          score_impact: 15,
          weight: 1.0,
          description: 'Education Reform Bill 2024 - Successfully passed with broad support',
          verified: true,
          created_at: new Date(Date.now() - 604800000).toISOString(),
          source_reference_id: 'bill-2024-edu-001'
        },
        {
          id: '2',
          source_type: 'citizen_rating',
          score_impact: -8,
          weight: 0.8,
          description: 'Average citizen satisfaction rating decreased due to delayed infrastructure projects',
          verified: true,
          created_at: new Date(Date.now() - 1209600000).toISOString(),
          source_reference_id: null
        },
        {
          id: '3',
          source_type: 'transparency_audit',
          score_impact: 12,
          weight: 1.2,
          description: 'Q1 2024 Transparency Audit - Excellent disclosure of government contracts',
          verified: true,
          created_at: new Date(Date.now() - 1814400000).toISOString(),
          source_reference_id: 'audit-q1-2024'
        },
        {
          id: '4',
          source_type: 'project_completed',
          score_impact: 10,
          weight: 1.0,
          description: 'North West Regional Hospital construction completed on time and under budget',
          verified: true,
          created_at: new Date(Date.now() - 2419200000).toISOString(),
          source_reference_id: 'project-hospital-nw'
        },
        {
          id: '5',
          source_type: 'attendance',
          score_impact: 5,
          weight: 0.6,
          description: '95% attendance rate in parliamentary sessions this quarter',
          verified: true,
          created_at: new Date(Date.now() - 3024000000).toISOString(),
          source_reference_id: null
        }
      ];

      // Placeholder data for score history
      const mockHistory: ScoreHistory[] = [
        {
          id: '1',
          old_score: 73,
          new_score: 78,
          score_change: 5,
          change_reason: 'Quarterly recalculation based on new performance data',
          change_source: 'system',
          changed_at: new Date(Date.now() - 604800000).toISOString(),
          calculation_details: {
            transparency_change: 3,
            performance_change: 2,
            citizen_rating_change: 0
          }
        },
        {
          id: '2',
          old_score: 75,
          new_score: 73,
          score_change: -2,
          change_reason: 'Citizen feedback integration - infrastructure delays',
          change_source: 'system',
          changed_at: new Date(Date.now() - 1209600000).toISOString(),
          calculation_details: {
            transparency_change: 0,
            performance_change: -3,
            citizen_rating_change: 1
          }
        },
        {
          id: '3',
          old_score: 70,
          new_score: 75,
          score_change: 5,
          change_reason: 'Transparency audit results published',
          change_source: 'system',
          changed_at: new Date(Date.now() - 1814400000).toISOString(),
          calculation_details: {
            transparency_change: 8,
            performance_change: -2,
            citizen_rating_change: -1
          }
        }
      ];

      setScoreSources(mockSources);
      setScoreHistory(mockHistory);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load score transparency data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'bill_passed': 'Legislation',
      'citizen_rating': 'Citizen Feedback',
      'transparency_audit': 'Transparency Audit',
      'project_completed': 'Project Delivery',
      'attendance': 'Parliamentary Attendance',
      'corruption_flag': 'Integrity Review',
      'promise_fulfilled': 'Campaign Promise'
    };
    return labels[type] || type;
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'bill_passed': return <FileText className="h-4 w-4" />;
      case 'citizen_rating': return <TrendingUp className="h-4 w-4" />;
      case 'transparency_audit': return <CheckCircle className="h-4 w-4" />;
      case 'project_completed': return <CheckCircle className="h-4 w-4" />;
      case 'attendance': return <Clock className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <div className="h-3 w-3" />;
  };

  if (compact) {
    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            View Sources
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Score Transparency - {entityName}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of reputation score calculation and change history
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading transparency data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Score: {currentScore}/100</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={currentScore} className="h-3" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score Sources:</span>
                        <span className="ml-2 font-medium">{scoreSources.length} verified</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="ml-2 font-medium">
                          {scoreHistory[0] ? new Date(scoreHistory[0].changed_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Sources</CardTitle>
                  <CardDescription>
                    Individual components contributing to the overall reputation score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoreSources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source.source_type)}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{getSourceTypeLabel(source.source_type)}</Badge>
                              {source.verified && <CheckCircle className="h-3 w-3 text-green-500" />}
                            </div>
                            <p className="text-sm">{source.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(source.created_at).toLocaleDateString()}
                              {source.source_reference_id && (
                                <span className="ml-2">• Ref: {source.source_reference_id}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getImpactColor(source.score_impact)}`}>
                            {source.score_impact > 0 ? '+' : ''}{source.score_impact}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weight: {source.weight}x
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Score History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Change History</CardTitle>
                  <CardDescription>
                    Timeline of reputation score changes and their causes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoreHistory.map((entry, index) => (
                      <div key={entry.id}>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getChangeIcon(entry.score_change)}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {entry.old_score} → {entry.new_score}
                                </span>
                                <span className={`text-sm ${getImpactColor(entry.score_change)}`}>
                                  ({entry.score_change > 0 ? '+' : ''}{entry.score_change})
                                </span>
                                <Badge variant="secondary">{entry.change_source}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{entry.change_reason}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.changed_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          {entry.calculation_details && (
                            <div className="text-right text-xs">
                              <div className="text-muted-foreground mb-1">Component Changes:</div>
                              {Object.entries(entry.calculation_details).map(([key, value]) => (
                                <div key={key} className="flex justify-between gap-2">
                                  <span>{key.replace('_', ' ')}:</span>
                                  <span className={getImpactColor(value as number)}>
                                    {value as number > 0 ? '+' : ''}{value as number}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {index < scoreHistory.length - 1 && (
                          <div className="flex justify-center py-2">
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Methodology */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Calculation Methodology</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Base Score:</strong> 50 points (neutral starting point)</p>
                  <p><strong>Weighted Scoring:</strong> Each source type has different impact weights</p>
                  <p><strong>Verification:</strong> Only verified sources contribute to the final score</p>
                  <p><strong>Transparency:</strong> All calculations are logged and auditable</p>
                  <p><strong>Updates:</strong> Scores recalculated automatically when new data is available</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Score Transparency
        </CardTitle>
        <CardDescription>
          Detailed breakdown of how this reputation score was calculated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDetails(true)} className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Complete Transparency Report
        </Button>
      </CardContent>
    </Card>
  );
}