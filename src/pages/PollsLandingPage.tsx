import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PollTemplateSelector } from '@/components/PollTemplates/PollTemplateSelector';
import { PollTemplateRenderer } from '@/components/PollTemplates/PollTemplateRenderer';
import { CreatePollDialog } from '@/components/Polls/CreatePollDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Vote, 
  Users, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Plus,
  Eye,
  MapPin,
  Share2,
  QrCode,
  Zap,
  Target,
  Globe,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

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
  privacy_mode: 'public' | 'private' | 'anonymous';
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  vote_results?: number[];
}

interface PollTemplate {
  id: string;
  style_name: string;
  description: string;
  layout_type: string;
  style_class: string;
  color_theme: any;
  icon_set: string;
  is_active: boolean;
  template_name?: string;
  features?: any;
}

const PollsLandingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topPolls, setTopPolls] = useState<Poll[]>([]);
  const [recentPolls, setRecentPolls] = useState<Poll[]>([]);
  const [templates, setTemplates] = useState<PollTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PollTemplate | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch poll templates
      const { data: templatesData } = await supabase
        .from('poll_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (templatesData) {
        setTemplates(templatesData);
      }

      // Fetch top polls (most voted)
      const { data: topPollsData } = await supabase
        .from('polls')
        .select(`
          *,
          profiles(username, display_name, avatar_url)
        `)
        .eq('is_active', true)
        .eq('privacy_mode', 'public')
        .order('total_votes', { ascending: false })
        .limit(5);

      // Fetch recent polls
      const { data: recentPollsData } = await supabase
        .from('polls')
        .select(`
          *,
          profiles(username, display_name, avatar_url)
        `)
        .eq('privacy_mode', 'public')
        .order('created_at', { ascending: false })
        .limit(6);

      // Process polls data
      const processPolls = async (pollsData: any[]) => {
        return Promise.all(
          pollsData?.map(async (poll) => {
            const pollOptions = Array.isArray(poll.options) 
              ? poll.options.map((option: any) => String(option))
              : [];
            
            const { data: votesData } = await supabase
              .from('poll_votes')
              .select('option_index')
              .eq('poll_id', poll.id);

            const optionCounts = new Array(pollOptions.length).fill(0);
            votesData?.forEach(vote => {
              if (vote.option_index < optionCounts.length) {
                optionCounts[vote.option_index]++;
              }
            });

            return {
              ...poll,
              options: pollOptions,
              votes_count: votesData?.length || 0,
              vote_results: optionCounts
            };
          }) || []
        );
      };

      if (topPollsData) {
        const processedTopPolls = await processPolls(topPollsData);
        setTopPolls(processedTopPolls);
      }

      if (recentPollsData) {
        const processedRecentPolls = await processPolls(recentPollsData);
        setRecentPolls(processedRecentPolls);
      }

    } catch (error) {
      console.error('Error fetching polls data:', error);
      toast({
        title: "Error",
        description: "Failed to load polls data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Voting & Results",
      description: "See live vote counts and results as they happen"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Anonymous or Public Polls",
      description: "Choose your privacy level for sensitive topics"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "National Heatmap Visualization",
      description: "Regional voting patterns across Cameroon"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Shareable Links & QR Codes",
      description: "Easy sharing across social media and messaging"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Region-targeted Voting",
      description: "Focus polls on specific regions or demographics"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics Dashboard",
      description: "Deep insights into voting patterns and engagement"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <div className="bg-gradient-flag/5 border-b border-border/50">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
                Pulse the Nation
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                Polls help us capture real-time public opinion across Cameroon — giving every citizen a voice in governance, policy, and national trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button 
                    onClick={() => setShowCreatePoll(true)}
                    size="lg" 
                    className="bg-gradient-flag hover:shadow-glow transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Poll
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-flag hover:shadow-glow transition-all duration-300">
                    <Link to="/auth">
                      <Plus className="w-5 h-5 mr-2" />
                      Sign Up to Create Polls
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link to="#explore">
                    <Eye className="w-5 h-5 mr-2" />
                    Explore Existing Polls
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
          {/* Features Overview */}
          <section className="mb-12 lg:mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Poll Features Overview</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful tools to create engaging polls and gather meaningful insights from the Cameroonian community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 border-border/50 hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Poll Templates Gallery */}
          <section className="mb-12 lg:mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Premium Poll Templates</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from 10 professionally designed templates to create engaging and visually appealing polls
              </p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-32 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.slice(0, 6).map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-elegant transition-all duration-300 group"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-6">
                      <div className="h-32 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          Template Preview
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {template.style_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {template.layout_type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/admin/core">
                  View All Templates
                </Link>
              </Button>
            </div>
          </section>

          {/* Content Sections */}
          <section id="explore">
            <Tabs defaultValue="top" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="top" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Polls
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Polls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="top" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Most Voted Polls</h3>
                  <p className="text-muted-foreground">See what topics are engaging the community most</p>
                </div>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted rounded mb-4"></div>
                          <div className="space-y-2">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="h-10 bg-muted rounded"></div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {topPolls.map((poll) => (
                      <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{poll.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-500 text-white">
                                <Vote className="w-3 h-3 mr-1" />
                                {poll.votes_count} votes
                              </Badge>
                              <Button asChild variant="outline" size="sm">
                                <Link to="/polls">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {poll.options.map((option, index) => {
                              const votes = poll.vote_results?.[index] || 0;
                              const percentage = poll.votes_count > 0 ? Math.round((votes / poll.votes_count) * 100) : 0;
                              
                              return (
                                <div key={index} className="space-y-2">
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
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Latest Community Polls</h3>
                  <p className="text-muted-foreground">Fresh perspectives from fellow Cameroonians</p>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-5 bg-muted rounded mb-3"></div>
                          <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                          <div className="space-y-2">
                            {[...Array(2)].map((_, j) => (
                              <div key={j} className="h-8 bg-muted rounded"></div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentPolls.map((poll) => (
                      <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-base leading-tight">{poll.title}</CardTitle>
                          {poll.description && (
                            <p className="text-sm text-muted-foreground">{poll.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>by @{poll.profiles?.username}</span>
                            <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {poll.options.slice(0, 2).map((option, index) => (
                              <div key={index} className="p-2 border rounded text-sm">
                                {option}
                              </div>
                            ))}
                            {poll.options.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{poll.options.length - 2} more options
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {poll.votes_count}
                              </span>
                              {poll.ends_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/polls">
                                Vote
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* Call to Action */}
          <section className="mt-16 text-center">
            <Card className="bg-gradient-flag/10 border-primary/20">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Create Your Poll?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of Cameroonians sharing their voices on important civic matters. 
                  Create your first poll today and contribute to democratic dialogue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <Button 
                      onClick={() => setShowCreatePoll(true)}
                      size="lg" 
                      className="bg-gradient-flag hover:shadow-glow"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Poll Now
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="bg-gradient-flag hover:shadow-glow">
                      <Link to="/auth">
                        <Plus className="w-5 h-5 mr-2" />
                        Sign Up & Create Poll
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="lg">
                    <Link to="/dashboard/polls">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      View Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Template Preview Dialog */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTemplate.style_name}</CardTitle>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">{selectedTemplate.style_name}</h3>
                  <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
                  <div className="bg-muted/20 rounded-lg p-6">
                    <p className="text-sm text-muted-foreground">Template preview will render here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <CreatePollDialog 
          isOpen={showCreatePoll} 
          onClose={() => setShowCreatePoll(false)} 
          onSuccess={() => {
            setShowCreatePoll(false);
            toast({
              title: "Poll Created!",
              description: "Your poll has been created successfully"
            });
          }}
        />
      </div>
    </AppLayout>
  );
};

export default PollsLandingPage;