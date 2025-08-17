import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Users, 
  Star, 
  Search, 
  Filter,
  Eye,
  TrendingUp,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useVillages } from '@/hooks/useVillages';
import { LoadingSpinner, CardSkeleton } from '@/components/LoadingSpinner';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveComponents';
import { useNavigation } from '@/hooks/useNavigation';

export const VillageRegistry: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('overall_rating');

  const { data: villages, isLoading, error } = useVillages();
  const { data: stats } = useVillages(); // This should come from useVillageStats

  // Filter and sort villages
  const filteredVillages = React.useMemo(() => {
    if (!villages) return [];
    
    return villages
      .filter(village => {
        const matchesSearch = !searchTerm || 
          village.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          village.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          village.division.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRegion = !selectedRegion || village.region === selectedRegion;
        
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'overall_rating':
            return b.overall_rating - a.overall_rating;
          case 'population':
            return (b.population_estimate || 0) - (a.population_estimate || 0);
          case 'view_count':
            return b.view_count - a.view_count;
          case 'name':
            return a.village_name.localeCompare(b.village_name);
          default:
            return 0;
        }
      });
  }, [villages, searchTerm, selectedRegion, sortBy]);

  // Get unique regions for filter
  const regions = React.useMemo(() => {
    if (!villages) return [];
    return [...new Set(villages.map(v => v.region))].sort();
  }, [villages]);

  if (error) {
    return (
      <ResponsiveContainer>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading villages: {error.message}
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Village Registry</h1>
          <p className="text-muted-foreground">
            Explore and discover villages across Cameroon
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Villages</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{villages?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Villages</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">
                  {villages?.filter(v => v.is_verified).length || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Population</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">
                  {villages?.reduce((sum, v) => sum + (v.population_estimate || 0), 0).toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">
                  {villages && villages.length > 0 
                    ? (villages.reduce((sum, v) => sum + v.overall_rating, 0) / villages.length).toFixed(1)
                    : '0.0'
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search villages by name, region, or division..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="overall_rating">Rating</option>
                  <option value="population">Population</option>
                  <option value="view_count">Views</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Villages Grid */}
        {isLoading ? (
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
        ) : (
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
            {filteredVillages.map((village) => (
              <Card key={village.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {village.village_name}
                        {village.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {village.division}, {village.region}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="text-sm font-medium">
                        {village.overall_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{village.population_estimate?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{village.view_count} views</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Infrastructure</span>
                        <span>{village.infrastructure_score}/10</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${village.infrastructure_score * 10}%` }}
                        />
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigateTo(`/villages/${village.village_name.toLowerCase().replace(/\s+/g, '-')}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}

        {/* No Results */}
        {!isLoading && filteredVillages.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};