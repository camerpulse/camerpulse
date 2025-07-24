import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Filter,
  X,
  ChevronDown,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react';

interface JobCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  job_count: number;
}

interface JobFilters {
  categories: string[];
  locations: string[];
  regions: string[];
  job_types: string[];
  experience_levels: string[];
  education_levels: string[];
  salary_range: [number, number];
  is_remote: boolean;
  is_featured: boolean;
  posted_within: string; // '24h', '7d', '30d', 'all'
}

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  categories: JobCategory[];
  availableLocations: string[];
  availableRegions: string[];
  totalJobs: number;
  filteredJobs: number;
}

export function JobFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  availableLocations, 
  availableRegions,
  totalJobs,
  filteredJobs 
}: JobFiltersProps) {
  const updateFilter = (key: keyof JobFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'locations' | 'regions' | 'job_types' | 'experience_levels' | 'education_levels', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      locations: [],
      regions: [],
      job_types: [],
      experience_levels: [],
      education_levels: [],
      salary_range: [0, 10000000],
      is_remote: false,
      is_featured: false,
      posted_within: 'all'
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.locations.length > 0 ||
      filters.regions.length > 0 ||
      filters.job_types.length > 0 ||
      filters.experience_levels.length > 0 ||
      filters.education_levels.length > 0 ||
      filters.salary_range[0] > 0 ||
      filters.salary_range[1] < 10000000 ||
      filters.is_remote ||
      filters.is_featured ||
      filters.posted_within !== 'all'
    );
  };

  const jobTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'executive', label: 'Executive' }
  ];

  const educationOptions = [
    { value: 'high_school', label: 'High School' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: 'Bachelor\'s Degree' },
    { value: 'master', label: 'Master\'s Degree' },
    { value: 'phd', label: 'PhD' }
  ];

  const formatSalary = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount} FCFA`;
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredJobs} of {totalJobs} jobs
          </div>
        </CardHeader>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={filters.is_remote}
                onCheckedChange={(checked) => updateFilter('is_remote', checked)}
              />
              <Label htmlFor="remote">Remote Work</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.is_featured}
                onCheckedChange={(checked) => updateFilter('is_featured', checked)}
              />
              <Label htmlFor="featured">Featured Jobs Only</Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Posted Within
              </Label>
              <Select value={filters.posted_within} onValueChange={(value) => updateFilter('posted_within', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categories
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.job_count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Location */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Regions</Label>
                  <div className="space-y-2 mt-2">
                    {availableRegions.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region}`}
                          checked={filters.regions.includes(region)}
                          onCheckedChange={() => toggleArrayFilter('regions', region)}
                        />
                        <Label htmlFor={`region-${region}`}>{region}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium">Cities</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={filters.locations.includes(location)}
                          onCheckedChange={() => toggleArrayFilter('locations', location)}
                        />
                        <Label htmlFor={`location-${location}`}>{location}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Job Type */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Type
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {jobTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`job-type-${option.value}`}
                      checked={filters.job_types.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('job_types', option.value)}
                    />
                    <Label htmlFor={`job-type-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Experience Level */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Experience
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {experienceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`experience-${option.value}`}
                      checked={filters.experience_levels.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('experience_levels', option.value)}
                    />
                    <Label htmlFor={`experience-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Salary Range */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Range
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.salary_range}
                    onValueChange={(value) => updateFilter('salary_range', value as [number, number])}
                    max={10000000}
                    min={0}
                    step={50000}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatSalary(filters.salary_range[0])}</span>
                  <span>{formatSalary(filters.salary_range[1])}</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}