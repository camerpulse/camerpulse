import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Building2, DollarSign, Bookmark, BookmarkCheck } from "lucide-react";
import { Job } from "@/types/jobs";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
  onBookmark?: (jobId: string) => Promise<void>;
  isBookmarked?: boolean;
}

export function JobCard({ job, onSelect, onBookmark, isBookmarked = false }: JobCardProps) {
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onBookmark) return;
    
    setBookmarkLoading(true);
    try {
      await onBookmark(job.id);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const currency = job.salary_currency || 'FCFA';
    const period = job.salary_period || 'month';
    
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()} ${currency}/${period}`;
    } else if (job.salary_min) {
      return `From ${job.salary_min?.toLocaleString()} ${currency}/${period}`;
    } else {
      return `Up to ${job.salary_max?.toLocaleString()} ${currency}/${period}`;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(job.created_at), { addSuffix: true });

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50 hover:border-primary/20"
      onClick={() => onSelect?.(job)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {job.company_logo && (
              <img 
                src={job.company_logo} 
                alt={`${job.company_name} logo`}
                className="w-12 h-12 object-cover rounded-lg border border-border/50"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{job.company_name}</span>
              </div>
            </div>
          </div>
          
          {onBookmark && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className="text-muted-foreground hover:text-primary"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {formatSalary() && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary()}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {job.job_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {job.experience_level}
            </Badge>
            {job.is_remote && (
              <Badge variant="outline" className="text-xs">
                Remote
              </Badge>
            )}
            {job.is_featured && (
              <Badge className="text-xs bg-primary">
                Featured
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {job.views_count || 0} views
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}