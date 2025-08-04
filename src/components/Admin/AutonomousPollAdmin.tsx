import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Settings, 
  Play, 
  Pause, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Zap,
  AlertCircle,
  Edit,
  Calendar,
  Globe,
  Hash
} from 'lucide-react';

interface AutonomousConfig {
  system_enabled?: { enabled: boolean; description: string };
  generation_schedule?: { frequency: string; max_per_week: number; min_confidence: number };
  auto_publish?: { enabled: boolean; require_admin_approval: boolean };
  topic_weights?: Record<string, number>;
  style_mapping?: Record<string, string>;
  sentiment_thresholds?: Record<string, number>;
  regional_boost?: { enabled: boolean; boost_factor: number; affected_regions_only: boolean };
  social_monitoring?: { enabled: boolean; platforms: string[]; hashtag_threshold: number };
}

interface AutonomousPoll {
  id: string;
  poll_id: string;
  topic_category: string;
  confidence_score: number;
  auto_published: boolean;
  admin_approved: boolean | null;
  created_at: string;
  polls?: {
    title: string;
    votes_count: number;
    is_active: boolean;
  };
}

export const AutonomousPollAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<AutonomousConfig>({});
  const [recentPolls, setRecentPolls] = useState<AutonomousPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchRecentPolls();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('autonomous_poll_config')
        .select('*')
        .eq('is_enabled', true);

      if (error) throw error;

      const configObj = data?.reduce((acc, item) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {} as AutonomousConfig) || {};

      setConfig(configObj);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Failed to load configuration",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('autonomous_polls')
        .select(`
          *,
          polls:poll_id (
            title,
            votes_count,
            is_active
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentPolls(data || []);
    } catch (error) {
      console.error('Error fetching recent polls:', error);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('autonomous_poll_config')
        .upsert({
          config_key: key,
          config_value: value,
          updated_by: user?.id
        });

      if (error) throw error;

      setConfig(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Configuration Updated",
        description: `${key} has been updated successfully`
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    }
  };

  const triggerGeneration = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('camerpulse-intelligence-core');
      
      if (error) throw error;

      toast({
        title: "Poll Generation Triggered! 🧠",
        description: data.success 
          ? `Generated: "${data.poll.title.substring(0, 50)}..."`
          : data.message || "Generation completed"
      });

      // Refresh the recent polls list
      fetchRecentPolls();
    } catch (error) {
      console.error('Error triggering generation:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to trigger poll generation",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const approveRejectPoll = async (pollId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('autonomous_polls')
        .update({
          admin_approved: approved,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', pollId);

      if (error) throw error;

      // Update poll activation status
      const autonomousPoll = recentPolls.find(p => p.id === pollId);
      if (autonomousPoll?.poll_id) {
        await supabase
          .from('polls')
          .update({ is_active: approved })
          .eq('id', autonomousPoll.poll_id);
      }

      toast({
        title: approved ? "Poll Approved ✅" : "Poll Rejected ❌",
        description: approved ? "Poll is now live" : "Poll has been deactivated"
      });

      fetchRecentPolls();
    } catch (error) {
      console.error('Error updating poll approval:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update poll status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            CamerPulse Intelligence Core
            <Badge variant={config.system_enabled?.enabled ? "default" : "secondary"}>
              {config.system_enabled?.enabled ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Autonomous poll generation based on real-time sentiment analysis
          </p>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* System Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable System</p>
                <p className="text-sm text-muted-foreground">Master switch for autonomous generation</p>
              </div>
              <Switch
                checked={config.system_enabled?.enabled || false}
                onCheckedChange={(checked) => 
                  updateConfig('system_enabled', { 
                    enabled: checked, 
                    description: "Master switch for autonomous poll generation" 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Publish</p>
                <p className="text-sm text-muted-foreground">Publish without admin approval</p>
              </div>
              <Switch
                checked={config.auto_publish?.enabled || false}
                onCheckedChange={(checked) => 
                  updateConfig('auto_publish', { 
                    enabled: checked, 
                    require_admin_approval: !checked 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Regional Boost</p>
                <p className="text-sm text-muted-foreground">Prioritize affected regions</p>
              </div>
              <Switch
                checked={config.regional_boost?.enabled || false}
                onCheckedChange={(checked) => 
                  updateConfig('regional_boost', { 
                    enabled: checked, 
                    boost_factor: 1.5, 
                    affected_regions_only: true 
                  })
                }
              />
            </div>

             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Generation Frequency</p>
                   <p className="text-sm text-muted-foreground">How often to check for trending topics</p>
                 </div>
                 <select 
                   className="px-3 py-1 border rounded-md text-sm"
                   value={config.generation_schedule?.frequency || 'daily'}
                   onChange={(e) => updateConfig('generation_schedule', {
                     ...config.generation_schedule,
                     frequency: e.target.value
                   })}
                 >
                   <option value="hourly">Every 6 hours</option>
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="manual">Manual only</option>
                 </select>
               </div>

               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Social Media Sources</p>
                   <p className="text-sm text-muted-foreground">Monitor trending hashtags & mentions</p>
                 </div>
                 <Switch
                   checked={config.social_monitoring?.enabled || false}
                   onCheckedChange={(checked) => 
                     updateConfig('social_monitoring', { 
                       enabled: checked,
                       platforms: ['twitter', 'facebook'],
                       hashtag_threshold: 100
                     })
                   }
                 />
               </div>
             </div>

             <Button 
               onClick={triggerGeneration}
               disabled={!config.system_enabled?.enabled || generating}
               className="w-full"
             >
               {generating ? (
                 <>
                   <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                   Generating...
                 </>
               ) : (
                 <>
                   <Play className="w-4 h-4 mr-2" />
                   Trigger Generation Now
                 </>
               )}
             </Button>
          </CardContent>
        </Card>

        {/* System Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              System Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{recentPolls.length}</div>
                <div className="text-xs text-muted-foreground">Generated Polls</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {recentPolls.filter(p => p.admin_approved === true).length}
                </div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {recentPolls.filter(p => p.admin_approved === null).length}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {config.generation_schedule?.max_per_week || 2}
                </div>
                <div className="text-xs text-muted-foreground">Weekly Limit</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Generation Schedule:</span>
                <Badge variant="outline">{config.generation_schedule?.frequency || 'Weekly'}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Min Confidence:</span>
                <Badge variant="outline">{(config.generation_schedule?.min_confidence || 0.7) * 100}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Polls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Autonomous Polls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPolls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No autonomous polls generated yet
              </div>
            ) : (
              recentPolls.map((poll) => (
                <div key={poll.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{poll.polls?.title || 'Loading...'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {poll.topic_category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(poll.confidence_score * 100).toFixed(0)}% confidence
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {poll.polls?.votes_count || 0} votes
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {poll.admin_approved === null ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveRejectPoll(poll.id, true)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveRejectPoll(poll.id, false)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant={poll.admin_approved ? "default" : "destructive"}>
                          {poll.admin_approved ? "Approved" : "Rejected"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Generated {new Date(poll.created_at).toLocaleDateString()} • 
                    {poll.auto_published ? " Auto-published" : " Requires approval"}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};