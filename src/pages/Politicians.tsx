import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigationMenu } from '@/components/Politicians/PoliticalNavigationMenu';
import { PoliticianCard } from '@/components/Politicians/PoliticianCard';
import { PoliticalFilters } from '@/components/Politicians/PoliticalFilters';
import { usePoliticians, usePoliticalStats } from '@/hooks/usePoliticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Grid3x3,
  List
} from 'lucide-react';

const Politicians = () => {
  const [filters, setFilters] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('performance_score');

  const { data: politicians, isLoading, error } = usePoliticians({
    ...filters,
    limit: 20,
  });

  const { data: stats } = usePoliticalStats();

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Politicians</h1>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Politicians Directory - Cameroon Political Representatives | CamerPulse</title>
        <meta name="description" content="Discover, evaluate and connect with Cameroon's political leaders. Browse politicians by region, party, and office level with transparency ratings and performance scores." />
        <meta name="keywords" content="Cameroon politicians, political representatives, MPs, senators, ministers, political directory, transparency ratings" />
        <link rel="canonical" href="https://camerpulse.com/politicians" />
      </Helmet>
      
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <NavigationBreadcrumb 
            items={[
              { label: 'Politics', href: '/politics' },
              { label: 'Politicians', href: '/politicians' }
            ]} 
          />
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Politicians Directory</h1>
              <p className="text-muted-foreground">
                Discover and connect with Cameroon's political leaders
              </p>
            </div>
            
            <PoliticalNavigationMenu />
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPoliticians}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently in our database
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active in Office</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePoliticians}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently serving
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Political Parties</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParties}</div>
                  <p className="text-xs text-muted-foreground">
                    Active parties
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <PoliticalFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                type="politicians"
                showAdvanced={showAdvancedFilters}
                onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
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
                  </div>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance_score">Performance Score</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="transparency_rating">Transparency</SelectItem>
                      <SelectItem value="integrity_rating">Integrity</SelectItem>
                      <SelectItem value="follower_count">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {politicians?.length || 0} politicians found
                </div>
              </div>

              {/* Politicians Grid/List */}
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : politicians && politicians.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {politicians.map((politician) => (
                    <PoliticianCard
                      key={politician.id}
                      politician={politician}
                      showFullDetails={viewMode === 'list'}
                      showRating={true}
                      showFollow={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No politicians found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to find more politicians.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default Politicians;