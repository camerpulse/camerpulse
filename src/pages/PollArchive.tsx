import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommentThread } from '@/components/Polls/CommentThread';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Search,
  Filter,
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Archive,
  TrendingUp,
  Vote,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  poll_type?: string;
  region?: string;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  vote_results?: number[];
}

interface FilterState {
  search: string;
  region: string;
  topic: string;
  outcome: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  showActive: boolean;
}

const PollArchive = () => {
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: 'all',
    topic: 'all',
    outcome: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    showActive: false
  });

  const regions = [
    'all', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const topics = [
    'all', 'political', 'economic', 'social', 'infrastructure', 
    'education', 'health', 'environment', 'security', 'other'
  ];

  const outcomes = [
    'all', 'completed', 'active', 'expired'
  ];

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [polls, filters]);

  const fetchPolls = async () => {
    try {
      setLoading(true);

      // Fetch all polls with creator profiles and vote data
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote results for each poll
      const pollsWithResults = await Promise.all(
        pollsData?.map(async (poll) => {
          // Get creator profile
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', poll.creator_id)
            .single();

          // Ensure options is an array of strings
          const pollOptions = Array.isArray(poll.options) 
            ? poll.options.map(option => String(option))
            : [];
          
          // Get vote counts for each option
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
            id: poll.id,
            title: poll.title,
            description: poll.description || undefined,
            options: pollOptions,
            votes_count: votesData?.length || 0,
            is_active: poll.is_active || false,
            ends_at: poll.ends_at || undefined,
            created_at: poll.created_at,
            creator_id: poll.creator_id,
            poll_type: (poll as any).poll_type || 'general',
            region: (poll as any).region || 'national',
            profiles: creatorProfile || undefined,
            vote_results: optionCounts
          } as Poll;
        }) || []
      );

      setPolls(pollsWithResults);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load poll archive",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...polls];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(searchLower) ||
        poll.description?.toLowerCase().includes(searchLower) ||
        poll.options.some(option => option.toLowerCase().includes(searchLower))
      );
    }

    // Region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter(poll => poll.region === filters.region);
    }

    // Topic filter
    if (filters.topic !== 'all') {
      filtered = filtered.filter(poll => poll.poll_type === filters.topic);
    }

    // Outcome filter
    if (filters.outcome !== 'all') {
      filtered = filtered.filter(poll => {
        const isActive = poll.is_active && (!poll.ends_at || new Date(poll.ends_at) > new Date());
        const isExpired = poll.ends_at && new Date(poll.ends_at) < new Date();
        
        switch (filters.outcome) {
          case 'active':
            return isActive;
          case 'completed':
            return !poll.is_active || isExpired;
          case 'expired':
            return isExpired;
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(poll => new Date(poll.created_at) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(poll => new Date(poll.created_at) <= filters.dateTo!);
    }

    setFilteredPolls(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      region: 'all',
      topic: 'all',
      outcome: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      showActive: false
    });
  };

  const isPollActive = (poll: Poll) => {
    if (!poll.is_active) return false;
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) return false;
    return true;
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const getPollOutcome = (poll: Poll) => {
    if (isPollActive(poll)) return 'Active';
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) return 'Expired';
    return 'Completed';
  };

  const getWinningOption = (poll: Poll) => {
    if (!poll.vote_results || poll.vote_results.length === 0) return null;
    const maxVotes = Math.max(...poll.vote_results);
    const winningIndex = poll.vote_results.findIndex(votes => votes === maxVotes);
    return winningIndex !== -1 ? poll.options[winningIndex] : null;
  };

  return (
    <AppLayout>
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Archive className="w-8 h-8 text-primary" />
              Poll Archive
            </h1>
            <p className="text-muted-foreground">
              Browse and search through all past public polls
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Archive className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{polls.length}</div>
              <div className="text-sm text-muted-foreground">Total Polls</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-cm-green mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {polls.reduce((sum, poll) => sum + poll.votes_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-cm-yellow mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {polls.filter(poll => isPollActive(poll)).length}
              </div>
              <div className="text-sm text-muted-foreground">Still Active</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-cm-red mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {filteredPolls.length}
              </div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search polls by title, description, or options..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region === 'all' ? 'All Regions' : region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.topic} onValueChange={(value) => updateFilter('topic', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic === 'all' ? 'All Topics' : topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.outcome} onValueChange={(value) => updateFilter('outcome', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Outcome" />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome === 'all' ? 'All Outcomes' : outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter('dateFrom', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter('dateTo', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
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
        ) : filteredPolls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No polls found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPolls.map((poll) => {
              const isActive = isPollActive(poll);
              const outcome = getPollOutcome(poll);
              const winningOption = getWinningOption(poll);
              
              return (
                <Card key={poll.id} className="border-0 shadow-elegant">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={poll.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {poll.profiles?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{poll.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>by @{poll.profiles?.username}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                            {poll.region && poll.region !== 'national' && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {poll.region}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <Badge className="bg-cm-green text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : outcome === 'Expired' ? (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        
                        {poll.poll_type && poll.poll_type !== 'general' && (
                          <Badge variant="outline">
                            {poll.poll_type.charAt(0).toUpperCase() + poll.poll_type.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {poll.description && (
                      <p className="text-muted-foreground mt-2">
                        {poll.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {poll.options.map((option, index) => {
                        const votes = poll.vote_results?.[index] || 0;
                        const percentage = getVotePercentage(votes, poll.votes_count);
                        const isWinner = winningOption === option && poll.votes_count > 0;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className={cn(
                              "w-full justify-start text-left h-auto p-4 border rounded",
                              isWinner ? "border-primary bg-primary/5" : "border-border"
                            )}>
                              <div className="flex items-center justify-between w-full">
                                <span className="flex-1">{option}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {votes} votes ({percentage}%)
                                  </span>
                                  {isWinner && (
                                    <Badge variant="default" className="text-xs">
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{poll.votes_count} votes</span>
                        </div>
                        {poll.ends_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(poll.ends_at) > new Date() ? 'Ends' : 'Ended'} {' '}
                              {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="outline">
                        {outcome}
                      </Badge>
                    </div>
                    
                    {/* Comment Thread */}
                    <div className="mt-4">
                      <CommentThread pollId={poll.id} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default PollArchive;