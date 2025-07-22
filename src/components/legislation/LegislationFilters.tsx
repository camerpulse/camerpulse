import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LegislationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedSector: string;
  onSectorChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const lawStatuses = [
  'draft', 'in_committee', 'first_reading', 'second_reading', 
  'third_reading', 'voted', 'passed', 'rejected', 'paused'
];

const lawTypes = [
  'bill', 'amendment', 'reform', 'ordinance', 'act', 'resolution'
];

const sectors = [
  'Health', 'Education', 'Tax', 'Land', 'Internet', 'Transport',
  'Environment', 'Agriculture', 'Justice', 'Defense', 'Economy'
];

export const LegislationFilters: React.FC<LegislationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Bills</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search legislation..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={selectedStatus} onValueChange={onStatusChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {lawStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type</Label>
          <Select value={selectedType} onValueChange={onTypeChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {lawTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sector</Label>
          <Select value={selectedSector} onValueChange={onSectorChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_introduced">Date Introduced</SelectItem>
              <SelectItem value="citizen_upvotes">Most Supported</SelectItem>
              <SelectItem value="citizen_downvotes">Most Opposed</SelectItem>
              <SelectItem value="followers_count">Most Followed</SelectItem>
              <SelectItem value="total_comments">Most Discussed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};