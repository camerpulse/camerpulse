import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Job } from '@/types/jobs';
import { 
  MapPin, Clock, Briefcase, Building, Globe, Users, 
  DollarSign, Calendar, Eye, Bookmark, ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useBookmarkJob, useTrackJobView } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
  onApply: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, onBack, onApply }) => {
  const { toast } = useToast();
  const bookmarkMutation = useBookmarkJob();
  const trackViewMutation = useTrackJobView();

  useEffect(() => {
    // Track job view when component mounts
    trackViewMutation.mutate(job.id);
  }, [job.id]);

  const handleBookmark = () => {
    bookmarkMutation.mutate(job.id, {
      onSuccess: () => {
        toast({
          title: "Job Bookmarked",
          description: "You can find this job in your bookmarks.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to bookmark job",
          variant: "destructive"
        });
      }
    });
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const currency = job.salary_currency === 'XAF' ? 'FCFA' : job.salary_currency;
    
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${currency}`;
    }
    if (job.salary_min) {
      return `From ${job.salary_min.toLocaleString()} ${currency}`;
    }
    if (job.salary_max) {
      return `Up to ${job.salary_max.toLocaleString()} ${currency}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          
          <div className="flex items-start gap-4">
            {job.company?.company_logo_url && (
              <img 
                src={job.company.company_logo_url} 
                alt={job.company.company_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Building className="h-4 w-4" />
                <span className="font-medium">{job.company?.company_name}</span>
                {job.company?.website_url && (
                  <a 
                    href={job.company.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.is_remote ? 'Remote' : job.location || 'Location TBD'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.job_type?.replace('_', ' ') || 'Full time'}
                </Badge>
                {job.experience_level && (
                  <Badge variant="outline">
                    {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} Level
                  </Badge>
                )}
                {job.featured && (
                  <Badge className="bg-primary">Featured</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {job.views_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {job.applications_count} applications
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={onApply}>
                Apply Now
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="text-sm">{requirement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="text-sm">{responsibility}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm">{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formatSalary() && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <DollarSign className="h-4 w-4" />
                    Salary
                  </div>
                  <p className="text-sm text-muted-foreground">{formatSalary()}</p>
                </div>
              )}
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Calendar className="h-4 w-4" />
                  Application Deadline
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.application_deadline 
                    ? format(new Date(job.application_deadline), 'PPP')
                    : 'Not specified'
                  }
                </p>
              </div>
              
              {job.category && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Category</div>
                    <Badge variant="outline">{job.category.name}</Badge>
                  </div>
                </>
              )}
              
              {job.tags && job.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {job.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          {job.company && (
            <Card>
              <CardHeader>
                <CardTitle>About {job.company.company_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.company.company_description && (
                  <p className="text-sm text-muted-foreground">
                    {job.company.company_description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {job.company.industry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{job.company.industry}</span>
                    </div>
                  )}
                  {job.company.company_size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{job.company.company_size} employees</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{job.company.location || job.company.region}</span>
                  </div>
                </div>
                
                {job.company.website_url && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={job.company.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};