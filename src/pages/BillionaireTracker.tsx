import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Crown, TrendingUp, TrendingDown, Minus, Search, Filter, Share2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Billionaire {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  company_affiliation?: string;
  wealth_source: string;
  verified_net_worth_fcfa: number;
  net_worth_usd: number;
  region: string;
  biography?: string;
  current_rank?: number;
  previous_rank?: number;
  year_on_year_change?: number;
  profile_views: number;
  is_anonymous: boolean;
  display_alias?: string;
  created_at: string;
}

interface BillionaireStats {
  total_billionaires: number;
  total_wealth_fcfa: number;
  total_wealth_usd: number;
  pending_applications: number;
}

const BillionaireTracker = () => {
  const [billionaires, setBillionaires] = useState<Billionaire[]>([]);
  const [stats, setStats] = useState<BillionaireStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('net_worth');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch billionaires
      const { data: billionairesData, error: billionairesError } = await supabase
        .from('billionaires')
        .select('*')
        .eq('is_verified', true)
        .order('verified_net_worth_fcfa', { ascending: false });

      if (billionairesError) {
        toast({
          title: "Error",
          description: "Failed to fetch billionaires data",
          variant: "destructive"
        });
        return;
      }

      setBillionaires(billionairesData || []);

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_billionaire_stats');

      if (!statsError && statsData && typeof statsData === 'object') {
        setStats(statsData as unknown as BillionaireStats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: 'FCFA' | 'USD' = 'FCFA') => {
    if (currency === 'FCFA') {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const getWealthSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      'technology': '🌐',
      'oil_gas': '🛢️',
      'real_estate': '🏘️',
      'banking_finance': '💼',
      'agriculture': '🌾',
      'mining': '⛏️',
      'telecommunications': '📡',
      'manufacturing': '🏭',
      'retail_trade': '🛍️',
      'construction': '🏗️',
      'entertainment': '🎬',
      'healthcare': '🏥',
      'logistics': '🚛',
      'other': '💼'
    };
    return icons[source] || '💼';
  };

  const getRankChangeIcon = (current?: number, previous?: number) => {
    if (!current || !previous) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current < previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current > previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const filteredBillionaires = billionaires.filter(billionaire => {
    const matchesSearch = billionaire.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billionaire.company_affiliation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || billionaire.region === filterRegion;
    const matchesSource = filterSource === 'all' || billionaire.wealth_source === filterSource;
    
    return matchesSearch && matchesRegion && matchesSource;
  });

  const sortedBillionaires = [...filteredBillionaires].sort((a, b) => {
    switch (sortBy) {
      case 'net_worth':
        return b.verified_net_worth_fcfa - a.verified_net_worth_fcfa;
      case 'views':
        return b.profile_views - a.profile_views;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      default:
        return 0;
    }
  });

  const handleShare = (billionaire: Billionaire) => {
    const url = `${window.location.origin}/billionaires/${billionaire.id}`;
    const text = `Check out ${billionaire.is_anonymous ? billionaire.display_alias : billionaire.full_name} on CamerPulse Billionaire Tracker - Ranked #${billionaire.current_rank} with ${formatCurrency(billionaire.verified_net_worth_fcfa)} net worth`;
    
    if (navigator.share) {
      navigator.share({ title: 'CamerPulse Billionaire', text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800">Loading billionaire data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="h-12 w-12 text-amber-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Cameroon Billionaire Tracker
              </h1>
            </div>
            <p className="text-xl text-amber-800 mb-2">
              The Premier Ranking of Cameroon's Wealthiest Individuals
            </p>
            <Badge variant="outline" className="border-amber-600 text-amber-600">
              ✓ Verified by CamerPulse Intelligence
            </Badge>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-700">
                      {stats.total_billionaires}
                    </div>
                    <p className="text-amber-600">Verified Billionaires</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-700">
                      {formatCurrency(stats.total_wealth_fcfa)}
                    </div>
                    <p className="text-amber-600">Combined Wealth</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-700">
                      {formatCurrency(stats.total_wealth_usd, 'USD')}
                    </div>
                    <p className="text-amber-600">USD Equivalent</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
                <CardContent className="pt-6 text-center">
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link to="/billionaires/apply">Apply to Join</Link>
                  </Button>
                  <p className="text-green-600 text-sm mt-2">Premium Placement</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="mb-8 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Douala">Douala</SelectItem>
                    <SelectItem value="Yaoundé">Yaoundé</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="Far North">Far North</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="oil_gas">Oil & Gas</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="banking_finance">Banking & Finance</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="mining">Mining</SelectItem>
                    <SelectItem value="telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net_worth">Net Worth</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Billionaires List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBillionaires.map((billionaire, index) => (
              <Card key={billionaire.id} className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50 border-amber-200 hover:border-amber-400">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-2xl font-bold text-white">
                          {billionaire.current_rank || index + 1}
                        </div>
                        {billionaire.current_rank === 1 && (
                          <Crown className="absolute -top-2 -right-2 h-6 w-6 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {billionaire.is_anonymous ? billionaire.display_alias : billionaire.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{billionaire.company_affiliation}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{getWealthSourceIcon(billionaire.wealth_source)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {billionaire.wealth_source.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getRankChangeIcon(billionaire.current_rank, billionaire.previous_rank)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-amber-700">
                        {formatCurrency(billionaire.verified_net_worth_fcfa)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(billionaire.net_worth_usd, 'USD')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">📍 {billionaire.region}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{billionaire.profile_views}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to={`/billionaires/${billionaire.id}`}>View Profile</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(billionaire)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBillionaires.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-xl text-muted-foreground mb-4">No billionaires found matching your criteria</p>
                <Button asChild>
                  <Link to="/billionaires/apply">Be the first to apply</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BillionaireTracker;