import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  MapPin,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { usePoliticalEntitiesWithParties } from '@/hooks/usePoliticalEntityRelations';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigationMenu } from '@/components/Politicians/PoliticalNavigationMenu';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UnifiedPoliticalDirectoryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<string>('all');
  const [partyFilter, setPartyFilter] = React.useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('rating');

  const { data: entities, isLoading, error } = usePoliticalEntitiesWithParties();

  // Extract unique values for filters
  const regions = React.useMemo(() => {
    if (!entities) return [];
    return [...new Set(entities.filter(e => e.region).map(e => e.region))].sort();
  }, [entities]);

  const parties = React.useMemo(() => {
    if (!entities) return [];
    return [...new Set(entities.filter(e => e.political_party?.name).map(e => e.political_party!.name))].sort();
  }, [entities]);

  // Filter and sort entities
  const filteredEntities = React.useMemo(() => {
    if (!entities) return [];

    let filtered = entities.filter(entity => {
      const matchesSearch = 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.political_party?.name && entity.political_party.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRegion = regionFilter === 'all' || entity.region === regionFilter;
      const matchesParty = partyFilter === 'all' || entity.political_party?.name === partyFilter;
      const matchesType = entityTypeFilter === 'all' || entity.entity_type === entityTypeFilter;

      return matchesSearch && matchesRegion && matchesParty && matchesType;
    });

    // Sort entities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'party':
          return (a.political_party?.name || '').localeCompare(b.political_party?.name || '');
        case 'region':
          return (a.region || '').localeCompare(b.region || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [entities, searchTerm, regionFilter, partyFilter, entityTypeFilter, sortBy]);

  const getEntityPath = (entity: any) => {
    switch (entity.entity_type) {
      case 'senator':
        return `/senators/${entity.id}`;
      case 'minister':
        return `/ministers/${entity.id}`;
      case 'mp':
        return `/mps/${entity.id}`;
      case 'politician':
        return `/politicians/${entity.id}`;
      default:
        return '#';
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'senator':
        return 'Senator';
      case 'minister':
        return 'Minister';
      case 'mp':
        return 'MP';
      case 'politician':
        return 'Politician';
      default:
        return type;
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'senator':
        return 'bg-blue-100 text-blue-800';
      case 'minister':
        return 'bg-green-100 text-green-800';
      case 'mp':
        return 'bg-purple-100 text-purple-800';
      case 'politician':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get summary statistics
  const stats = React.useMemo(() => {
    if (!entities) return { total: 0, senators: 0, ministers: 0, mps: 0, politicians: 0, withParties: 0 };
    
    return {
      total: entities.length,
      senators: entities.filter(e => e.entity_type === 'senator').length,
      ministers: entities.filter(e => e.entity_type === 'minister').length,
      mps: entities.filter(e => e.entity_type === 'mp').length,
      politicians: entities.filter(e => e.entity_type === 'politician').length,
      withParties: entities.filter(e => e.political_party_id).length,
    };
  }, [entities]);

  if (isLoading) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Directory', href: '/political-directory' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading political directory...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Directory', href: '/political-directory' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Directory</h1>
            <p className="text-muted-foreground">
              There was an error loading the political directory. Please try again later.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <NavigationBreadcrumb 
        items={[
          { label: 'Politics', href: '/politics' },
          { label: 'Political Directory', href: '/political-directory' }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <PoliticalNavigationMenu />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Unified Political Directory</h1>
          <p className="text-muted-foreground mb-6">
            Complete directory of all political figures in Cameroon with their party affiliations and cross-references.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Senators</p>
                    <p className="text-2xl font-bold">{stats.senators}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ministers</p>
                    <p className="text-2xl font-bold">{stats.ministers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">MPs</p>
                    <p className="text-2xl font-bold">{stats.mps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Politicians</p>
                    <p className="text-2xl font-bold">{stats.politicians}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">With Parties</p>
                    <p className="text-2xl font-bold">{stats.withParties}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, position, or party..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="senator">Senators</SelectItem>
                  <SelectItem value="minister">Ministers</SelectItem>
                  <SelectItem value="mp">MPs</SelectItem>
                  <SelectItem value="politician">Politicians</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Political Party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {parties.map(party => (
                    <SelectItem key={party} value={party}>{party}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="party">Political Party</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredEntities.length} of {entities?.length || 0} political figures
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <Link key={`${entity.entity_type}-${entity.id}`} to={getEntityPath(entity)}>
                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={entity.profile_picture_url} alt={entity.name} />
                        <AvatarFallback className="text-lg">
                          {entity.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg leading-tight truncate">
                            {entity.name}
                          </h3>
                          {entity.is_verified && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <Badge className={`text-xs mb-2 ${getEntityTypeColor(entity.entity_type)}`}>
                          {getEntityTypeLabel(entity.entity_type)}
                        </Badge>
                        
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {entity.position}
                        </p>
                        
                        {entity.region && (
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {entity.region}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {entity.political_party && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Party</span>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {entity.political_party.logo_url && (
                              <img 
                                src={entity.political_party.logo_url} 
                                alt={entity.political_party.name}
                                className="w-3 h-3"
                              />
                            )}
                            {entity.political_party.acronym || entity.political_party.name}
                          </Badge>
                        </div>
                      )}

                      {entity.average_rating && entity.average_rating > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{entity.average_rating.toFixed(1)}</span>
                            {entity.total_ratings && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({entity.total_ratings})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {(entity.transparency_score || entity.civic_engagement_score) && (
                        <div className="flex gap-1 flex-wrap">
                          {entity.transparency_score && entity.transparency_score > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Transparency: {entity.transparency_score}%
                            </Badge>
                          )}
                          {entity.civic_engagement_score && entity.civic_engagement_score > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Engagement: {entity.civic_engagement_score}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Political Figures Found</h3>
              <p className="text-muted-foreground">
                No political figures match your current search criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}