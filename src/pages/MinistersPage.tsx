import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Building, MapPin, Users, Star, Grid3X3, List, UserCheck, Phone, Mail } from 'lucide-react';
import { useMinisters } from '@/hooks/useMinisters';
import { MinisterCard } from '@/components/Ministers/MinisterCard';
import { usePlugin } from '@/contexts/PluginContext';

const MinistersPage = () => {
  const { isPluginEnabled } = usePlugin();
  const { data: ministers, isLoading, error } = useMinisters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!isPluginEnabled) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-muted-foreground">
                Ministers Directory is not available
              </h1>
              <p className="text-muted-foreground mt-2">
                This plugin is currently disabled.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading Ministers...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive">Error loading Ministers</h1>
              <p className="text-muted-foreground mt-2">Please try again later.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get unique ministries and regions for filters
  const ministries = [...new Set(ministers?.map(minister => minister.ministry).filter(Boolean))];
  const regions = [...new Set(ministers?.map(minister => minister.region).filter(Boolean))];

  // Filter and sort Ministers
  const filteredMinisters = ministers?.filter(minister => {
    const matchesSearch = minister.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         minister.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         minister.ministry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinistry = selectedMinistry === 'all' || minister.ministry === selectedMinistry;
    const matchesRegion = selectedRegion === 'all' || minister.region === selectedRegion;
    
    return matchesSearch && matchesMinistry && matchesRegion;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.average_rating - a.average_rating;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'ministry':
        return a.ministry.localeCompare(b.ministry);
      default:
        return 0;
    }
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-hero">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative container mx-auto px-4 py-16 sm:py-24">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Building className="h-8 w-8" />
                  </div>
                  <h1 className="responsive-heading font-bold">Government Ministers</h1>
                </div>
                <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto opacity-90">
                  Meet the leaders shaping Cameroon's future through dedicated public service
                </p>
                
                {/* Enhanced Search Interface */}
                <div className="max-w-5xl mx-auto">
                  <Card className="p-6 shadow-elegant backdrop-blur-sm border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search ministers, ministries, regions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                      
                      <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Ministries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ministries</SelectItem>
                          {ministries.map(ministry => (
                            <SelectItem key={ministry} value={ministry}>{ministry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{ministers?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Ministers</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Building className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{ministries.length}</div>
                  <p className="text-sm text-muted-foreground">Ministries</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{regions.length}</div>
                  <p className="text-sm text-muted-foreground">Regions</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-rating-excellent/10 rounded-lg">
                      <Star className="h-6 w-6 text-rating-excellent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{ministers?.filter(m => m.average_rating >= 4).length || 0}</div>
                  <p className="text-sm text-muted-foreground">Highly Rated</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Directory</h2>
              <p className="text-muted-foreground">
                Showing {filteredMinisters?.length || 0} of {ministers?.length || 0} ministers
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Ministers Grid/List */}
          <section>
            {filteredMinisters && filteredMinisters.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredMinisters.map((minister) => (
                  viewMode === 'grid' ? (
                    <MinisterCard key={minister.id} minister={minister} />
                  ) : (
                    <Card key={minister.id} className="directory-card overflow-hidden border-0 shadow-md hover:shadow-elegant">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                            {minister.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{minister.full_name}</h3>
                              <Badge variant="secondary" className="shrink-0">
                                <Star className="h-3 w-3 mr-1" />
                                {minister.average_rating.toFixed(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{minister.position_title}</p>
                            <p className="text-sm text-primary font-medium truncate">{minister.ministry}</p>
                          </div>

                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              {minister.region}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="default" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Ministers found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedMinistry !== 'all' || selectedRegion !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No Ministers are currently available in the directory'
                  }
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default MinistersPage;