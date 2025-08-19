import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Star, MapPin, Clock, DollarSign, Users, Building, Award, ExternalLink } from 'lucide-react';
import { ConnectionRequestForm } from '@/components/BrandAmbassador/ConnectionRequestForm';

interface ArtistProfile {
  id: string;
  artist_id: string;
  branding_status: 'available' | 'not_available' | 'negotiable';
  current_brands: Array<{name: string; logo_url?: string; website?: string}>;
  past_partnerships: Array<{name: string; year: number; description: string}>;
  audience_types: string[];
  industry_interests: string[];
  minimum_contract_weeks?: number;
  minimum_fee_fcfa?: number;
  preferred_regions: string[];
  exclusivity_available: boolean;
  expected_deliverables: string[];
  bio_ambassador?: string;
  media_kit_url?: string;
  total_connections: number;
  total_campaigns: number;
  average_rating: number;
}

const FILTER_OPTIONS = {
  regions: ['National', 'Local (Douala)', 'Local (Yaounde)', 'International', 'CEMAC Region'],
  industries: ['Fashion', 'Telecom', 'Skincare & Hair', 'Food & Beverage', 'Agriculture', 'Education', 'Finance', 'NGOs', 'Events', 'Technology'],
  audiences: ['Youth (18-35)', 'Women', 'Men', 'Musicians', 'Diaspora', 'Christians', 'Students', 'Professionals'],
  status: ['available', 'negotiable']
};

export const BrandAmbassadorPortal: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<ArtistProfile[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [artists, searchTerm, regionFilter, industryFilter, audienceFilter, statusFilter, minBudget, maxBudget]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_branding_profiles')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      
      const typedArtists = data.map(artist => ({
        ...artist,
        current_brands: Array.isArray(artist.current_brands) ? artist.current_brands as Array<{name: string; logo_url?: string; website?: string}> : [],
        past_partnerships: Array.isArray(artist.past_partnerships) ? artist.past_partnerships as Array<{name: string; year: number; description: string}> : []
      }));
      
      setArtists(typedArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to load brand ambassadors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = artists;

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(artist => 
        artist.artist_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.bio_ambassador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.industry_interests.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Region filter
    if (regionFilter) {
      filtered = filtered.filter(artist => 
        artist.preferred_regions.includes(regionFilter)
      );
    }

    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter(artist => 
        artist.industry_interests.includes(industryFilter)
      );
    }

    // Audience filter
    if (audienceFilter) {
      filtered = filtered.filter(artist => 
        artist.audience_types.includes(audienceFilter)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(artist => 
        artist.branding_status === statusFilter
      );
    }

    // Budget filters
    if (minBudget || maxBudget) {
      filtered = filtered.filter(artist => {
        const artistMinFee = artist.minimum_fee_fcfa || 0;
        const min = parseInt(minBudget) || 0;
        const max = parseInt(maxBudget) || Infinity;
        return artistMinFee >= min && artistMinFee <= max;
      });
    }

    setFilteredArtists(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setIndustryFilter('');
    setAudienceFilter('');
    setStatusFilter('');
    setMinBudget('');
    setMaxBudget('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">✅ Available</Badge>;
      case 'negotiable':
        return <Badge variant="warning">⚠️ Negotiable</Badge>;
      default:
        return <Badge variant="secondary">❌ Not Available</Badge>;
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Negotiable';
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">CamerPulse Brand Ambassador Portal</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Discover and connect with verified Cameroonian artists for your brand campaigns
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {artists.length} Verified Artists
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2">
            <Award className="h-4 w-4 mr-2" />
            Premium Matchmaking
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Perfect Brand Ambassador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search artists, industries..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any region</SelectItem>
                  {FILTER_OPTIONS.regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any industry</SelectItem>
                  {FILTER_OPTIONS.industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Availability</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Budget (FCFA)</Label>
              <Input
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Max Budget (FCFA)</Label>
              <Input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="No limit"
              />
            </div>

            <div>
              <Label>Audience</Label>
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any audience</SelectItem>
                  {FILTER_OPTIONS.audiences.map(audience => (
                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredArtists.length} of {artists.length} artists
          </p>
        </CardContent>
      </Card>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map(artist => (
          <Card key={artist.id} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{artist.artist_id}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(artist.branding_status)}
                    {artist.average_rating > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {artist.average_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              {artist.bio_ambassador && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {artist.bio_ambassador}
                </p>
              )}

              {/* Industries */}
              <div>
                <Label className="text-xs font-semibold">Industries</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {artist.industry_interests.slice(0, 3).map(industry => (
                    <Badge key={industry} variant="secondary" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                  {artist.industry_interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{artist.industry_interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Audience */}
              <div>
                <Label className="text-xs font-semibold">Audience</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {artist.audience_types.slice(0, 2).map(audience => (
                    <Badge key={audience} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                  {artist.audience_types.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{artist.audience_types.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{artist.minimum_contract_weeks || 'Flexible'} weeks min</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPrice(artist.minimum_fee_fcfa)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{artist.total_campaigns} campaigns</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{artist.total_connections} connections</span>
                </div>
              </div>

              {/* Current Brands */}
              {artist.current_brands.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold">Current Partnerships</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {artist.current_brands.map((brand, index) => (
                      <Badge key={index} variant="success" className="text-xs">
                        {brand.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{artist.artist_id} - Brand Ambassador</DialogTitle>
                      <DialogDescription>
                        Detailed profile and partnership information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {artist.bio_ambassador && (
                        <div>
                          <Label className="font-semibold">About</Label>
                          <p className="text-sm mt-1">{artist.bio_ambassador}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold">Industries</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {artist.industry_interests.map(industry => (
                              <Badge key={industry} variant="secondary" className="text-xs">
                                {industry}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="font-semibold">Preferred Regions</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {artist.preferred_regions.map(region => (
                              <Badge key={region} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {artist.past_partnerships.length > 0 && (
                        <div>
                          <Label className="font-semibold">Past Partnerships</Label>
                          <div className="space-y-2 mt-1">
                            {artist.past_partnerships.map((partnership, index) => (
                              <div key={index} className="border rounded p-2">
                                <div className="flex justify-between items-start">
                                  <strong className="text-sm">{partnership.name}</strong>
                                  <Badge variant="outline" className="text-xs">{partnership.year}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{partnership.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {artist.media_kit_url && (
                        <div>
                          <Label className="font-semibold">Media Kit</Label>
                          <Button variant="outline" size="sm" className="mt-1" asChild>
                            <a href={artist.media_kit_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Download Media Kit
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedArtist(artist);
                    setShowConnectionForm(true);
                  }}
                >
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No artists found</h3>
              <p>Try adjusting your filters to find the perfect brand ambassador.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Request Form */}
      {showConnectionForm && selectedArtist && (
        <ConnectionRequestForm
          artist={selectedArtist}
          onClose={() => {
            setShowConnectionForm(false);
            setSelectedArtist(null);
          }}
          onSuccess={() => {
            setShowConnectionForm(false);
            setSelectedArtist(null);
            toast({
              title: "Request Submitted",
              description: "Your connection request has been submitted. You'll be contacted shortly."
            });
          }}
        />
      )}
    </div>
  );
};