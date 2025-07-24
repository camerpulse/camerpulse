import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Users,
  Eye,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
    name: string;
    color: string;
  };
}

interface JobCardProps {
  job: Job;
  isBookmarked?: boolean;
  onBookmark?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, isBookmarked = false, onBookmark, onApply, variant = 'default' }: JobCardProps) {
  const formatSalary = (min?: number, max?: number, currency: string = 'FCFA') => {
    if (!min && !max) return null;
    
    const format = (amount: number) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
      }
      return amount.toString();
    };

    if (min && max) {
      return `${format(min)} - ${format(max)} ${currency}`;
    }
    return `${format(min || max!)} ${currency}`;
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid Level',
      senior: 'Senior',
      executive: 'Executive'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const isDeadlineSoon = () => {
    if (!job.deadline) return false;
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={job.company_logo} />
              <AvatarFallback>
                {job.company_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/jobs/${job.slug}`} className="font-semibold hover:text-primary line-clamp-1">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{job.company_name}</p>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {job.is_featured && <Star className="h-4 w-4 fill-warning text-warning" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBookmark?.(job.id)}
                    className="p-1"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </div>
                {salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {salary}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${job.is_featured ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={job.company_logo} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {job.company_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/jobs/${job.slug}`} className="text-lg font-semibold hover:text-primary transition-colors">
                  {job.title}
                </Link>
                {job.is_featured && (
                  <Badge className="bg-warning/10 text-warning border-warning">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {job.is_urgent && (
                  <Badge variant="destructive" className="animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground font-medium">{job.company_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark?.(job.id)}
              className="p-2"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location}</span>
            {job.is_remote && (
              <Badge variant="outline" className="ml-1">Remote</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{getJobTypeLabel(job.job_type)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{getExperienceLabel(job.experience_level)}</span>
          </div>
        </div>

        {/* Salary */}
        {salary && (
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-semibold text-success">{salary}</span>
            <span className="text-xs text-muted-foreground">per month</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {job.views_count} views
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {job.applications_count} applications
            </div>
            {job.deadline && (
              <div className={`flex items-center gap-1 ${isDeadlineSoon() ? 'text-warning' : ''}`}>
                <Calendar className="h-3 w-3" />
                {isDeadlineSoon() ? 'Deadline soon' : `Deadline ${new Date(job.deadline).toLocaleDateString()}`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/jobs/${job.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={() => onApply?.(job.id)}
              className="bg-primary hover:bg-primary/90"
            >
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Posted time */}
        <div className="mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          Posted {new Date(job.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}