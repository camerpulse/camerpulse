import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Shield,
  Search,
  Filter,
  Star,
  Heart,
  MessageCircle,
  ChevronRight,
  Award,
  Smartphone,
  Facebook,
  Instagram,
  HelpCircle,
  Play
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { PollsQuickGuide } from '@/components/Polls/PollsQuickGuide';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterIssue, setFilterIssue] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');

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

  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Reach Thousands of Citizens",
      description: "Connect with fellow Cameroonians nationwide"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-time Results & Analytics",
      description: "Watch opinions form in real-time with detailed insights"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Templates for Every Question",
      description: "Professional designs for any type of civic poll"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Easy Sharing Across Platforms",
      description: "WhatsApp, Facebook, Instagram - share everywhere"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Anonymous or Transparent Voting",
      description: "Choose your privacy level for sensitive topics"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Regional Sentiment Tracking",
      description: "See how different regions of Cameroon respond"
    }
  ];

  const faqItems = [
    {
      question: "How long do polls last?",
      answer: "Polls can run from 1 hour to 30 days - you set the duration when creating."
    },
    {
      question: "Who can vote on my polls?",
      answer: "You can set polls as public (anyone), regional (specific areas), or private (invite-only)."
    },
    {
      question: "Can people manipulate votes?",
      answer: "We use advanced fraud detection and one-vote-per-person verification."
    },
    {
      question: "Can I hide my poll results?",
      answer: "Yes, you can choose to hide results until voting ends or make them always visible."
    },
    {
      question: "Can I delete a poll?",
      answer: "Active polls can be ended early. Completed polls remain for historical reference."
    }
  ];

  const regions = ['All Regions', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'];
  const issues = ['All Issues', 'Health', 'Education', 'Politics', 'Economy', 'Infrastructure', 'Environment', 'Social'];
  const languages = ['All Languages', 'English', 'French', 'Pidgin'];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <div className="bg-gradient-flag/5 border-b border-border/50">
          <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 sm:mb-6">
                Your Voice. Your Power. Cast a Poll, Shape a Nation.
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
                Every poll on CamerPulse gives citizens across Cameroon a direct voice in shaping policy, governance, and national dialogue. Create polls, vote on issues that matter, and see real-time sentiment from your fellow Cameroonians.
              </p>
              <div className="bg-accent/10 rounded-lg p-4 mb-6 sm:mb-8 text-sm sm:text-base text-center italic border border-accent/20">
                "Democracy is not just about voting every few years — it's about having your voice heard every day." - Nelson Mandela
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {user ? (
                  <Button 
                    onClick={() => setShowCreatePoll(true)}
                    size="lg" 
                    className="bg-gradient-flag hover:shadow-glow transition-all duration-300 text-white"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Create a Poll
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-flag hover:shadow-glow transition-all duration-300 text-white">
                    <Link to="/auth">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Sign Up to Create Polls
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="border-primary/20">
                  <Link to="/poll-templates">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Explore Templates
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
          {/* Quick Guide Section */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <PollsQuickGuide />
          </section>

          {/* Benefits Section */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Benefits of Using CamerPulse Polls</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto px-4">
                Join thousands of Cameroonians in democratic dialogue with powerful polling tools designed for civic engagement
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card/50 border-border/50 hover:shadow-elegant transition-all duration-300 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Poll Templates Gallery */}
          <section id="templates" className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Poll Templates Gallery</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto px-4">
                Choose from professionally designed templates to create engaging polls that resonate with your audience
              </p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-24 sm:h-32 bg-muted rounded mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
                      <div className="h-2 sm:h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {templates.slice(0, 9).map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-elegant transition-all duration-300 group relative overflow-hidden"
                    onClick={() => {
                      if (user) {
                        setSelectedTemplate(template);
                        setShowCreatePoll(true);
                      } else {
                        toast({
                          title: "Sign in required",
                          description: "Please sign in to use poll templates",
                          variant: "default"
                        });
                      }
                    }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-20 sm:h-32 rounded-lg mb-3 sm:mb-4 overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                            <Vote className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{template.style_name}</p>
                        </div>
                        <Badge className="absolute top-2 right-2 text-xs bg-primary/90">
                          {template.layout_type === 'basic' ? 'Public' : template.layout_type === 'advanced' ? 'Anonymous' : 'Youth Poll'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                        {template.style_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{template.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-civic hover:shadow-glow text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user) {
                            setSelectedTemplate(template);
                            setShowCreatePoll(true);
                          } else {
                            toast({
                              title: "Sign in required",
                              description: "Please sign in to use this template"
                            });
                          }
                        }}
                      >
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6 sm:mt-8">
              <Button asChild variant="outline" size="lg" className="mr-4">
                <Link to="/poll-templates">
                  View All Advanced Templates
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Top Polls Showcase */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Top Polls Showcase</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                See the most engaging polls from the community this week
              </p>
            </div>
            
            {loading ? (
              <div className="space-y-4 sm:space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-4 sm:h-6 bg-muted rounded mb-3 sm:mb-4"></div>
                      <div className="space-y-2 sm:space-y-3">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-8 sm:h-10 bg-muted rounded"></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {topPolls.slice(0, 5).map((poll, index) => (
                  <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300 border-l-4 border-l-primary/20">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-gradient-civic text-white text-xs">
                              #{index + 1} Most Voted
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {poll.votes_count} votes
                            </Badge>
                          </div>
                          <CardTitle className="text-sm sm:text-lg leading-tight">{poll.title}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            by @{poll.profiles?.username} • {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/polls/discover">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Vote
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        {poll.options.map((option, optionIndex) => {
                          const votes = poll.vote_results?.[optionIndex] || 0;
                          const percentage = poll.votes_count > 0 ? Math.round((votes / poll.votes_count) * 100) : 0;
                          
                          return (
                            <div key={optionIndex} className="space-y-1 sm:space-y-2">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="font-medium">{option}</span>
                                <span className="text-muted-foreground">{votes} ({percentage}%)</span>
                              </div>
                              <Progress value={percentage} className="h-1.5 sm:h-2" />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {Math.floor(poll.votes_count * 0.7)} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {Math.floor(poll.votes_count * 0.2)} comments
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            {Math.floor(poll.votes_count * 0.1)} shares
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {poll.privacy_mode}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Create Poll CTA */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <Card className="bg-gradient-flag/10 border-primary/20 text-center">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Haven't created a poll yet?</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto">
                  Join the conversation! Create your first poll and see what your fellow Cameroonians think about the issues that matter to you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                    <span>Pick a template</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                    <span>Ask your question</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
                    <span>Get answers that matter</span>
                  </div>
                </div>
                {user ? (
                  <Button 
                    onClick={() => setShowCreatePoll(true)}
                    size="lg" 
                    className="bg-gradient-flag hover:shadow-glow text-white"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Your First Poll Now
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-flag hover:shadow-glow text-white">
                    <Link to="/auth">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Sign Up & Start Polling
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Poll Search & Filter */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Discover Polls</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Browse polls by region, topic, or language to find discussions that matter to you
              </p>
            </div>
            
            <div className="bg-card/50 rounded-lg p-4 sm:p-6 border border-border/50 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search polls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region.toLowerCase().replace(' ', '-')}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterIssue} onValueChange={setFilterIssue}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Issues" />
                  </SelectTrigger>
                  <SelectContent>
                    {issues.map((issue) => (
                      <SelectItem key={issue} value={issue.toLowerCase()}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language.toLowerCase()}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                  <Filter className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                  <Star className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentPolls.slice(0, 6).map((poll) => (
                <Card key={poll.id} className="hover:shadow-elegant transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">{poll.title}</CardTitle>
                    {poll.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{poll.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-3 sm:mb-4">
                      {poll.options.slice(0, 2).map((option, index) => (
                        <div key={index} className="p-2 border rounded text-xs sm:text-sm bg-muted/20">
                          {option}
                        </div>
                      ))}
                      {poll.options.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{poll.options.length - 2} more options
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>by @{poll.profiles?.username}</span>
                      <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        <Link to="/polls/discover">
                          Vote
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-6 sm:mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/polls/discover">
                  Browse All Polls
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Civic Polls FAQ</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Common questions about creating and participating in polls on CamerPulse
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {faqItems.map((faq, index) => (
                <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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