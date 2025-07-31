import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  Search, 
  MapPin, 
  Clock, 
  Tag, 
  Settings,
  ChevronDown,
  X
} from 'lucide-react';

const CAMEROON_REGIONS = [
  'all', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const CONTENT_TYPES = [
  { value: 'all', label: 'All Content' },
  { value: 'civic', label: 'Civic Updates' },
  { value: 'job', label: 'Job Listings' },
  { value: 'artist_content', label: 'Artist Content' },
  { value: 'village_update', label: 'Village Updates' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'business_listing', label: 'Business Listings' },
  { value: 'petition', label: 'Petitions' },
  { value: 'political_update', label: 'Political Updates' }
];

const TIME_RANGES = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last Week' },
  { value: '30d', label: 'Last Month' }
];

interface FeedFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  userPreferences: any;
  onPreferencesUpdate: (preferences: any) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  onFiltersChange,
  userPreferences,
  onPreferencesUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter((tag: string) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      addTag(tagInput.trim());
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between font-inter">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Feed Filters & Preferences
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10 font-inter"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium font-inter flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Region
                </label>
                <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                  <SelectTrigger className="font-inter">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region} className="font-inter">
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium font-inter flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Content Type
                </label>
                <Select value={filters.contentType} onValueChange={(value) => updateFilter('contentType', value)}>
                  <SelectTrigger className="font-inter">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="font-inter">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium font-inter flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time Range
                </label>
                <Select value={filters.timeRange} onValueChange={(value) => updateFilter('timeRange', value)}>
                  <SelectTrigger className="font-inter">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value} className="font-inter">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium font-inter flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="font-inter"
                />
                <Button 
                  onClick={() => addTag(tagInput.trim())}
                  variant="outline"
                  className="font-inter"
                >
                  Add
                </Button>
              </div>
              
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="font-inter">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* User Preferences Display */}
            {userPreferences && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium font-inter mb-2">Your Content Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="font-inter">
                    Civic: {Math.round(userPreferences.civic_content_weight * 100)}%
                  </div>
                  <div className="font-inter">
                    Jobs: {Math.round(userPreferences.job_content_weight * 100)}%
                  </div>
                  <div className="font-inter">
                    Artists: {Math.round(userPreferences.artist_content_weight * 100)}%
                  </div>
                  <div className="font-inter">
                    Local: {Math.round(userPreferences.local_content_preference * 100)}%
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};