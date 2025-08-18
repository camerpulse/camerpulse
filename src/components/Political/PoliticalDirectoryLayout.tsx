import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { EnhancedPoliticalCard } from './EnhancedPoliticalCard';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  BarChart3,
  Users, 
  TrendingUp, 
  Award, 
  Shield,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';

interface PoliticalDirectoryLayoutProps {
  title: string;
  description: string;
  type: 'politician' | 'senator' | 'mp' | 'minister';
  data: any[];
  isLoading: boolean;
  error?: Error | null;
  onImport?: () => void;
  importLoading?: boolean;
  children?: React.ReactNode;
}

export const PoliticalDirectoryLayout: React.FC<PoliticalDirectoryLayoutProps> = ({
  title,
  description,
  type,
  data = [],
  isLoading,
  error,
  onImport,
  importLoading,
  children
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState('performance_score');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');

  // Extract filter options
  const regions = useMemo(() => 
    [...new Set(data.map(item => item.region).filter(Boolean))].sort(),
    [data]
  );
  
  const parties = useMemo(() => 
    [...new Set(data.map(item => item.political_party || item.party_affiliation).filter(Boolean))].sort(),
    [data]
  );

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const name = item.name || item.full_name || '';
      const position = item.position || item.office || '';
      const region = item.region || '';
      const party = item.political_party || item.party_affiliation || '';
      
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.constituency || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = filterRegion === 'all' || item.region === filterRegion;
      const matchesParty = filterParty === 'all' || 
        (item.political_party === filterParty || item.party_affiliation === filterParty);
      
      const performanceScore = item.performance_score || 0;
      const matchesPerformance = filterPerformance === 'all' ||
        (filterPerformance === 'high' && performanceScore >= 75) ||
        (filterPerformance === 'medium' && performanceScore >= 50 && performanceScore < 75) ||
        (filterPerformance === 'low' && performanceScore < 50);

      return matchesSearch && matchesRegion && matchesParty && matchesPerformance;
    });

    // Sort filtered data
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance_score':
          return (b.performance_score || 0) - (a.performance_score || 0);
        case 'transparency_score':
          return (b.transparency_score || 0) - (a.transparency_score || 0);
        case 'average_rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'name':
          const nameA = a.name || a.full_name || '';
          const nameB = b.name || b.full_name || '';
          return nameA.localeCompare(nameB);
        case 'bills_count':
          const billsA = a.bills_proposed_count || a.bills_passed_count || 0;
          const billsB = b.bills_proposed_count || b.bills_passed_count || 0;
          return billsB - billsA;
        default:
          return 0;
      }
    });
  }, [data, searchTerm, filterRegion, filterParty, filterPerformance, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = data.length;
    const highPerformers = data.filter(item => (item.performance_score || 0) >= 75).length;
    const highTransparency = data.filter(item => (item.transparency_score || 0) >= 75).length;
    const activeLegislators = data.filter(item => (item.bills_proposed_count || item.bills_passed_count || 0) > 0).length;
    const averageRating = data.reduce((sum, item) => sum + (item.average_rating || 0), 0) / total || 0;

    return {
      total,
      highPerformers,
      highTransparency,
      activeLegislators,
      averageRating: averageRating.toFixed(1),
      filtered: filteredData.length
    };
  }, [data, filteredData]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRegion('all');
    setFilterParty('all');
    setFilterPerformance('all');
    setSortBy('performance_score');
  };

  const hasActiveFilters = searchTerm || filterRegion !== 'all' || filterParty !== 'all' || filterPerformance !== 'all';

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading {title}</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-foreground to-secondary bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
        
        {onImport && (
          <div className="flex justify-center">
            <Button 
              onClick={onImport} 
              disabled={importLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {importLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Update Data
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Total {type === 'mp' ? 'MPs' : type === 'senator' ? 'Senators' : 'Ministers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.filtered} shown after filters
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              High Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highPerformers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.highPerformers / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              High Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.highTransparency}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.highTransparency / stats.total) * 100).toFixed(1)}% transparent
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-500" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-2xl font-bold text-purple-600">
              <Star className="h-5 w-5 mr-1 text-yellow-500" />
              {stats.averageRating}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLegislators} active legislators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Search & Filters
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type}s by name, position, region, or party...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance_score">Performance Score</SelectItem>
                    <SelectItem value="transparency_score">Transparency Score</SelectItem>
                    <SelectItem value="average_rating">Average Rating</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="bills_count">Bills Count</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterParty} onValueChange={setFilterParty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    {parties.map(party => (
                      <SelectItem key={party} value={party}>{party}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPerformance} onValueChange={setFilterPerformance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="high">High (75%+)</SelectItem>
                    <SelectItem value="medium">Medium (50-74%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                  Clear Filters
                </Button>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && <Badge variant="secondary">Search: {searchTerm}</Badge>}
                  {filterRegion !== 'all' && <Badge variant="secondary">Region: {filterRegion}</Badge>}
                  {filterParty !== 'all' && <Badge variant="secondary">Party: {filterParty}</Badge>}
                  {filterPerformance !== 'all' && <Badge variant="secondary">Performance: {filterPerformance}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <Badge variant="outline" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                {filteredData.length} of {data.length} {type}s
              </Badge>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-muted h-16 w-16" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {type}s found</h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters 
                    ? 'Try adjusting your search criteria or clearing filters'
                    : `No ${type}s are currently available in the directory`
                  }
                </p>
                {hasActiveFilters && (
                  <Button className="mt-4" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              viewMode === 'list' ? 'grid-cols-1' :
              'grid-cols-1 lg:grid-cols-2'
            }`}>
              {filteredData.map((item) => (
                <EnhancedPoliticalCard
                  key={item.id}
                  entity={item}
                  type={type}
                  variant={viewMode}
                  showActions={true}
                  showMetrics={viewMode !== 'compact'}
                  showContact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics and insights coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI-powered insights and recommendations coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {children}
    </div>
  );
};