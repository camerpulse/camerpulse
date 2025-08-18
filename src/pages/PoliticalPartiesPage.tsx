import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigationMenu } from '@/components/Politicians/PoliticalNavigationMenu';
import { PoliticalPartyCard } from '@/components/Politicians/PoliticalPartyCard';
import { PoliticalFilters } from '@/components/Politicians/PoliticalFilters';
import { usePoliticalParties, usePoliticalStats } from '@/hooks/usePoliticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Grid3x3,
  List
} from 'lucide-react';

const PoliticalPartiesPage = () => {
  const [filters, setFilters] = useState({ is_active: true });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('approval_rating');

  const { data: parties, isLoading, error } = usePoliticalParties({
    ...filters,
    limit: 20,
    sortBy,
    sortOrder: 'desc',
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
            <h1 className="text-2xl font-bold mb-4">Error Loading Political Parties</h1>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Political Parties Directory - Cameroon Political Organizations | CamerPulse</title>
        <meta name="description" content="Comprehensive directory of political parties in Cameroon. Explore party platforms, leadership, membership, and electoral performance with detailed insights." />
        <meta name="keywords" content="Cameroon political parties, CPDM, SDF, UDC, party directory, political organizations, party platforms, electoral performance" />
        <link rel="canonical" href="https://camerpulse.com/political-parties" />
      </Helmet>
      
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <NavigationBreadcrumb 
            items={[
              { label: 'Politics', href: '/politics' },
              { label: 'Political Parties', href: '/political-parties' }
            ]} 
          />
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Political Parties</h1>
              <p className="text-muted-foreground">
                Explore Cameroon's political landscape and party structures
              </p>
            </div>
            
            <PoliticalNavigationMenu />
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Parties</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParties}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPoliticians}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all parties
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Office</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePoliticians}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently serving
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
                type="parties"
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
                      <SelectItem value="approval_rating">Approval Rating</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="mps_count">MPs Count</SelectItem>
                      <SelectItem value="founded_date">Founded Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {parties?.length || 0} parties found
                </div>
              </div>

              {/* Parties Grid/List */}
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded" />
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
              ) : parties && parties.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {parties.map((party) => (
                    <PoliticalPartyCard
                      key={party.id}
                      party={party}
                      showFullDetails={viewMode === 'list'}
                      showStats={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No political parties found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to find more parties.
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

export default PoliticalPartiesPage;