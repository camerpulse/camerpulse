import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  Star,
  Users,
  Award,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';

interface TenderData {
  id: string;
  title: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  region: string;
  status: string;
  bids_count: number;
  category: string;
  currency: string;
  views_count: number;
}

interface StatsData {
  totalTenders: number;
  activeTenders: number;
  totalValue: number;
  averageBids: number;
}

const TenderHomePage: React.FC = () => {
  const { toast } = useToast();
  const [featuredTenders, setFeaturedTenders] = useState<TenderData[]>([]);
  const [recentTenders, setRecentTenders] = useState<TenderData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalTenders: 0,
    activeTenders: 0,
    totalValue: 0,
    averageBids: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenderData();
  }, []);

  const fetchTenderData = async () => {
    try {
      // Fetch featured tenders (high-value or high-bid count)
      const { data: featured, error: featuredError } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'open')
        .order('bids_count', { ascending: false })
        .limit(3);

      if (featuredError) throw featuredError;

      // Fetch recent tenders
      const { data: recent, error: recentError } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);

      if (recentError) throw recentError;

      // Fetch stats
      const { count: totalCount } = await supabase
        .from('tenders')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('tenders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { data: valueData } = await supabase
        .from('tenders')
        .select('budget_max')
        .not('budget_max', 'is', null);

      const totalValue = valueData?.reduce((sum, tender) => sum + (tender.budget_max || 0), 0) || 0;

      const { data: bidsData } = await supabase
        .from('tenders')
        .select('bids_count');

      const averageBids = bidsData?.length > 0 
        ? bidsData.reduce((sum, tender) => sum + tender.bids_count, 0) / bidsData.length 
        : 0;

      setFeaturedTenders(featured || []);
      setRecentTenders(recent || []);
      setStats({
        totalTenders: totalCount || 0,
        activeTenders: activeCount || 0,
        totalValue,
        averageBids: Math.round(averageBids)
      });

    } catch (error) {
      console.error('Error fetching tender data:', error);
      toast({
        title: "Error",
        description: "Failed to load tender data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to tenders page with search query
      window.location.href = `/tenders?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/tenders';
    }
  };

  const formatBudget = (min?: number, max?: number, currency: string = 'FCFA') => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    }
    if (min) {
      return `From ${min.toLocaleString()} ${currency}`;
    }
    return 'Budget not disclosed';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closing_soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [
    { name: 'Construction', icon: Building, count: 45, color: 'text-blue-600' },
    { name: 'IT Services', icon: Globe, count: 23, color: 'text-green-600' },
    { name: 'Consulting', icon: Users, count: 34, color: 'text-purple-600' },
    { name: 'Supply', icon: FileText, count: 67, color: 'text-orange-600' },
    { name: 'Healthcare', icon: Shield, count: 12, color: 'text-red-600' },
    { name: 'Transportation', icon: Zap, count: 18, color: 'text-indigo-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tender data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Next
            <span className="text-yellow-300"> Business Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover government tenders and public procurement opportunities across Cameroon
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search tenders by title, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="text-gray-900 text-lg py-3"
              />
              <Button 
                onClick={handleSearch} 
                size="lg" 
                variant="secondary"
                className="px-8"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/tenders">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Browse All Tenders
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-blue-600">{stats.totalTenders}</CardTitle>
                <CardDescription>Total Tenders</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-8 w-8 mx-auto text-blue-600" />
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-green-600">{stats.activeTenders}</CardTitle>
                <CardDescription>Active Tenders</CardDescription>
              </CardHeader>
              <CardContent>
                <Clock className="h-8 w-8 mx-auto text-green-600" />
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-purple-600">
                  {(stats.totalValue / 1000000000).toFixed(1)}B
                </CardTitle>
                <CardDescription>Total Value (FCFA)</CardDescription>
              </CardHeader>
              <CardContent>
                <DollarSign className="h-8 w-8 mx-auto text-purple-600" />
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-orange-600">{stats.averageBids}</CardTitle>
                <CardDescription>Avg. Bids per Tender</CardDescription>
              </CardHeader>
              <CardContent>
                <Award className="h-8 w-8 mx-auto text-orange-600" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Tenders */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Tenders</h2>
            <Link to="/tenders">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(tender.status)}>
                      {tender.status}
                    </Badge>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{tender.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{formatBudget(tender.budget_min, tender.budget_max, tender.currency)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{tender.region}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{tender.bids_count} bids</span>
                    </div>
                    <Link to={`/tender/${tender.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={`/tenders?category=${encodeURIComponent(category.name)}`}
              >
                <Card className="text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <category.icon className={`h-8 w-8 mx-auto mb-3 ${category.color}`} />
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} tenders</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Tenders */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Tenders</h2>
            <Link to="/tenders">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{tender.category}</Badge>
                    <Badge className={getStatusColor(tender.status)}>
                      {tender.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{tender.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{formatBudget(tender.budget_min, tender.budget_max, tender.currency)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{tender.region}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{tender.bids_count} bids</span>
                    </div>
                    <Link to={`/tender/${tender.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TenderHomePage;