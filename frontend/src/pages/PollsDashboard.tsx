import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PollFraudProtectionEngine } from '@/components/Polls/PollFraudProtectionEngine';
import { 
  BarChart3, 
  Download, 
  Share2, 
  QrCode, 
  Eye, 
  EyeOff,
  Archive,
  Trash2,
  Copy,
  Edit,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  FileText,
  Image,
  Table,
  Plus,
  Settings,
  Shield,
  Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { CreatePollDialog } from '@/components/Polls/CreatePollDialog';
import { RegionalHeatmap } from '@/components/Polls/RegionalHeatmap';
import { PollModerationTab } from '@/components/Admin/PollModerationTab';
import { EnterpriseBulkOperations } from '@/components/Polls/EnterpriseBulkOperations';
import { PollTemplateSystem } from '@/components/Polls/PollTemplateSystem';
import { AdvancedPermissionsManager } from '@/components/Polls/AdvancedPermissionsManager';
import { APIIntegrationManagement } from '@/components/Polls/APIIntegrationManagement';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  votes_count: number;
  is_active: boolean;
  ends_at?: string;
  created_at: string;
  creator_id: string;
  privacy_mode: string;
  show_results_after_expiry: boolean;
  auto_delete_at?: string;
  vote_results?: number[];
  engagement_rate?: number;
  regional_distribution?: any;
}

interface DashboardStats {
  totalPolls: number;
  totalVotes: number;
  averageEngagement: number;
  mostVotedPoll: Poll | null;
  activePolls: number;
}

const PollsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolls: 0,
    totalVotes: 0,
    averageEngagement: 0,
    mostVotedPoll: null,
    activePolls: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedPollForFraud, setSelectedPollForFraud] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchUserPolls();
    }
  }, [user]);

  const fetchUserPolls = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's polls
      const { data: pollsData, error } = await supabase
        .from('polls')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process polls with vote data
      const processedPolls = await Promise.all(
        pollsData?.map(async (poll) => {
          const pollOptions = Array.isArray(poll.options) 
            ? poll.options.map((option: any) => String(option))
            : [];
          
          // Get vote counts
          const { data: votesData } = await supabase
            .from('poll_votes')
            .select('option_index, created_at, region')
            .eq('poll_id', poll.id);

          const optionCounts = new Array(pollOptions.length).fill(0);
          votesData?.forEach(vote => {
            if (vote.option_index < optionCounts.length) {
              optionCounts[vote.option_index]++;
            }
          });

          // Calculate engagement rate (votes per day since creation)
          const daysSinceCreation = Math.max(1, Math.floor(
            (Date.now() - new Date(poll.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ));
          const engagementRate = (votesData?.length || 0) / daysSinceCreation;

          return {
            ...poll,
            options: pollOptions,
            votes_count: votesData?.length || 0,
            vote_results: optionCounts,
            engagement_rate: engagementRate
          };
        }) || []
      );

      setPolls(processedPolls);

      // Calculate dashboard stats
      const totalPolls = processedPolls.length;
      const totalVotes = processedPolls.reduce((sum, poll) => sum + poll.votes_count, 0);
      const averageEngagement = totalPolls > 0 ? totalVotes / totalPolls : 0;
      const mostVotedPoll = processedPolls.reduce((max, poll) => 
        poll.votes_count > (max?.votes_count || 0) ? poll : max, null
      );
      const activePolls = processedPolls.filter(poll => poll.is_active).length;

      setStats({
        totalPolls,
        totalVotes,
        averageEngagement,
        mostVotedPoll,
        activePolls
      });

    } catch (error) {
      console.error('Error fetching user polls:', error);
      toast({
        title: "Error",
        description: "Failed to load your polls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePollVisibility = async (pollId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: !currentVisibility })
        .eq('id', pollId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "Poll Updated",
        description: `Poll ${!currentVisibility ? 'activated' : 'deactivated'} successfully`
      });

      fetchUserPolls();
    } catch (error) {
      console.error('Error updating poll:', error);
      toast({
        title: "Error",
        description: "Failed to update poll",
        variant: "destructive"
      });
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete votes first
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId);

      // Delete poll
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "Poll Deleted",
        description: "Poll and all associated votes have been deleted"
      });

      fetchUserPolls();
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive"
      });
    }
  };

  const generateShareLink = (pollId: string) => {
    const shareUrl = `${window.location.origin}/polls?highlight=${pollId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard"
    });
  };

  const exportPollData = (poll: Poll, format: 'pdf' | 'csv' | 'image') => {
    // This would integrate with a proper export service
    toast({
      title: "Export Started",
      description: `Preparing ${format.toUpperCase()} export for "${poll.title}"`
    });
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access your polls dashboard.</p>
          <Button asChild>
            <Link to="/auth">Log In</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Polls Dashboard
              </h1>
              <p className="text-muted-foreground">Manage and analyze your civic polls</p>
            </div>
            <Button 
              onClick={() => setShowCreatePoll(true)}
              className="bg-gradient-flag hover:shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Poll
            </Button>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card className="text-center p-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">You haven't created any polls yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first poll and engaging with the Cameroonian community
              </p>
              <Button 
                onClick={() => setShowCreatePoll(true)}
                className="bg-gradient-flag hover:shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Poll
              </Button>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="management">Enterprise</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="fraud-protection">
                  <Shield className="w-4 h-4 mr-1" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="moderation">
                  <Flag className="w-4 h-4 mr-1" />
                  Moderation
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">{stats.totalPolls}</div>
                      <div className="text-xs text-muted-foreground">Total Polls</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold">{stats.totalVotes}</div>
                      <div className="text-xs text-muted-foreground">Total Votes</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold">{Math.round(stats.averageEngagement)}</div>
                      <div className="text-xs text-muted-foreground">Avg Votes</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">{stats.activePolls}</div>
                      <div className="text-xs text-muted-foreground">Active Polls</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="text-2xl font-bold">{polls.length - stats.activePolls}</div>
                      <div className="text-xs text-muted-foreground">Closed Polls</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Voted Poll Highlight */}
                {stats.mostVotedPoll && (
                  <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Your Most Popular Poll
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold mb-2">{stats.mostVotedPoll.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stats.mostVotedPoll.votes_count} votes</span>
                        <span>{formatDistanceToNow(new Date(stats.mostVotedPoll.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Polls List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Polls</h3>
                  {polls.slice(0, 5).map((poll) => (
                    <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{poll.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {poll.votes_count} votes
                              </span>
                              <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                              <Badge variant={poll.is_active ? "default" : "secondary"}>
                                {poll.is_active ? "Active" : "Closed"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPoll(poll)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateShareLink(poll.id)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {poll.options.map((option, index) => {
                            const votes = poll.vote_results?.[index] || 0;
                            const percentage = poll.votes_count > 0 ? Math.round((votes / poll.votes_count) * 100) : 0;
                            
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{option}</span>
                                  <span className="text-muted-foreground">{votes} ({percentage}%)</span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {polls.map((poll) => (
                    <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-base">{poll.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{poll.votes_count} votes</span>
                          <span>Engagement: {poll.engagement_rate?.toFixed(1)} votes/day</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Vote Distribution</h4>
                            <div className="space-y-2">
                              {poll.options.map((option, index) => {
                                const votes = poll.vote_results?.[index] || 0;
                                const percentage = poll.votes_count > 0 ? Math.round((votes / poll.votes_count) * 100) : 0;
                                
                                return (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="truncate">{option}</span>
                                      <span>{percentage}%</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => exportPollData(poll, 'pdf')}
                              className="flex-1"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => exportPollData(poll, 'image')}
                              className="flex-1"
                            >
                              <Image className="w-4 h-4 mr-1" />
                              Image
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => exportPollData(poll, 'csv')}
                              className="flex-1"
                            >
                              <Table className="w-4 h-4 mr-1" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Management Tab */}
              <TabsContent value="management" className="space-y-6">
                <Tabs defaultValue="bulk" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="api">API Management</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bulk">
                    <EnterpriseBulkOperations />
                  </TabsContent>
                  
                  <TabsContent value="permissions">
                    <AdvancedPermissionsManager />
                  </TabsContent>
                  
                  <TabsContent value="api">
                    <APIIntegrationManagement />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <PollTemplateSystem />
              </TabsContent>

              {/* Fraud Protection Tab */}
              <TabsContent value="fraud-protection" className="space-y-6">
                {selectedPollForFraud ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedPollForFraud(null)}
                      >
                        ← Back to Poll List
                      </Button>
                      <h3 className="text-lg font-semibold">
                        Fraud Protection: {polls.find(p => p.id === selectedPollForFraud)?.title}
                      </h3>
                    </div>
                    <PollFraudProtectionEngine 
                      pollId={selectedPollForFraud} 
                      isCreator={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Select a Poll to Configure Fraud Protection</h3>
                      <p className="text-muted-foreground">
                        Choose one of your polls to view and configure anti-fraud settings
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {polls.map((poll) => (
                        <Card key={poll.id} className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedPollForFraud(poll.id)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{poll.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {poll.votes_count} votes • Created {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={poll.is_active ? "default" : "secondary"}>
                                  {poll.is_active ? "Active" : "Closed"}
                                </Badge>
                                <Shield className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {polls.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Polls Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Create your first poll to access fraud protection features
                          </p>
                          <Button onClick={() => setShowCreatePoll(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Poll
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Moderation Tab */}
              <TabsContent value="moderation" className="space-y-6">
                <PollModerationTab />
              </TabsContent>
            </Tabs>
          )}

          {/* Poll Details Modal */}
          {selectedPoll && (
            <Dialog open={!!selectedPoll} onOpenChange={() => setSelectedPoll(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{selectedPoll.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Created:</strong> {formatDistanceToNow(new Date(selectedPoll.created_at), { addSuffix: true })}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge className="ml-2" variant={selectedPoll.is_active ? "default" : "secondary"}>
                        {selectedPoll.is_active ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <div>
                      <strong>Total Votes:</strong> {selectedPoll.votes_count}
                    </div>
                    <div>
                      <strong>Privacy:</strong> 
                      <Badge className="ml-2 capitalize" variant="outline">
                        {selectedPoll.privacy_mode}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Vote Results</h4>
                    <div className="space-y-3">
                      {selectedPoll.options.map((option, index) => {
                        const votes = selectedPoll.vote_results?.[index] || 0;
                        const percentage = selectedPoll.votes_count > 0 ? Math.round((votes / selectedPoll.votes_count) * 100) : 0;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <span>{option}</span>
                              <span className="text-muted-foreground">{votes} votes ({percentage}%)</span>
                            </div>
                            <Progress value={percentage} className="h-3" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Regional Distribution</h4>
                    <RegionalHeatmap 
                      pollId={selectedPoll.id} 
                      pollOptions={selectedPoll.options}
                      isVisible={true}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <CreatePollDialog 
            isOpen={showCreatePoll} 
            onClose={() => setShowCreatePoll(false)} 
            onSuccess={() => {
              setShowCreatePoll(false);
              fetchUserPolls();
              toast({
                title: "Poll Created!",
                description: "Your poll has been created successfully"
              });
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PollsDashboard;