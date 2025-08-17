import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "./JobCard";
import { JobDetail } from "./JobDetail";
import { JobApplication } from "./JobApplication";
import { JobFilters } from "./JobFilters";
import { useJobs, useJobCategories, useBookmarkJob, useTrackJobView } from "@/hooks/useJobs";
import { Job, JobFilters as JobFiltersType } from "@/types/jobs";
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function JobBoard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: jobsData, isLoading, error } = useJobs(
    { ...filters, search_query: searchTerm },
    currentPage,
    12
  );
  const { data: categories } = useJobCategories();
  const bookmarkMutation = useBookmarkJob();
  const trackViewMutation = useTrackJobView();

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    trackViewMutation.mutate(job.id);
  };

  const handleApply = () => {
    setShowApplication(true);
  };

  const handleBack = () => {
    if (showApplication) {
      setShowApplication(false);
    } else {
      setSelectedJob(null);
    }
  };

  const handleBookmark = async (jobId: string): Promise<void> => {
    try {
      await bookmarkMutation.mutateAsync(jobId);
      toast.success("Job bookmark updated");
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search_query: searchTerm }));
    setCurrentPage(1);
  };

  // Show application form
  if (showApplication && selectedJob) {
    return (
      <JobApplication
        job={selectedJob}
        onBack={handleBack}
        onSuccess={() => {
          setShowApplication(false);
          setSelectedJob(null);
        }}
      />
    );
  }

  // Show job detail
  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        onBack={handleBack}
        onApply={handleApply}
        onBookmark={() => handleBookmark(selectedJob.id)}
      />
    );
  }

  // Main job board
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">
            Discover your next career opportunity in Cameroon
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClear={clearFilters}
              jobCategories={categories}
            />
          </div>
        )}

        {/* Job Listings */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                {jobsData ? `${jobsData.total} Jobs Found` : 'Loading...'}
              </h2>
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary">
                  {Object.keys(filters).length} filter{Object.keys(filters).length > 1 ? 's' : ''} applied
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Failed to load jobs. Please try again later.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['jobs'] });
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {jobsData && jobsData.jobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No jobs found matching your criteria.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </CardContent>
            </Card>
          )}

          {/* Job Grid */}
          {jobsData && jobsData.jobs.length > 0 && (
            <>
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {jobsData.jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={handleJobSelect}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>

              {/* Pagination */}
              {jobsData.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, jobsData.total_pages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(jobsData.total_pages, prev + 1))}
                    disabled={currentPage === jobsData.total_pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}