import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Flag,
  Eye,
  MessageCircle,
  Lock,
  Unlock,
  Ban,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Poll {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed' | 'suspended' | 'reported';
  created_by: string;
  created_at: string;
  votes_count: number;
  reports_count: number;
  fraud_score: number;
  is_verified: boolean;
  moderation_notes?: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}

interface ModerationAction {
  id: string;
  poll_id: string;
  moderator_id: string;
  action_type: 'approve' | 'suspend' | 'ban' | 'verify' | 'flag';
  reason: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const AdvancedPollModeration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'suspend' | 'verify' | 'flag'>('approve');

  // Fetch flagged/reported polls
  const { data: flaggedPolls, isLoading } = useQuery({
    queryKey: ['flagged-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*),
          poll_reports(count)
        `)
        .or('status.eq.reported,reports_count.gt.0,fraud_score.gt.0.7')
        .order('reports_count', { ascending: false });

      if (error) throw error;
      return data as Poll[];
    }
  });

  // Fetch moderation analytics
  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('status, fraud_score, reports_count');

      if (error) throw error;

      const stats = {
        total_polls: data.length,
        flagged_polls: data.filter(p => p.reports_count > 0).length,
        suspended_polls: data.filter(p => p.status === 'suspended').length,
        high_fraud_risk: data.filter(p => p.fraud_score > 0.7).length,
        avg_fraud_score: data.reduce((sum, p) => sum + (p.fraud_score || 0), 0) / data.length
      };

      return stats;
    }
  });

  // Poll moderation mutation
  const moderatePollMutation = useMutation({
    mutationFn: async ({ pollId, action, notes }: {
      pollId: string;
      action: 'approve' | 'suspend' | 'verify' | 'flag';
      notes: string;
    }) => {
      // Log moderation action
      const { error: logError } = await supabase
        .from('poll_moderation_log')
        .insert({
          poll_id: pollId,
          moderator_id: user?.id,
          action_type: action,
          reason: notes,
          created_at: new Date().toISOString()
        });

      if (logError) throw logError;

      // Update poll status
      const updates: any = {
        moderation_notes: notes,
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id
      };

      if (action === 'suspend') {
        updates.status = 'suspended';
      } else if (action === 'approve') {
        updates.status = 'active';
        updates.reports_count = 0; // Clear reports on approval
      } else if (action === 'verify') {
        updates.is_verified = true;
      }

      const { error: updateError } = await supabase
        .from('polls')
        .update(updates)
        .eq('id', pollId);

      if (updateError) throw updateError;

      // Send notification to poll creator
      await supabase.functions.invoke('send-notification', {
        body: {
          user_id: selectedPoll?.created_by,
          type: 'poll_moderated',
          title: `Poll ${action}d`,
          message: `Your poll "${selectedPoll?.title}" has been ${action}d by moderation team.`,
          data: { poll_id: pollId, action, notes }
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Poll Moderated",
        description: `Poll has been ${actionType}d successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['flagged-polls'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
      setSelectedPoll(null);
      setModerationNotes('');
    },
    onError: (error) => {
      toast({
        title: "Moderation Failed",
        description: error instanceof Error ? error.message : "Failed to moderate poll",
        variant: "destructive"
      });
    }
  });

  const handleModeration = () => {
    if (!selectedPoll || !moderationNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide moderation notes",
        variant: "destructive"
      });
      return;
    }

