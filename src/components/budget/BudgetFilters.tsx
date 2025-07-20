import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';

interface BudgetFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  selectedMinistry: string;
  onMinistryChange: (value: string) => void;
  selectedSector: string;
  onSectorChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const years = ['2024', '2023', '2022', '2021'];
const ministries = [
  'MINSANTE', 'MINEDUB', 'MINTRANS', 'MINADER', 'MINFI', 
  'MINDEF', 'MINCOM', 'MINJUSTICE', 'MINTP', 'MINDCAF'
];
const sectors = [
  'Health', 'Education', 'Infrastructure', 'Agriculture', 'Administration',
  'Security', 'Communication', 'Justice', 'Public Works', 'Culture'
];
const regions = [
  'Centre', 'Littoral', 'Northwest', 'West', 'North', 'Far North',
  'East', 'South', 'Southwest', 'Adamawa'
];
const statuses = ['budgeted', 'executing', 'completed', 'cancelled'];

export const BudgetFilters: React.FC<BudgetFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedMinistry,
  onMinistryChange,
  selectedSector,
  onSectorChange,
  selectedRegion,
  onRegionChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Budget Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Fiscal Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Fiscal Year</Label>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ministry */}
          <div className="space-y-2">
            <Label htmlFor="ministry">Ministry</Label>
            <Select value={selectedMinistry} onValueChange={onMinistryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select ministry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ministries</SelectItem>
                {ministries.map(ministry => (
                  <SelectItem key={ministry} value={ministry}>{ministry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select value={selectedSector} onValueChange={onSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allocated_amount">Allocation Amount</SelectItem>
                <SelectItem value="execution_percentage">Execution Rate</SelectItem>
                <SelectItem value="transparency_score">Transparency Score</SelectItem>
                <SelectItem value="project_name">Project Name</SelectItem>
                <SelectItem value="created_at">Date Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};