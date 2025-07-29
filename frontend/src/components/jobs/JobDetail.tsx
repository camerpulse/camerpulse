import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Job } from "@/types/jobs";
import { 
  MapPin, Clock, Building2, DollarSign, Users, 
  GraduationCap, Briefcase, Calendar, Eye, 
  ArrowLeft, Share, Bookmark, ExternalLink 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobDetailProps {
  job: Job;
  onBack?: () => void;
  onApply?: () => void;
  onBookmark?: () => Promise<void>;
  isBookmarked?: boolean;
}

export function JobDetail({ job, onBack, onApply, onBookmark, isBookmarked = false }: JobDetailProps) {
  const timeAgo = formatDistanceToNow(new Date(job.created_at), { addSuffix: true });
  
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return "Salary not specified";
    
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity at ${job.company_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Building2 className="w-4 h-4" />
            <span>{job.company_name}</span>
            <span>•</span>
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
          {onBookmark && (
            <Button variant="outline" size="sm" onClick={onBookmark}>
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Job Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium">Salary</span>
              </div>
              <p className="text-lg font-semibold text-primary">{formatSalary()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="font-medium">Job Type</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{job.job_type}</Badge>
                {job.is_remote && <Badge variant="outline">Remote</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Experience Level</span>
              </div>
              <Badge variant="outline">{job.experience_level}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Posted</span>
              </div>
              <p>{timeAgo}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apply Button */}
      {onApply && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Interested in this position?</h3>
                <p className="text-muted-foreground">Apply now and get noticed by the employer</p>
              </div>
              <Button onClick={onApply} size="lg" className="ml-4">
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Job Description</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">About {job.company_name}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.company && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {job.company.logo_url && (
                  <img 
                    src={job.company.logo_url} 
                    alt={`${job.company_name} logo`}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{job.company_name}</h3>
                  <p className="text-sm text-muted-foreground">{job.company.sector}</p>
                  <p className="text-sm text-muted-foreground">{job.company.employee_count_range}</p>
                </div>
              </div>
              
              {job.company.description && (
                <p className="text-sm">{job.company.description}</p>
              )}
              
              {job.company.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={job.company.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Apply */}
      {job.how_to_apply && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">How to Apply</h2>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{job.how_to_apply}</p>
          </CardContent>
        </Card>
      )}

      {/* Job Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{job.views_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{job.applications_count || 0} applications</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Posted {timeAgo}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}