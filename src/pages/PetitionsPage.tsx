import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  AlertCircle,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { URLBuilder } from '@/utils/slug';
import { usePetitions } from '@/hooks/useCivicParticipation';
import { useAuth } from '@/contexts/AuthContext';
import { PetitionList } from '@/components/petitions/PetitionList';
import { PetitionSearchFilters } from '@/components/petitions/PetitionSearchFilters';
import { PetitionsSidebar } from '@/components/petitions/PetitionsSidebar';
import { FeaturedPetitions } from '@/components/petitions/FeaturedPetitions';
import { TrendingCategories } from '@/components/petitions/TrendingCategories';
import { toast } from 'sonner';

/**
 * Petitions listing page with search, filtering, and categories
 */
const PetitionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    region: 'all',
    status: 'all',
    sortBy: 'recent',
    minSignatures: 'all',
    timeframe: 'all'
  });

  // Get petitions based on active tab and filters
  const getQueryFilters = () => {
    const queryFilters: { status?: string; category?: string } = {};
    
    switch (activeTab) {
      case 'active':
        queryFilters.status = 'active';
        break;
      case 'successful':
        queryFilters.status = 'approved';
        break;
      case 'trending':
        queryFilters.status = 'active';
        break;
      case 'recent':
        queryFilters.status = 'active';
        break;
    }
    
    if (filters.category !== 'all') {
      queryFilters.category = filters.category;
    }
    
    return queryFilters;
  };

  const { data: petitions = [], isLoading, error } = usePetitions(getQueryFilters());

  // Stats query for displaying numbers
  const { data: activePetitions } = usePetitions({ status: 'active' });
  const { data: successfulPetitions } = usePetitions({ status: 'approved' });

  const handleStartPetition = () => {
    if (!user) {
      toast.error('Please log in to start a petition');
      navigate('/auth?redirect=' + encodeURIComponent(URLBuilder.petitions.create()));
      return;
    }
    // Navigate to create petition page
    navigate(URLBuilder.petitions.create());
  };

  // Calculate stats
  const totalActivePetitions = activePetitions?.length || 0;
  const totalSuccessfulPetitions = successfulPetitions?.length || 0;
  const totalSignatures = petitions?.reduce((sum, petition) => sum + (petition.current_signatures || 0), 0) || 0;

  return (
    <SidebarProvider collapsedWidth={64}>
      <div className="min-h-screen flex w-full bg-background">
        <PetitionsSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={{
            active: totalActivePetitions,
            trending: Math.floor(totalActivePetitions * 0.3),
            successful: totalSuccessfulPetitions,
            recent: Math.floor(totalActivePetitions * 0.4)
          }}
        />
        
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Petitions</h1>
                      <p className="text-sm text-muted-foreground">
                        Make your voice heard on issues that matter
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleStartPetition} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Start a Petition
              </Button>
            </div>
          </header>

          <div className="px-6 py-6 space-y-8 max-w-7xl">

            {/* Hero Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{totalActivePetitions}</div>
                  <p className="text-xs text-blue-600">Currently active</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Signatures</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{totalSignatures.toLocaleString()}</div>
                  <p className="text-xs text-green-600">Total voices</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Successful</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{totalSuccessfulPetitions}</div>
                  <p className="text-xs text-purple-600">Goals achieved</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impact</CardTitle>
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">
                    {totalSuccessfulPetitions > 0 ? Math.round((totalSuccessfulPetitions / totalActivePetitions) * 100) : 0}%
                  </div>
                  <p className="text-xs text-amber-600">Success rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Petitions */}
            <FeaturedPetitions className="mt-8" />

            {/* Trending Categories */}
            <TrendingCategories 
              className="mt-8"
              onCategorySelect={(category) => {
                setFilters(prev => ({ ...prev, category }));
                setActiveTab('active');
              }}
            />

            {/* Advanced Search and Filters */}
            <PetitionSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({
                searchQuery: '',
                category: 'all',
                region: 'all',
                status: 'all',
                sortBy: 'recent',
                minSignatures: 'all',
                timeframe: 'all'
              })}
              resultCount={petitions?.length}
            />

            {/* Petitions Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid grid-cols-4 w-auto">
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="successful" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Successful
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent
                  </TabsTrigger>
                </TabsList>
                
                <div className="text-sm text-muted-foreground">
                  {petitions?.length || 0} petitions found
                </div>
              </div>

              <TabsContent value="active" className="space-y-4">
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-16 bg-muted rounded" />
                              <div className="h-6 w-20 bg-muted rounded" />
                            </div>
                            <div className="h-6 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-2 bg-muted rounded w-full" />
                            <div className="h-10 bg-muted rounded w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Error Loading Petitions</h3>
                      <p className="text-muted-foreground">There was an error loading the petitions. Please try again later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <PetitionList 
                    category={filters.category !== 'all' ? filters.category : undefined}
                    searchQuery={filters.searchQuery}
                    limit={20}
                  />
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-16 bg-muted rounded" />
                              <div className="h-6 w-20 bg-muted rounded" />
                            </div>
                            <div className="h-6 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-2 bg-muted rounded w-full" />
                            <div className="h-10 bg-muted rounded w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <PetitionList 
                    category={filters.category !== 'all' ? filters.category : undefined}
                    searchQuery={filters.searchQuery}
                    limit={20}
                  />
                )}
              </TabsContent>

              <TabsContent value="successful" className="space-y-4">
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-16 bg-muted rounded" />
                              <div className="h-6 w-20 bg-muted rounded" />
                            </div>
                            <div className="h-6 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-2 bg-muted rounded w-full" />
                            <div className="h-10 bg-muted rounded w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <PetitionList 
                    category={filters.category !== 'all' ? filters.category : undefined}
                    searchQuery={filters.searchQuery}
                    limit={20}
                  />
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-16 bg-muted rounded" />
                              <div className="h-6 w-20 bg-muted rounded" />
                            </div>
                            <div className="h-6 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-2 bg-muted rounded w-full" />
                            <div className="h-10 bg-muted rounded w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <PetitionList 
                    category={filters.category !== 'all' ? filters.category : undefined}
                    searchQuery={filters.searchQuery}
                    limit={20}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PetitionsPage;