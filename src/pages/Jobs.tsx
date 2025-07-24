import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  Grid3x3,
  List,
  Map,
  SlidersHorizontal,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo?: string;
  location: string;
  region: string;
  job_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  description: string;
  deadline?: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_remote: boolean;
  views_count: number;
  applications_count: number;
  tags: string[];
  created_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

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
  posted_within: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<JobFilters>({
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

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [filters, searchQuery, sortBy]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load initial jobs
      await fetchJobs();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load job data",
        variant: "destructive"
      });
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    
    try {
      // For now, use mock data since we don't have real jobs yet
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          slug: 'senior-software-engineer-at-tech-solutions',
          company_name: 'Tech Solutions Ltd',
          company_logo: '',
          location: 'Douala',
          region: 'Littoral',
          job_type: 'full_time',
          experience_level: 'senior',
          salary_min: 800000,
          salary_max: 1200000,
          salary_currency: 'FCFA',
          description: 'We are looking for a senior software engineer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
          deadline: '2024-02-15',
          is_featured: true,
          is_urgent: false,
          is_remote: false,
          views_count: 156,
          applications_count: 23,
          tags: ['React', 'Node.js', 'TypeScript'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          category: {
            id: 'tech',
            name: 'Technology',
            color: '#3B82F6'
          }
        },
        {
          id: '2',
          title: 'Marketing Manager',
          slug: 'marketing-manager-at-growth-agency',
          company_name: 'Growth Agency',
          company_logo: '',
          location: 'Yaoundé',
          region: 'Centre',
          job_type: 'full_time',
          experience_level: 'mid',
          salary_min: 600000,
          salary_max: 900000,
          salary_currency: 'FCFA',
          description: 'Join our dynamic marketing team and help drive growth for our clients. You will develop and execute marketing strategies across multiple channels.',
          deadline: '2024-02-20',
          is_featured: false,
          is_urgent: true,
          is_remote: true,
          views_count: 89,
          applications_count: 15,
          tags: ['Digital Marketing', 'Analytics', 'Content Strategy'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          category: {
            id: 'marketing',
            name: 'Marketing',
            color: '#EC4899'
          }
        },
        {
          id: '3',
          title: 'Civil Engineer',
          slug: 'civil-engineer-at-construction-corp',
          company_name: 'Construction Corp',
          company_logo: '',
          location: 'Bamenda',
          region: 'Northwest',
          job_type: 'full_time',
          experience_level: 'junior',
          salary_min: 400000,
          salary_max: 600000,
          salary_currency: 'FCFA',
          description: 'Opportunity for a junior civil engineer to work on infrastructure projects across the Northwest region. Fresh graduates welcome to apply.',
          deadline: '2024-02-25',
          is_featured: false,
          is_urgent: false,
          is_remote: false,
          views_count: 67,
          applications_count: 31,
          tags: ['AutoCAD', 'Project Management', 'Site Supervision'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          category: {
            id: 'engineering',
            name: 'Engineering',
            color: '#F59E0B'
          }
        },
        {
          id: '4',
          title: 'Nurse - ICU',
          slug: 'nurse-icu-at-regional-hospital',
          company_name: 'Regional Hospital',
          company_logo: '',
          location: 'Buea',
          region: 'Southwest',
          job_type: 'full_time',
          experience_level: 'mid',
          salary_min: 350000,
          salary_max: 500000,
          salary_currency: 'FCFA',
          description: 'We need a qualified nurse to join our ICU team. Experience in critical care nursing is required.',
          deadline: '2024-02-18',
          is_featured: true,
          is_urgent: true,
          is_remote: false,
          views_count: 124,
          applications_count: 42,
          tags: ['Critical Care', 'Patient Monitoring', 'Emergency Response'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          category: {
            id: 'healthcare',
            name: 'Healthcare',
            color: '#EF4444'
          }
        }
      ];

      // Apply filters and search
      let filteredJobs = mockJobs;

      // Search filter
      if (searchQuery.trim()) {
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Category filter
      if (filters.categories.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          job.category && filters.categories.includes(job.category.id)
        );
      }

      // Location filters
      if (filters.locations.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          filters.locations.includes(job.location)
        );
      }

      if (filters.regions.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          filters.regions.includes(job.region)
        );
      }

      // Job type filter
      if (filters.job_types.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          filters.job_types.includes(job.job_type)
        );
      }

      // Experience level filter
      if (filters.experience_levels.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          filters.experience_levels.includes(job.experience_level)
        );
      }

      // Remote filter
      if (filters.is_remote) {
        filteredJobs = filteredJobs.filter(job => job.is_remote);
      }

      // Featured filter
      if (filters.is_featured) {
        filteredJobs = filteredJobs.filter(job => job.is_featured);
      }

      // Salary range filter
      filteredJobs = filteredJobs.filter(job => {
        const jobSalary = job.salary_max || job.salary_min || 0;
        return jobSalary >= filters.salary_range[0] && jobSalary <= filters.salary_range[1];
      });

      // Sort jobs
      switch (sortBy) {
        case 'newest':
          filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'deadline':
          filteredJobs.sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });
          break;
        case 'most_applied':
          filteredJobs.sort((a, b) => b.applications_count - a.applications_count);
          break;
        case 'salary_high':
          filteredJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
          break;
        default:
          break;
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (jobId: string) => {
    // Toggle bookmark status
    if (bookmarkedJobs.includes(jobId)) {
      setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
      toast({
        title: "Bookmark Removed",
        description: "Job removed from your saved jobs"
      });
    } else {
      setBookmarkedJobs(prev => [...prev, jobId]);
      toast({
        title: "Job Saved",
        description: "Job added to your saved jobs"
      });
    }
  };

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      window.open(`/jobs/${job.slug}`, '_blank');
    }
  };

  const availableLocations = Array.from(new Set(jobs.map(job => job.location))).sort();
  const availableRegions = Array.from(new Set(jobs.map(job => job.region))).sort();

  const stats = {
    total: jobs.length,
    featured: jobs.filter(j => j.is_featured).length,
    remote: jobs.filter(j => j.is_remote).length,
    urgent: jobs.filter(j => j.is_urgent).length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Work That Builds The Nation
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover opportunities across Cameroon's growing economy
              </p>
            </div>

            {/* Search Bar */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, companies, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{stats.featured}</div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{stats.remote}</div>
                <div className="text-sm text-muted-foreground">Remote</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{stats.urgent}</div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <JobFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                availableLocations={availableLocations}
                availableRegions={availableRegions}
                totalJobs={jobs.length}
                filteredJobs={jobs.length}
              />
            </div>
          )}

          {/* Job Listings */}
          <div className="flex-1 space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {jobs.length} jobs found
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* View Mode */}
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="px-2"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-2"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="deadline">By Deadline</SelectItem>
                        <SelectItem value="most_applied">Most Applied</SelectItem>
                        <SelectItem value="salary_high">Highest Salary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 space-y-0' : ''}`}>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={bookmarkedJobs.includes(job.id)}
                    onBookmark={handleBookmark}
                    onApply={handleApply}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}