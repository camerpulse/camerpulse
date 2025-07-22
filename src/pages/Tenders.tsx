import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TenderCard } from "@/components/Tenders/TenderCard";
import { TenderFilters } from "@/components/Tenders/TenderFilters";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  Building, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Award,
  Eye,
  Grid3X3,
  List,
  Construction,
  Computer,
  Leaf,
  Heart,
  Users2,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  tender_type: string;
  budget_min: number;
  budget_max: number;
  submission_deadline: string;
  status: string;
  published_by: string;
  bids_count: number;
  created_at: string;
}

interface FilterState {
  keyword: string;
  category: string;
  region: string;
  tenderType: string;
  status: string;
  budgetRange: [number, number];
  deadlineRange: string;
  publishingEntity: string;
}

const CATEGORY_ICONS = {
  'Construction': Construction,
  'ICT': Computer,
  'Agriculture': Leaf,
  'Medical': Heart,
  'NGO': Users2,
  'Government': Building2,
  'Education': Building,
  'Transportation': Building,
  'Energy': Building,
  'Environment': Leaf,
  'Finance': DollarSign,
  'Other': Building
};

export default function Tenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [stats, setStats] = useState({
    totalTenders: 0,
    totalBids: 0,
    avgBudget: 0,
    weeklyTenders: 0
  });

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    category: 'all',
    region: 'all', 
    tenderType: 'all',
    status: 'all',
    budgetRange: [0, 100000000],
    deadlineRange: 'all',
    publishingEntity: ''
  });

  const categories = [
    'Construction', 'ICT', 'Agriculture', 'Medical', 'NGO', 'Government',
    'Education', 'Transportation', 'Energy', 'Environment', 'Finance', 'Other'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North',
    'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchTenders();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenders, filters, sortBy]);

  const fetchTenders = async () => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to our interface, handling potential field name differences
      const mappedTenders: Tender[] = (data || []).map((tender: any) => ({
        id: tender.id,
        title: tender.title,
        description: tender.description,
        category: tender.category,
        region: tender.region,
        tender_type: tender.tender_type,
        budget_min: tender.budget_min,
        budget_max: tender.budget_max,
        submission_deadline: tender.submission_deadline || tender.deadline || '',
        status: tender.status,
        published_by: tender.published_by || '',
        bids_count: tender.bids_count || 0,
        created_at: tender.created_at
      }));
      
      setTenders(mappedTenders);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast.error('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total tenders and total bids
      const { data: tendersData } = await supabase
        .from('tenders')
        .select('bids_count, budget_min, budget_max, created_at');

      if (tendersData) {
        const totalBids = tendersData.reduce((sum, tender) => sum + (tender.bids_count || 0), 0);
        const avgBudget = tendersData.reduce((sum, tender) => sum + ((tender.budget_min + tender.budget_max) / 2), 0) / tendersData.length;
        
        // Count tenders from this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyTenders = tendersData.filter(tender => 
          new Date(tender.created_at) >= oneWeekAgo
        ).length;

        setStats({
          totalTenders: tendersData.length,
          totalBids,
          avgBudget: avgBudget || 0,
          weeklyTenders
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    // Apply keyword filter
    if (filters.keyword) {
      filtered = filtered.filter(tender =>
        tender.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        tender.description.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(tender => tender.category === filters.category);
    }

    // Apply region filter
    if (filters.region && filters.region !== 'all') {
      filtered = filtered.filter(tender => tender.region === filters.region);
    }

    // Apply tender type filter
    if (filters.tenderType && filters.tenderType !== 'all') {
      filtered = filtered.filter(tender => tender.tender_type === filters.tenderType);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(tender => tender.status === filters.status);
    }

    // Apply budget range filter
    filtered = filtered.filter(tender => {
      const avgBudget = (tender.budget_min + tender.budget_max) / 2;
      return avgBudget >= filters.budgetRange[0] && avgBudget <= filters.budgetRange[1];
    });

    // Apply deadline range filter
    if (filters.deadlineRange) {
      const today = new Date();
      filtered = filtered.filter(tender => {
        if (!tender.submission_deadline) return false;
        const deadline = new Date(tender.submission_deadline);
        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.deadlineRange) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7 && diffDays >= 0;
          case 'month': return diffDays <= 30 && diffDays >= 0;
          case 'quarter': return diffDays <= 90 && diffDays >= 0;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'submission_deadline':
          if (!a.submission_deadline || !b.submission_deadline) return 0;
          return new Date(a.submission_deadline).getTime() - new Date(b.submission_deadline).getTime();
        case 'budget_max':
          return b.budget_max - a.budget_max;
        case 'budget_min':
          return a.budget_min - b.budget_min;
        case 'bids_count':
          return b.bids_count - a.bids_count;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredTenders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: 'all',
      region: 'all',
      tenderType: 'all',
      status: 'all',
      budgetRange: [0, 100000000],
      deadlineRange: 'all',
      publishingEntity: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.region && filters.region !== 'all') count++;
    if (filters.tenderType && filters.tenderType !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.deadlineRange && filters.deadlineRange !== 'all') count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 100000000) count++;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  // Get featured tenders (for now, just the most recent ones with highest bids)
  const featuredTenders = tenders
    .filter(t => t.status === 'active')
    .sort((a, b) => b.bids_count - a.bids_count)
    .slice(0, 3);

  // Get upcoming deadlines (tenders closing within 7 days)
  const upcomingDeadlines = tenders
    .filter(t => {
      if (!t.submission_deadline) return false;
      const deadline = new Date(t.submission_deadline);
      const today = new Date();
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0 && t.status === 'active';
    })
    .sort((a, b) => new Date(a.submission_deadline).getTime() - new Date(b.submission_deadline).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CamerTenders</h1>
            <p className="text-gray-600">Discover and apply for public procurement opportunities across Cameroon</p>
          </div>
          <Link to="/tenders/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post a Tender
            </Button>
          </Link>
        </div>

        {/* Statistics Widget */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tenders</p>
                  <p className="text-xl font-bold">{stats.totalTenders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-xl font-bold">{stats.totalBids}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Budget</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.avgBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-xl font-bold">{stats.weeklyTenders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tender Categories Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category] || Building;
                const categoryCount = tenders.filter(t => t.category === category).length;
                
                return (
                  <button
                    key={category}
                    onClick={() => setFilters(prev => ({ ...prev, category }))}
                    className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg mb-2 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-center">{category}</span>
                    <span className="text-xs text-muted-foreground">{categoryCount} tenders</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Tenders */}
        {featuredTenders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Featured Tenders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredTenders.map((tender) => (
                  <TenderCard key={tender.id} tender={tender} variant="grid" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Closing Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((tender) => {
                  const daysRemaining = Math.ceil((new Date(tender.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={tender.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link to={`/tenders/${tender.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                          {tender.title}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {tender.region}
                          </span>
                          <span>{tender.category}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant={daysRemaining <= 1 ? 'destructive' : daysRemaining <= 3 ? 'secondary' : 'outline'}>
                          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <TenderFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {filteredTenders.length} tender{filteredTenders.length !== 1 ? 's' : ''} found
                {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()} filter${getActiveFiltersCount() !== 1 ? 's' : ''} applied)`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="submission_deadline">Closing Soon</SelectItem>
                  <SelectItem value="budget_max">Budget: High to Low</SelectItem>
                  <SelectItem value="budget_min">Budget: Low to High</SelectItem>
                  <SelectItem value="bids_count">Most Competitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tender Listings */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
              <p className="text-gray-600 mb-6">
                {getActiveFiltersCount() > 0 
                  ? 'Try adjusting your filters to find more opportunities.'
                  : 'Check back later for new opportunities.'
                }
              </p>
              {getActiveFiltersCount() > 0 ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link to="/create-tender">
                  <Button>Post the First Tender</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredTenders.map((tender) => (
                <TenderCard 
                  key={tender.id} 
                  tender={tender} 
                  variant={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}