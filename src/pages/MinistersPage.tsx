import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Building, MapPin } from 'lucide-react';
import { useMinisters } from '@/hooks/useMinisters';
import { MinisterCard } from '@/components/Ministers/MinisterCard';


const MinistersPage = () => {
  
  const { data: ministers, isLoading, error } = useMinisters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');


  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading Ministers...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error loading Ministers</h1>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Government Ministers</h1>
          </div>
          <p className="text-muted-foreground">
            Directory of Cameroon's Government Ministers and their ministries
          </p>
          
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {ministers?.length || 0} Ministers
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {ministries.length} Ministries
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Ministers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="ministry">Ministry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMinisters?.length || 0} of {ministers?.length || 0} Ministers
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Ministers Grid */}
        {filteredMinisters && filteredMinisters.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredMinisters.map((minister) => (
              <MinisterCard key={minister.id} minister={minister} />
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
      </div>
    </AppLayout>
  );
};

export default MinistersPage;