import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Flag, TrendingUp, Calendar, MapPin, Award } from 'lucide-react';
import { usePaginatedPoliticians, usePaginatedParties } from '@/hooks/usePaginatedQuery';
import { PoliticalErrorBoundary } from '@/components/Political/ErrorBoundary';
import { PoliticalFilters } from '@/components/Political/PoliticalFilters';
import { PoliticalBreadcrumbs } from '@/components/Political/PoliticalBreadcrumbs';
import { PoliticianCardSkeleton, PartyCardSkeleton, EmptyState } from '@/components/Political/LoadingStates';
import { Link } from 'react-router-dom';
import { normalizeRole, getRegionDisplayName, getPerformanceColor } from '@/utils/politicalUtils';

interface FilterState {
  search: string;
  region: string;
  role: string;
  party: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialFilters: FilterState = {
  search: '',
  region: 'all',
  role: 'all',
  party: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export default function PoliticalDashboard() {
  const [activeTab, setActiveTab] = useState('politicians');
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Fetch data with pagination
  const politiciansQuery = usePaginatedPoliticians(
    {
      search: filters.search,
      region: filters.region === 'all' ? undefined : filters.region,
      role: filters.role === 'all' ? undefined : filters.role,
    },
    { field: filters.sortBy, order: filters.sortOrder },
    { pageSize: 20 }
  );

  const partiesQuery = usePaginatedParties(
    {
      search: filters.search,
    },
    { field: filters.sortBy, order: filters.sortOrder },
    { pageSize: 20 }
  );

  // Stats calculation
  const stats = useMemo(() => {
    const politicians = politiciansQuery.data?.data || [];
    const parties = partiesQuery.data?.data || [];

    return {
      totalPoliticians: politiciansQuery.data?.count || 0,
      totalParties: partiesQuery.data?.count || 0,
      averageRating: politicians.length > 0 
        ? politicians.reduce((sum, p) => sum + (p.performance_score || 0), 0) / politicians.length 
        : 0,
      regionsRepresented: [...new Set(politicians.map(p => p.region).filter(Boolean))].length
    };
  }, [politiciansQuery.data, partiesQuery.data]);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleFiltersReset = () => {
    setFilters(initialFilters);
  };

  const breadcrumbItems = [
    { label: 'Political System', href: '/political-dashboard' },
    { label: activeTab === 'politicians' ? 'Politicians' : 'Political Parties' }
  ];

  return (
    <>
      <Helmet>
        <title>Political Dashboard - CamerPulse | Cameroon's Political Landscape</title>
        <meta name="description" content="Comprehensive political dashboard featuring Cameroon's politicians, political parties, and civic representatives. Track performance, ratings, and regional representation." />
        <meta name="keywords" content="Cameroon politics, politicians, political parties, civic engagement, government officials" />
        <link rel="canonical" href="/political-dashboard" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Political Dashboard - CamerPulse" />
        <meta property="og:description" content="Explore Cameroon's political landscape with comprehensive data on politicians and political parties." />
        <meta property="og:type" content="website" />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Political Dashboard",
            "description": "Comprehensive political dashboard for Cameroon",
            "url": "/political-dashboard",
            "mainEntity": {
              "@type": "GovernmentOrganization",
              "name": "Cameroon Political System",
              "description": "Overview of political parties and officials in Cameroon"
            }
          })}
        </script>
      </Helmet>

      <AppLayout>
        <PoliticalErrorBoundary>
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <PoliticalBreadcrumbs items={breadcrumbItems} />
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Political Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive overview of Cameroon's political landscape
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPoliticians.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all levels of government
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Political Parties</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParties}</div>
                  <p className="text-xs text-muted-foreground">
                    Active political organizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/10</div>
                  <p className="text-xs text-muted-foreground">
                    Based on citizen ratings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regions Covered</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.regionsRepresented}/10</div>
                  <p className="text-xs text-muted-foreground">
                    Cameroon regions represented
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <PoliticalFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleFiltersReset}
                  showPartyFilter={activeTab === 'politicians'}
                  showStatusFilter={activeTab === 'politicians'}
                  resultCount={activeTab === 'politicians' ? stats.totalPoliticians : stats.totalParties}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="politicians" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Politicians
                    </TabsTrigger>
                    <TabsTrigger value="parties" className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Political Parties
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="politicians" className="mt-6">
                    {politiciansQuery.isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <PoliticianCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : politiciansQuery.error ? (
                      <EmptyState
                        title="Failed to Load Politicians"
                        description="There was an error loading the politicians data. Please try again."
                        icon={<Users className="w-12 h-12" />}
                        action={
                          <Button onClick={() => politiciansQuery.refetch()}>
                            Try Again
                          </Button>
                        }
                      />
                    ) : !politiciansQuery.data?.data.length ? (
                      <EmptyState
                        title="No Politicians Found"
                        description="No politicians match your current search criteria. Try adjusting your filters."
                        icon={<Users className="w-12 h-12" />}
                        action={
                          <Button onClick={handleFiltersReset}>
                            Clear Filters
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {politiciansQuery.data.data.map((politician) => (
                          <Card key={politician.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4">
                              <img
                                src={politician.profile_image_url || '/placeholder.svg'}
                                alt={politician.name}
                                className="w-16 h-16 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1">
                                <Link 
                                  to={URLBuilder.politicians.detail({
                                    id: politician.id,
                                    name: politician.name
                                  })}
                                  className="text-lg font-semibold hover:text-primary transition-colors"
                                >
                                  {politician.name}
                                </Link>
                                <p className="text-muted-foreground">
                                  {normalizeRole(politician.role_title, politician.level_of_office)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {getRegionDisplayName(politician.region)}
                                </p>
                              </div>
                              <div className="text-right">
                                {politician.performance_score && (
                                  <Badge 
                                    variant="outline" 
                                    className={getPerformanceColor(politician.performance_score)}
                                  >
                                    {politician.performance_score}/10
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="parties" className="mt-6">
                    {partiesQuery.isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <PartyCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : partiesQuery.error ? (
                      <EmptyState
                        title="Failed to Load Parties"
                        description="There was an error loading the political parties data. Please try again."
                        icon={<Flag className="w-12 h-12" />}
                        action={
                          <Button onClick={() => partiesQuery.refetch()}>
                            Try Again
                          </Button>
                        }
                      />
                    ) : !partiesQuery.data?.data.length ? (
                      <EmptyState
                        title="No Political Parties Found"
                        description="No political parties match your current search criteria. Try adjusting your filters."
                        icon={<Flag className="w-12 h-12" />}
                        action={
                          <Button onClick={handleFiltersReset}>
                            Clear Filters
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {partiesQuery.data.data.map((party) => (
                          <Card key={party.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4">
                              <img
                                src={party.logo_url || '/placeholder.svg'}
                                alt={`${party.name} logo`}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1">
                                <Link 
                                  to={`/political-parties/${party.slug || party.id}`}
                                  className="text-lg font-semibold hover:text-primary transition-colors"
                                >
                                  {party.name}
                                </Link>
                                <p className="text-muted-foreground">
                                  {party.acronym} • Founded {party.founded_year || 'Unknown'}
                                </p>
                                {party.president_name && (
                                  <p className="text-sm text-muted-foreground">
                                    Led by {party.president_name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">
                                  {party.ideology || 'Unknown ideology'}
                                </Badge>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </PoliticalErrorBoundary>
      </AppLayout>
    </>
  );
}