    moderatePollMutation.mutate({
      pollId: selectedPoll.id,
      action: actionType,
      notes: moderationNotes
    });
  };

  const getFraudRiskBadge = (score: number) => {
    if (score >= 0.8) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 0.5) return <Badge variant="secondary">Medium Risk</Badge>;
    if (score >= 0.3) return <Badge variant="outline">Low Risk</Badge>;
    return <Badge variant="default">Clean</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default', label: 'Active' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      reported: { variant: 'secondary', label: 'Reported' },
      closed: { variant: 'outline', label: 'Closed' }
    } as const;

    const config = variants[status as keyof typeof variants];
    return config ? <Badge variant={config.variant as any}>{config.label}</Badge> : null;
  };

  const calculateEngagementScore = (poll: Poll) => {
    const votesPerHour = poll.votes_count / Math.max(1, 
      (Date.now() - new Date(poll.created_at).getTime()) / (1000 * 60 * 60)
    );
    return Math.min(100, votesPerHour * 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Advanced Poll Moderation
          </h2>
          <p className="text-muted-foreground">
            Monitor, review, and moderate polls for fraud, abuse, and policy violations
          </p>
        </div>
      </div>

      {/* Moderation Statistics */}
      {moderationStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Polls</p>
                  <p className="text-xl font-bold">{moderationStats.total_polls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-xl font-bold">{moderationStats.flagged_polls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-xl font-bold">{moderationStats.suspended_polls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-xl font-bold">{moderationStats.high_fraud_risk}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Fraud Score</p>
                  <p className="text-xl font-bold">{(moderationStats.avg_fraud_score * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">Flagged Polls ({flaggedPolls?.length || 0})</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="settings">Moderation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Polls List */}
            <Card>
              <CardHeader>
                <CardTitle>Polls Requiring Review</CardTitle>
                <CardDescription>
                  Polls flagged for potential policy violations or fraud
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">Loading polls...</div>
                ) : flaggedPolls?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>No polls require moderation</p>
                  </div>
                ) : (
                  flaggedPolls?.map((poll) => (
                    <div
                      key={poll.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        selectedPoll?.id === poll.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedPoll(poll)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium line-clamp-2">{poll.title}</h4>
                          {getFraudRiskBadge(poll.fraud_score || 0)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(poll.status)}
                          {poll.is_verified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {poll.votes_count} votes
                          </div>
                          <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {poll.reports_count} reports
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {calculateEngagementScore(poll).toFixed(0)}% engagement
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Fraud Risk</span>
                            <span>{((poll.fraud_score || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(poll.fraud_score || 0) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Moderation Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Panel</CardTitle>
                <CardDescription>
                  {selectedPoll ? 'Review and moderate the selected poll' : 'Select a poll to moderate'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPoll ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2" />
                    <p>Select a poll from the list to start moderation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Poll Details */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">{selectedPoll.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPoll.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Status:</span>
                          <p>{getStatusBadge(selectedPoll.status)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Votes:</span>
                          <p>{selectedPoll.votes_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Reports:</span>
                          <p className="text-red-600">{selectedPoll.reports_count}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fraud Score:</span>
                          <p>{getFraudRiskBadge(selectedPoll.fraud_score || 0)}</p>
                        </div>
                      </div>

                      {/* Poll Options */}
                      <div>
                        <span className="font-medium text-sm">Poll Options:</span>
                        <div className="mt-2 space-y-2">
                          {selectedPoll.options?.map((option, index) => (
                            <div key={option.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-sm">{option.text}</span>
                              <Badge variant="outline">{option.votes} votes</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Moderation Action */}
                    <div className="space-y-3">
                      <Label>Moderation Action</Label>
                      <Select value={actionType} onValueChange={setActionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve Poll</SelectItem>
                          <SelectItem value="verify">Verify Authenticity</SelectItem>
                          <SelectItem value="flag">Flag for Review</SelectItem>
                          <SelectItem value="suspend">Suspend Poll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Moderation Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="moderation-notes">Moderation Notes</Label>
                      <Textarea
                        id="moderation-notes"
                        placeholder="Provide detailed reasoning for your moderation decision..."
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Risk Assessment */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Fraud Risk: {((selectedPoll.fraud_score || 0) * 100).toFixed(1)}% | 
                        Reports: {selectedPoll.reports_count} | 
                        Engagement: {calculateEngagementScore(selectedPoll).toFixed(0)}%
                      </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleModeration}
                        disabled={moderatePollMutation.isPending || !moderationNotes.trim()}
                        className="flex-1"
                        variant={actionType === 'approve' ? 'default' : 
                                actionType === 'suspend' ? 'destructive' : 'secondary'}
                      >
                        {moderatePollMutation.isPending ? 'Processing...' : 
                         actionType === 'approve' ? 'Approve Poll' :
                         actionType === 'suspend' ? 'Suspend Poll' :
                         actionType === 'verify' ? 'Verify Poll' : 'Flag Poll'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection System</CardTitle>
              <CardDescription>
                Advanced AI-powered fraud detection and prevention system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Detection Patterns</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Rapid sequential voting from same IP</li>
                    <li>• Identical device fingerprints with different IPs</li>
                    <li>• Unusual voting pattern timing</li>
                    <li>• Suspicious user agent patterns</li>
                    <li>• Bot-like voting behavior</li>
                    <li>• Coordinated manipulation attempts</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Prevention Measures</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Real-time fraud scoring</li>
                    <li>• CAPTCHA verification for suspicious activity</li>
                    <li>• Rate limiting and IP monitoring</li>
                    <li>• Device fingerprinting</li>
                    <li>• Machine learning anomaly detection</li>
                    <li>• Community reporting system</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  The fraud detection system automatically flags suspicious polls for manual review.
                  Polls with fraud scores above 70% are automatically suspended pending investigation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>
                Configure automatic moderation rules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Auto-Moderation Rules</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-suspend high fraud polls</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically suspend polls with fraud score {'>'}80%
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require review for reported polls</Label>
                      <p className="text-xs text-muted-foreground">
                        Flag polls with 3+ reports for manual review
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable fraud detection</Label>
                      <p className="text-xs text-muted-foreground">
                        Use AI to detect voting manipulation
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Notification Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Instant notifications for critical issues
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily moderation digest</Label>
                      <p className="text-xs text-muted-foreground">
                        Daily summary of moderation activities
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Community reports</Label>
                      <p className="text-xs text-muted-foreground">
                        Notifications when users report content
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};