import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  MapPin, 
  Calendar,
  Users,
  Building,
  UserCheck,
  Download,
  QrCode
} from 'lucide-react';
import { useOfficials } from '@/hooks/useOfficials';

const OFFICIAL_CATEGORIES = [
  { id: 'all', label: 'All Officials', icon: Users },
  { id: 'senators', label: 'Senators', icon: Building },
  { id: 'mps', label: 'MPs', icon: UserCheck },
  { id: 'ministers', label: 'Ministers', icon: Star },
  { id: 'governors', label: 'Governors', icon: MapPin },
  { id: 'mayors', label: 'Mayors', icon: Building }
];

const REGIONS = [
  'All Regions', 'Adamawa', 'Centre', 'East', 'Far North', 
  'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const OfficialDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  const { data: officials, isLoading } = useOfficials({
    category: selectedCategory,
    region: selectedRegion === 'All Regions' ? undefined : selectedRegion,
    search: searchTerm,
    sortBy
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">CamerPulse Official Directory</h1>
          <p className="text-lg opacity-90">
            Transparent access to Cameroon's elected and appointed officials
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Officials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                {OFFICIAL_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{category.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Officials Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {officials?.map((official) => (
              <OfficialCard 
                key={official.id} 
                official={official} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {officials?.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Officials Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface OfficialCardProps {
  official: any;
  viewMode: 'grid' | 'list';
}

const OfficialCard: React.FC<OfficialCardProps> = ({ official, viewMode }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className={`p-6 ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}>
        {/* Photo */}
        <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
            {official.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : 'mb-4'}`}>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {official.name}
              </h3>
              <p className="text-primary font-medium">{official.title}</p>
              {official.party && (
                <Badge variant="outline" className="mt-1">
                  {official.party}
                </Badge>
              )}
            </div>

            {viewMode === 'list' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {official.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {official.region && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{official.region}</span>
              </div>
            )}
            
            {official.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Added {new Date(official.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {viewMode === 'grid' && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {official.average_rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({official.total_ratings || 0} ratings)
                </span>
              </div>

              <div className="flex gap-1">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};