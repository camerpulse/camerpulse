import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, TrendingUp, Clock, Users, Building, Vote, Heart, Leaf, Cpu, Palette } from 'lucide-react';

interface PollCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  poll_count: number;
  is_active: boolean;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  votes_count: number;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  ends_at: string;
  is_active: boolean;
  category_id?: string;
}

const PollCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<PollCategory[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [pollType, setPollType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPolls();
  }, [selectedCategory, sortBy, pollType, searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_categories')
        .select('*')
        .eq('is_active', true)
        .order('poll_count', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load poll categories.",
        variant: "destructive"
      });
    }
  };

  const fetchPolls = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('polls')
        .select(`
          id, title, description, votes_count, view_count, bookmark_count,
          created_at, ends_at, is_active, 
          category_id
        `)
        .eq('is_active', true);

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('votes_count', { ascending: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        case 'ending_soon':
          query = query.order('ends_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'government': return <Building className="h-4 w-4" />;
      case 'vote': return <Vote className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'trending-up': return <TrendingUp className="h-4 w-4" />;
      case 'heart': return <Heart className="h-4 w-4" />;
      case 'leaf': return <Leaf className="h-4 w-4" />;
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'palette': return <Palette className="h-4 w-4" />;
      default: return <div className="h-4 w-4 rounded-full bg-primary" />;
    }
  };

  const isExpired = (endDate: string) => new Date() > new Date(endDate);
  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Polls</h1>
        <p className="text-muted-foreground">
          Discover and participate in polls across different categories
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {getCategoryIcon(category.icon)}
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.poll_count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : polls.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No polls found matching your criteria.</p>
            <Button className="mt-4" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPollType('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {poll.title}
                  </CardTitle>
                  {isExpired(poll.ends_at) && (
                    <Badge variant="destructive" className="ml-2 shrink-0">
                      Expired
                    </Badge>
                  )}
                </div>
                {poll.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {poll.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {poll.votes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {poll.view_count || 0}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeRemaining(poll.ends_at)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs">
                    Active Poll
                  </Badge>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => window.location.href = `/polls/${poll.id}`}
                >
                  {isExpired(poll.ends_at) ? 'View Results' : 'Vote Now'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PollCategoryManager;