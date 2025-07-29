import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { JobFilters } from '@/types/jobs';

interface JobSearchProps {
  onSearch: (filters: JobFilters) => void;
  className?: string;
}

export const JobSearch: React.FC<JobSearchProps> = ({ onSearch, className }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; value: string; label: string }>>([]);

  const handleSearch = () => {
    const filters: JobFilters = {};
    
    if (location.trim()) filters.location = location.trim();
    if (jobType) filters.job_type = jobType;

    // Update active filters for display
    const newActiveFilters = [];
    if (query.trim()) newActiveFilters.push({ key: 'query', value: query.trim(), label: `"${query.trim()}"` });
    if (location.trim()) newActiveFilters.push({ key: 'location', value: location.trim(), label: `in ${location.trim()}` });
    if (jobType) newActiveFilters.push({ key: 'job_type', value: jobType, label: jobType.replace('_', ' ') });
    
    setActiveFilters(newActiveFilters);
    onSearch(filters);
  };

  const removeFilter = (filterKey: string) => {
    const newActiveFilters = activeFilters.filter(f => f.key !== filterKey);
    setActiveFilters(newActiveFilters);

    // Update state
    if (filterKey === 'query') setQuery('');
    if (filterKey === 'location') setLocation('');
    if (filterKey === 'job_type') setJobType('');

    // Build new filters object
    const filters: JobFilters = {};
    newActiveFilters.forEach(filter => {
      if (filter.key === 'location') filters.location = filter.value;
      if (filter.key === 'job_type') filters.job_type = filter.value;
    });

    onSearch(filters);
  };

  const clearAllFilters = () => {
    setQuery('');
    setLocation('');
    setJobType('');
    setActiveFilters([]);
    onSearch({});
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for jobs, companies, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="min-w-[150px] h-12">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Job Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="h-12 px-8">
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter.label}
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};