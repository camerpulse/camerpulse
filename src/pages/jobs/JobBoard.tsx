import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobDetail } from '@/components/jobs/JobDetail';
import { JobApplication } from '@/components/jobs/JobApplication';
import { JobFilters as JobFiltersType, Job } from '@/types/jobs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const JobBoard = () => {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const perPage = 10;

  const { data: jobsData, isLoading, error } = useJobs(filters, page, perPage);

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleJobSelect = (jobId: string) => {
    const job = jobsData?.jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const handleApply = () => {
    setShowApplication(true);
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  // Show job detail view
  if (selectedJob) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <JobDetail 
            job={selectedJob} 
            onBack={handleBack}
            onApply={handleApply}
          />
          <JobApplication
            job={selectedJob}
            isOpen={showApplication}
            onClose={() => setShowApplication(false)}
          />
        </div>
      </div>
    );
  }

  // Show main job board
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground">
            Discover {jobsData?.total || 0} job opportunities across Cameroon
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : (
                  jobsData?.total ? 
                    `Showing ${((page - 1) * perPage) + 1}-${Math.min(page * perPage, jobsData.total)} of ${jobsData.total} jobs` :
                    'No jobs found'
                )}
              </p>
            </div>

            {/* Job Cards */}
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Error loading jobs. Please try again later.
                </p>
              </div>
            ) : !jobsData?.jobs.length ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No jobs found matching your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobsData.jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={handleJobSelect}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {jobsData && jobsData.total_pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {page} of {jobsData.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= jobsData.total_pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;