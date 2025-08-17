import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, MapPin } from 'lucide-react';
import { useMPs } from '@/hooks/useMPs';
import { MPCard } from '@/components/MPs/MPCard';

import { SuggestionButton } from '@/components/CivicSuggestions/SuggestionButton';

const MPsPage = () => {
  
  const { data: mps, isLoading, error } = useMPs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');


  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading MPs...</p>
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
            <h1 className="text-2xl font-bold text-destructive">Error loading MPs</h1>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get unique regions and parties for filters
  const regions = [...new Set(mps?.map(mp => mp.region).filter(Boolean))];
  const parties = [...new Set(mps?.map(mp => mp.political_party).filter(Boolean))];

  // Filter and sort MPs
  const filteredMPs = mps?.filter(mp => {
    const matchesSearch = mp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mp.constituency?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || mp.region === selectedRegion;
    const matchesParty = selectedParty === 'all' || mp.political_party === selectedParty;
    
    return matchesSearch && matchesRegion && matchesParty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.average_rating - a.average_rating;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'constituency':
        return (a.constituency || '').localeCompare(b.constituency || '');
      default:
        return 0;
    }
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Members of Parliament</h1>
            </div>
            <SuggestionButton 
              mode="suggest_new" 
              entityType="mp"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            />
          </div>
          <p className="text-muted-foreground">
            Directory of Cameroon's 180 Members of Parliament from the 10th Legislative Assembly
          </p>
          
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {mps?.length || 0} MPs
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {regions.length} Regions
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search MPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
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

          <Select value={selectedParty} onValueChange={setSelectedParty}>
            <SelectTrigger>
              <SelectValue placeholder="All Parties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {parties.map(party => (
                <SelectItem key={party} value={party}>{party}</SelectItem>
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
              <SelectItem value="constituency">Constituency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMPs?.length || 0} of {mps?.length || 0} MPs
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* MPs Grid */}
        {filteredMPs && filteredMPs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredMPs.map((mp) => (
              <MPCard key={mp.id} mp={mp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No MPs found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedRegion !== 'all' || selectedParty !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No MPs are currently available in the directory'
              }
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MPsPage;