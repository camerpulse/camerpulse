import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  Filter,
  AlertCircle
} from 'lucide-react';
import { URLBuilder } from '@/utils/slug';
import { usePetitions } from '@/hooks/useCivicParticipation';
import { useAuth } from '@/utils/auth';
import { PetitionList } from '@/components/petitions/PetitionList';
import { PetitionSearchFilters } from '@/components/petitions/PetitionSearchFilters';
import { toast } from 'sonner';

/**
 * Petitions listing page with search, filtering, and categories
 */
const PetitionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      toast.error('Please log in to start a petition');
      return;
    }
    // Navigate to create petition page
    window.location.href = URLBuilder.petitions.create();
  };

  // Calculate stats
  const totalActivePetitions = activePetitions?.length || 0;
  const totalSuccessfulPetitions = successfulPetitions?.length || 0;
  const totalSignatures = petitions?.reduce((sum, petition) => sum + (petition.current_signatures || 0), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Petitions</h1>
          <p className="text-muted-foreground">
            Make your voice heard on issues that matter to your community
          </p>
        </div>
        <Button onClick={handleStartPetition}>
          <Plus className="w-4 h-4 mr-2" />
          Start a Petition
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Petitions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePetitions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignatures.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all petitions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuccessfulPetitions}</div>
            <p className="text-xs text-muted-foreground">
              Goals achieved
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Petitions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="successful">Successful</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
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
  );
};

export default PetitionsPage;