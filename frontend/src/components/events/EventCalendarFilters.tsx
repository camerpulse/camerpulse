import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  MapPin, 
  Building, 
  Users, 
  Star, 
  Award,
  Flag,
  Calendar,
  Music,
  GraduationCap,
  Briefcase,
  Heart,
  MessageCircle
} from 'lucide-react';

interface EventFilters {
  region?: string;
  event_type?: string;
  organizer_type?: string;
  civic_tags?: string[];
  verified_only?: boolean;
  official_only?: boolean;
}

interface EventCalendarFiltersProps {
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const EVENT_TYPES = [
  { value: 'civic', label: 'Civic Events', icon: Flag, color: 'text-emerald-600' },
  { value: 'political', label: 'Political', icon: Building, color: 'text-blue-600' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'text-purple-600' },
  { value: 'music', label: 'Music & Arts', icon: Music, color: 'text-pink-600' },
  { value: 'business', label: 'Business', icon: Briefcase, color: 'text-orange-600' },
  { value: 'youth', label: 'Youth', icon: Users, color: 'text-cyan-600' },
  { value: 'community', label: 'Community', icon: Heart, color: 'text-green-600' },
  { value: 'government', label: 'Government', icon: Building, color: 'text-indigo-600' }
];

const ORGANIZER_TYPES = [
  { value: 'government_institution', label: 'Government Institution' },
  { value: 'political_party', label: 'Political Party' },
  { value: 'ngo', label: 'NGO' },
  { value: 'company', label: 'Company' },
  { value: 'school', label: 'Educational Institution' },
  { value: 'artist', label: 'Artist/Creator' },
  { value: 'event_organizer', label: 'Event Organizer' },
  { value: 'verified_user', label: 'Verified User' }
];

const CIVIC_TAGS = [
  'democracy', 'transparency', 'accountability', 'human_rights',
  'environment', 'health', 'education', 'infrastructure',
  'economic_development', 'peace_building', 'digital_inclusion',
  'anti_corruption', 'youth_empowerment', 'women_rights'
];

export const EventCalendarFilters: React.FC<EventCalendarFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleCivicTag = (tag: string) => {
    const currentTags = filters.civic_tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('civic_tags', newTags.length > 0 ? newTags : undefined);
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof EventFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== false;
  }).length;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Region Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Region
          </Label>
          <Select
            value={filters.region || 'all'}
            onValueChange={(value) => 
              handleFilterChange('region', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {CAMEROON_REGIONS.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Event Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Event Type
          </Label>
          <div className="grid grid-cols-1 gap-1">
            {EVENT_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={filters.event_type === type.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => 
                    handleFilterChange(
                      'event_type', 
                      filters.event_type === type.value ? undefined : type.value
                    )
                  }
                  className="justify-start text-left h-8"
                >
                  <Icon className={`w-3 h-3 mr-2 ${type.color}`} />
                  <span className="text-xs">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Organizer Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Building className="w-4 h-4" />
            Organizer Type
          </Label>
          <Select
            value={filters.organizer_type || 'all'}
            onValueChange={(value) => 
              handleFilterChange('organizer_type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All organizers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizers</SelectItem>
              {ORGANIZER_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4" />
            Quick Filters
          </Label>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only" className="text-xs font-normal">
              Verified Organizers Only
            </Label>
            <Switch
              id="verified-only"
              checked={filters.verified_only || false}
              onCheckedChange={(checked) => 
                handleFilterChange('verified_only', checked || undefined)
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="official-only" className="text-xs font-normal">
              Official Events Only
            </Label>
            <Switch
              id="official-only"
              checked={filters.official_only || false}
              onCheckedChange={(checked) => 
                handleFilterChange('official_only', checked || undefined)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Civic Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Civic Topics
          </Label>
          <div className="flex flex-wrap gap-1">
            {CIVIC_TAGS.map(tag => {
              const isSelected = filters.civic_tags?.includes(tag) || false;
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className="text-xs cursor-pointer hover:bg-accent"
                  onClick={() => toggleCivicTag(tag)}
                >
                  {tag.replace(/_/g, ' ')}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Filter Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3 inline mr-1" />
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};