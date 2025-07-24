import React, { useState, useEffect } from 'react';
import { useExperts, ExpertProfile, ExpertFilters } from '@/hooks/useExperts';
import { ExpertCard } from '@/components/experts/ExpertCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Filter, 
  Users, 
  Star, 
  MapPin,
  DollarSign,
  X
} from 'lucide-react';

const SKILL_OPTIONS = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing',
  'Data Analysis', 'Project Management', 'Content Writing', 'Graphic Design',
  'Video Editing', 'Photography', 'Accounting', 'Legal Services',
  'Business Consulting', 'IT Support', 'Network Administration', 'Database Management'
];

const LOCATION_OPTIONS = [
  'Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Buea', 'Limbe'
];

export const ExpertMarketplace: React.FC = () => {
  const { experts, loading, searchExperts } = useExperts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [filters, setFilters] = useState<ExpertFilters>({
    skills: [],
    availability: 'available',
    rate_range: { min: 0, max: 50000 },
    location: '',
    rating_min: 0
  });

  useEffect(() => {
    // Load experts on component mount
    handleSearch();
  }, []);

  const handleSearch = async () => {
    const searchFilters: ExpertFilters = { ...filters };
    
    // Add search query to skills if provided
    if (searchQuery.trim()) {
      searchFilters.skills = [...(filters.skills || []), ...searchQuery.split(' ').filter(s => s.trim())];
    }

    await searchExperts(searchFilters);
  };

  const updateFilter = (key: keyof ExpertFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSkillFilter = (skill: string) => {
    const currentSkills = filters.skills || [];
    if (currentSkills.includes(skill)) {
      updateFilter('skills', currentSkills.filter(s => s !== skill));
    } else {
      updateFilter('skills', [...currentSkills, skill]);
    }
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      availability: 'available',
      rate_range: { min: 0, max: 50000 },
      location: '',
      rating_min: 0
    });
    setSearchQuery('');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.availability && filters.availability !== 'available') count++;
    if (filters.location) count++;
    if (filters.rating_min && filters.rating_min > 0) count++;
    if (filters.rate_range && (filters.rate_range.min > 0 || filters.rate_range.max < 50000)) count++;
    return count;
  };

  if (selectedExpert) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedExpert(null)}
            className="flex items-center gap-2"
          >
            ← Back to Experts
          </Button>
        </div>
        <ExpertCard 
          expert={selectedExpert} 
          showFullProfile={true}
          onContactExpert={(expert) => {
            // Handle contact expert logic
            console.log('Contact expert:', expert);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Expert Freelancers</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with verified experts from across Cameroon for your projects
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by skills, expertise, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount()}
                  </Badge>
                )}
              </Button>
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>

            {/* Active Filters */}
            {activeFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer">
                    {skill}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => toggleSkillFilter(skill)}
                    />
                  </Badge>
                ))}
                {filters.location && (
                  <Badge variant="secondary" className="cursor-pointer">
                    📍 {filters.location}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => updateFilter('location', '')}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
                {/* Skills Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {SKILL_OPTIONS.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.skills?.includes(skill) || false}
                          onCheckedChange={() => toggleSkillFilter(skill)}
                          id={skill}
                        />
                        <label htmlFor={skill} className="text-sm cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any location</SelectItem>
                      {LOCATION_OPTIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Availability</label>
                  <Select value={filters.availability} onValueChange={(value) => updateFilter('availability', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.rating_min || 0]}
                      onValueChange={(values) => updateFilter('rating_min', values[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Any</span>
                      <span>{filters.rating_min || 0}+ ⭐</span>
                    </div>
                  </div>
                </div>

                {/* Rate Range Filter */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium">Hourly Rate (FCFA)</label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.rate_range?.min || 0, filters.rate_range?.max || 50000]}
                      onValueChange={(values) => updateFilter('rate_range', { min: values[0], max: values[1] })}
                      max={50000}
                      min={0}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(filters.rate_range?.min || 0).toLocaleString()} FCFA</span>
                      <span>{(filters.rate_range?.max || 50000).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-medium">
            {loading ? 'Searching...' : `${experts.length} experts found`}
          </span>
        </div>
        
        <Select defaultValue="rating">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
            <SelectItem value="recent">Recently Active</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expert Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      ) : experts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all experts
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onViewProfile={(expert) => setSelectedExpert(expert)}
              onContactExpert={(expert) => {
                // Handle contact expert logic
                console.log('Contact expert:', expert);
              }}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {experts.length > 0 && experts.length >= 12 && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={handleSearch}>
            Load More Experts
          </Button>
        </div>
      )}
    </div>
  );
};