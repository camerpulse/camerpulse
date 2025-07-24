import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { JobFilters as JobFiltersType } from "@/types/jobs";
import { Search, X } from "lucide-react";

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClear: () => void;
  jobCategories?: Array<{ id: string; name: string; slug: string }>;
}

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" }
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" }
];

const CAMEROON_REGIONS = [
  "Adamawa", "Centre", "East", "Far North", "Littoral", 
  "North", "Northwest", "South", "Southwest", "West"
];

export function JobFilters({ filters, onFiltersChange, onClear, jobCategories = [] }: JobFiltersProps) {
  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== "" && value !== false
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Jobs</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search"
              placeholder="Job title, company, or keywords..."
              value={filters.search_query || ""}
              onChange={(e) => updateFilter("search_query", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={filters.category || ""} 
            onValueChange={(value) => updateFilter("category", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {jobCategories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="City or area..."
            value={filters.location || ""}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label>Region</Label>
          <Select 
            value={filters.region || ""} 
            onValueChange={(value) => updateFilter("region", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {CAMEROON_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select 
            value={filters.job_type || ""} 
            onValueChange={(value) => updateFilter("job_type", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {JOB_TYPES.map((type) => (
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
          <Select 
            value={filters.experience_level || ""} 
            onValueChange={(value) => updateFilter("experience_level", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Range */}
        <div className="space-y-2">
          <Label>Minimum Salary (FCFA)</Label>
          <Input
            type="number"
            placeholder="e.g. 500000"
            value={filters.salary_min || ""}
            onChange={(e) => updateFilter("salary_min", e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label>Maximum Salary (FCFA)</Label>
          <Input
            type="number"
            placeholder="e.g. 2000000"
            value={filters.salary_max || ""}
            onChange={(e) => updateFilter("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* Remote Work */}
        <div className="flex items-center space-x-2">
          <Switch
            id="remote"
            checked={filters.is_remote || false}
            onCheckedChange={(checked) => updateFilter("is_remote", checked)}
          />
          <Label htmlFor="remote">Remote Work Only</Label>
        </div>
      </CardContent>
    </Card>
  );
}