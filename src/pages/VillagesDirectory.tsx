
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  BarChart3,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { useVillages, useVillagesByRegion, useSearchVillages } from '@/hooks/useVillages';
import { VillageCard } from '@/components/villages/VillageCard';
import { VillageAnalytics } from '@/components/villages/VillageAnalytics';
import { VillageRankingPanel } from '@/components/villages/VillageRankingPanel';

interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  population_estimate: number | null;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  peace_security_score: number;
  economic_activity_score: number;
  governance_score: number;
  social_spirit_score: number;
  diaspora_engagement_score: number;
  civic_participation_score: number;
  achievements_score: number;
  total_ratings_count: number;
  created_at: string;
  updated_at: string;
}

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const FILTER_CATEGORIES = [
  { id: 'rating', label: 'Highest Rated', field: 'overall_rating' },
  { id: 'popular', label: 'Most Popular', field: 'view_count' },
  { id: 'community', label: 'Largest Community', field: 'sons_daughters_count' },
  { id: 'infrastructure', label: 'Best Infrastructure', field: 'infrastructure_score' },
  { id: 'education', label: 'Best Education', field: 'education_score' },
  { id: 'governance', label: 'Best Governance', field: 'governance_score' },
  { id: 'diaspora', label: 'Diaspora Engaged', field: 'diaspora_engagement_score' },
  { id: 'recent', label: 'Recently Added', field: 'created_at' }
];

const VIEW_MODES = [
  { id: 'grid', label: 'Grid View', icon: Grid3X3 },
  { id: 'list', label: 'List View', icon: List }
];

const VillagesDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [filterCategory, setFilterCategory] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('directory');
  
  const itemsPerPage = 12;

  const { data: allVillages, isLoading: allLoading } = useVillages();
  const { data: regionVillages, isLoading: regionLoading } = useVillagesByRegion(
    selectedRegion !== 'all' ? selectedRegion : undefined
  );
  const { data: searchResults, isLoading: searchLoading } = useSearchVillages(searchQuery);

  const isLoading = allLoading || regionLoading || searchLoading;

  const filteredAndSortedVillages = useMemo(() => {
    try {
      let villages = allVillages || [];

      // Use search results if searching
      if (searchQuery.trim()) {
        villages = searchResults || [];
      } else {
        // Use region-specific data if region is selected
        if (selectedRegion && selectedRegion !== 'all' && regionVillages) {
          villages = regionVillages;
        }
      }

      // Apply verified filter
      if (showVerifiedOnly) {
        villages = villages.filter(v => v.is_verified);
      }

      // Apply category sorting
      if (filterCategory && filterCategory !== 'default') {
        const category = FILTER_CATEGORIES.find(cat => cat.id === filterCategory);
        if (category) {
          villages.sort((a, b) => {
            const aValue = category.field === 'created_at' 
              ? new Date(a[category.field]).getTime()
              : (a[category.field as keyof Village] as number) || 0;
            const bValue = category.field === 'created_at'
              ? new Date(b[category.field]).getTime()
              : (b[category.field as keyof Village] as number) || 0;
            
            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          });
        }
      } else {
        // Default sort by overall rating
        villages.sort((a, b) => {
          const aValue = a.overall_rating || 0;
          const bValue = b.overall_rating || 0;
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
      }

      return villages;
    } catch (error) {
      console.error('Error filtering villages:', error);
      return [];
    }
  }, [allVillages, regionVillages, searchResults, searchQuery, selectedRegion, filterCategory, sortOrder, showVerifiedOnly]);

  const paginatedVillages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedVillages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedVillages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedVillages.length / itemsPerPage);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setFilterCategory('default');
    setShowVerifiedOnly(false);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedRegion !== 'all') count++;
    if (filterCategory !== 'default') count++;
    if (showVerifiedOnly) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            Villages Directory
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore and discover villages across Cameroon with comprehensive insights and rankings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search & Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary">
                        {getActiveFiltersCount()} active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      disabled={getActiveFiltersCount() === 0}
                    >
                      Clear All
                    </Button>
                    <div className="flex border rounded-md">
                      {VIEW_MODES.map((mode) => {
                        const Icon = mode.icon;
                        return (
                          <Button
                            key={mode.id}
                            variant={viewMode === mode.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode(mode.id as 'grid' | 'list')}
                            className="rounded-none first:rounded-l-md last:rounded-r-md"
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search villages..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {REGIONS.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Order</SelectItem>
                      {FILTER_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSortOrder}
                      className="flex-1"
                    >
                      {sortOrder === 'desc' ? (
                        <SortDesc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortAsc className="h-4 w-4 mr-2" />
                      )}
                      Sort
                    </Button>
                    <Button
                      variant={showVerifiedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                    >
                      Verified
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedVillages.length} of {filteredAndSortedVillages.length} villages
                </p>
                {isLoading && (
                  <Badge variant="secondary" className="animate-pulse">
                    Loading...
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Village Grid/List */}
            {isLoading ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-12 bg-muted animate-pulse rounded"></div>
                          <div className="h-12 bg-muted animate-pulse rounded"></div>
                          <div className="h-12 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="h-8 bg-muted animate-pulse rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {paginatedVillages.map((village, index) => (
                  <VillageCard
                    key={village.id}
                    village={village}
                    rank={(currentPage - 1) * itemsPerPage + index + 1}
                    showRank={filterCategory !== 'default'}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    totalPages - 4,
                    currentPage - 2
                  )) + i;
                  
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <VillageAnalytics />
          </TabsContent>

          <TabsContent value="rankings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VillageRankingPanel />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">9.2</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-xs text-muted-foreground">Verified</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillagesDirectory;
