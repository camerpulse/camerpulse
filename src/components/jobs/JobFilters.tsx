import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { JobFilters as JobFiltersType } from '@/types/jobs';
import { useJobCategories } from '@/hooks/useJobs';
import { Search, Filter, X } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
}

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const jobTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'executive', label: 'Executive' }
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { data: categories } = useJobCategories();

  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Jobs</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Job title, company, or keywords..."
              value={filters.search_query || ''}
              onChange={(e) => updateFilter('search_query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={filters.category || ''} onValueChange={(value) => updateFilter('category', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={filters.region || ''} onValueChange={(value) => updateFilter('region', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {cameroonRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">City/Location</Label>
          <Input
            id="location"
            placeholder="e.g., Douala, Yaoundé..."
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select value={filters.job_type || ''} onValueChange={(value) => updateFilter('job_type', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={filters.experience_level || ''} onValueChange={(value) => updateFilter('experience_level', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {experienceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remote Work */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={filters.is_remote || false}
            onCheckedChange={(checked) => updateFilter('is_remote', checked || undefined)}
          />
          <Label htmlFor="remote">Remote jobs only</Label>
        </div>

        {/* Salary Range */}
        <div className="space-y-4">
          <Label>Minimum Salary (FCFA)</Label>
          <Input
            type="number"
            placeholder="e.g., 500000"
            value={filters.salary_min || ''}
            onChange={(e) => updateFilter('salary_min', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </CardContent>
    </Card>
  );
};