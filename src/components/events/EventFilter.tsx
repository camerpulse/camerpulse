import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface EventFilters {
  region?: string;
  event_type?: string;
  organizer_type?: string;
  status?: string;
  date_range?: 'upcoming' | 'ongoing' | 'past' | 'all';
}

interface EventFilterProps {
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const EVENT_TYPES = [
  'civic', 'campaign', 'education', 'protest', 'music',
  'business', 'youth', 'community', 'government', 'religious'
];

const ORGANIZER_TYPES = [
  'verified_user', 'government_institution', 'political_party',
  'company', 'school', 'ngo', 'artist', 'event_organizer'
];

const EVENT_STATUS = [
  'draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed'
];

const DATE_RANGES = [
  { value: 'all', label: 'All Events' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'past', label: 'Past Events' }
];

export const EventFilter = ({ filters, onFilterChange }: EventFilterProps) => {
  const handleFilterChange = (key: keyof EventFilters, value: string | undefined) => {
    onFilterChange({ [key]: value === 'all' ? undefined : value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: 'published',
      date_range: 'upcoming'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'published' && v !== 'upcoming').length;

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount}</Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Time Period</Label>
          <Select
            value={filters.date_range || 'upcoming'}
            onValueChange={(value) => handleFilterChange('date_range', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label>Region</Label>
          <Select
            value={filters.region || 'all'}
            onValueChange={(value) => handleFilterChange('region', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {CAMEROON_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type */}
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={filters.event_type || 'all'}
            onValueChange={(value) => handleFilterChange('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organizer Type */}
        <div className="space-y-2">
          <Label>Organizer Type</Label>
          <Select
            value={filters.organizer_type || 'all'}
            onValueChange={(value) => handleFilterChange('organizer_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All organizers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizers</SelectItem>
              {ORGANIZER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'published'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">QUICK FILTERS</Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFilterChange({ event_type: 'civic', status: 'published' })}
            >
              Civic Events Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFilterChange({ organizer_type: 'government_institution', status: 'published' })}
            >
              Government Events
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFilterChange({ organizer_type: 'political_party', status: 'published' })}
            >
              Political Events
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};