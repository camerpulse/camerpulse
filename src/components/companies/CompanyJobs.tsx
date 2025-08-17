import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, ExternalLink, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/hooks/useNavigation';

interface Job {
  id: string;
  job_title: string;
  job_description: string;
  location: string;
  salary_range?: string;
  requirements?: string;
  application_link?: string;
  application_email?: string;
  expires_at?: string;
  created_at: string;
  views_count: number;
}

interface CompanyJobsProps {
  companyId: string;
}

export default function CompanyJobs({ companyId }: CompanyJobsProps) {
  const { navigateTo } = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [companyId]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('company_jobs')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementJobViews = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        await supabase
          .from('company_jobs')
          .update({ views_count: job.views_count + 1 })
          .eq('id', jobId);
      }
    } catch (error) {
      console.error('Error incrementing job views:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No Job Openings</h4>
          <p className="text-muted-foreground">
            This company doesn't have any active job postings at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Openings ({jobs.length})</h3>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className={`transition-shadow hover:shadow-lg ${isExpired(job.expires_at) ? 'opacity-75' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{job.job_title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                    {job.salary_range && (
                      <Badge variant="outline">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {job.salary_range}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Posted {formatDate(job.created_at)}
                    </Badge>
                    {isExpired(job.expires_at) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h5 className="font-semibold mb-2">Job Description</h5>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.job_description}
                </p>
              </div>

              {job.requirements && (
                <div>
                  <h5 className="font-semibold mb-2">Requirements</h5>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  {job.views_count} views
                </span>

                <div className="flex gap-2">
                  {job.application_email && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        incrementJobViews(job.id);
                        const mailtoUrl = `mailto:${job.application_email}?subject=Application for ${job.job_title}`;
                        navigateTo(mailtoUrl, { external: true });
                      }}
                      disabled={isExpired(job.expires_at)}
                    >
                      Email Application
                    </Button>
                  )}
                  
                  {job.application_link && (
                    <Button
                      onClick={() => {
                        incrementJobViews(job.id);
                        window.open(job.application_link, '_blank');
                      }}
                      disabled={isExpired(job.expires_at)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  )}

                  {!job.application_link && !job.application_email && (
                    <Button variant="outline" disabled>
                      Contact Company
                    </Button>
                  )}
                </div>
              </div>

              {job.expires_at && !isExpired(job.expires_at) && (
                <p className="text-sm text-muted-foreground">
                  Application deadline: {formatDate(job.expires_at)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}