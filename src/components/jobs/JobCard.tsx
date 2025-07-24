import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/jobs';
import { MapPin, Clock, Briefcase, Building, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBookmarkJob } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';

interface JobCardProps {
  job: Job;
  onViewDetails: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const { toast } = useToast();
  const bookmarkMutation = useBookmarkJob();

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetails(job.id)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {job.company?.company_logo_url && (
                <img 
                  src={job.company.company_logo_url} 
                  alt={job.company.company_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {job.company?.company_name}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
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
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
            {formatSalary() && (
              <span className="font-medium text-foreground">
                {formatSalary()}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {job.category && (
              <Badge variant="outline" className="text-xs">
                {job.category.name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};