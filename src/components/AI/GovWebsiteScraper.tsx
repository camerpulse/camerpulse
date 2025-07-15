import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Globe, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users,
  Building,
  FileText
} from 'lucide-react';

interface ScrapingJob {
  id: string;
  source: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  officialCount: number;
  lastScrape?: string;
}

const GovWebsiteScraper = () => {
  const { toast } = useToast();
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([
    {
      id: 'senate',
      source: 'Senate',
      url: 'https://senat.cm',
      status: 'pending',
      progress: 0,
      officialCount: 0,
      lastScrape: undefined
    },
    {
      id: 'assembly',
      source: 'National Assembly',
      url: 'https://www.assnat.cm',
      status: 'pending',
      progress: 0,
      officialCount: 0,
      lastScrape: undefined
    },
    {
      id: 'ministers',
      source: "Prime Minister's Office",
      url: 'https://www.spm.gov.cm',
      status: 'pending',
      progress: 0,
      officialCount: 0,
      lastScrape: undefined
    }
  ]);
  const [isScrapingAll, setIsScrapingAll] = useState(false);

  const updateJobStatus = (jobId: string, updates: Partial<ScrapingJob>) => {
    setScrapingJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const scrapeGovernmentWebsite = async (job: ScrapingJob) => {
    try {
      updateJobStatus(job.id, { status: 'processing', progress: 10 });

      const response = await supabase.functions.invoke('government-website-scraper', {
        body: {
          action: 'scrape_website',
          source: job.id,
          url: job.url,
          sourceType: job.source
        }
      });

      updateJobStatus(job.id, { progress: 50 });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data } = response;
      
      if (data?.success) {
        updateJobStatus(job.id, {
          status: 'completed',
          progress: 100,
          officialCount: data.officialsFound || 0,
          lastScrape: new Date().toISOString()
        });

        toast({
          title: "Scraping Completed",
          description: `Successfully scraped ${data.officialsFound || 0} officials from ${job.source}`,
          duration: 5000,
        });

        // Trigger verification
        await verifyScrapedData(job.id, data.officials || []);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error(`Error scraping ${job.source}:`, error);
      updateJobStatus(job.id, { 
        status: 'failed', 
        progress: 0 
      });

      toast({
        title: "Scraping Failed",
        description: `Failed to scrape ${job.source}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const verifyScrapedData = async (sourceId: string, officials: any[]) => {
    try {
      // Cross-check with existing database
      const { data: existingOfficials } = await supabase
        .from('politicians')
        .select('id, name, party, term_status')
        .eq('source_type', sourceId);

      let newOfficials = 0;
      let updatedOfficials = 0;
      let flaggedOfficials = 0;

      for (const official of officials) {
        const existing = existingOfficials?.find(p => 
          p.name.toLowerCase().includes(official.name.toLowerCase()) ||
          official.name.toLowerCase().includes(p.name.toLowerCase())
        );

        if (existing) {
          // Update existing official with fresh data
          if (existing.term_status !== 'active' && official.isActive) {
              await supabase
              .from('politicians')
              .update({
                term_status: 'active',
                is_currently_in_office: true,
                last_verified: new Date().toISOString(),
                party: official.party || existing.party || 'Unknown'
              })
              .eq('id', existing.id);
            updatedOfficials++;
          }
        } else if (official.isActive) {
          // Insert new active official
          await supabase
            .from('politicians')
            .insert({
              name: official.name,
              position: official.position,
              party: official.party || 'Unknown',
              term_status: 'active',
              is_currently_in_office: true,
              source_type: sourceId,
              last_verified: new Date().toISOString()
            });
          newOfficials++;
        }
      }

      // Flag officials not found in current scrape
      if (existingOfficials) {
        for (const existing of existingOfficials) {
          const foundInScrape = officials.some(official => 
            official.name.toLowerCase().includes(existing.name.toLowerCase()) ||
            existing.name.toLowerCase().includes(official.name.toLowerCase())
          );

          if (!foundInScrape && existing.term_status === 'active') {
            await supabase
              .from('politicians')
              .update({
                term_status: 'unknown',
                is_currently_in_office: false,
                last_verified: new Date().toISOString()
              })
              .eq('id', existing.id);
            flaggedOfficials++;
          }
        }
      }

      toast({
        title: "Verification Complete",
        description: `${newOfficials} new, ${updatedOfficials} updated, ${flaggedOfficials} flagged as inactive`,
        duration: 5000,
      });

    } catch (error) {
      console.error('Error verifying scraped data:', error);
    }
  };

  const scrapeAllSources = async () => {
    setIsScrapingAll(true);
    
    try {
      // Reset all jobs
      setScrapingJobs(prev => prev.map(job => ({
        ...job,
        status: 'pending' as const,
        progress: 0
      })));

      // Scrape each source sequentially to avoid rate limiting
      for (const job of scrapingJobs) {
        await scrapeGovernmentWebsite(job);
        // Wait between scrapes to be respectful
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      toast({
        title: "All Sources Scraped",
        description: "Government website scraping completed for all sources",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error scraping all sources:', error);
      toast({
        title: "Scraping Error",
        description: "Failed to complete scraping for all sources",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsScrapingAll(false);
    }
  };

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <Globe className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Government Website Scraper
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Extract and verify current officials from Cameroon government websites since they don't provide APIs
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Bulk Operations</span>
          </CardTitle>
          <CardDescription>
            Scrape all government sources and cross-verify with existing database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={scrapeAllSources}
            disabled={isScrapingAll}
            size="lg"
            className="w-full"
          >
            {isScrapingAll ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Scraping All Sources...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Scrape All Government Sources
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Individual Source Cards */}
      <div className="grid gap-6">
        {scrapingJobs.map((job) => (
          <Card key={job.id} className={job.status === 'completed' ? 'border-green-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span>{job.source}</span>
                </CardTitle>
                <Badge variant={getStatusColor(job.status)}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>{job.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                {job.status === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="w-full" />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Officials Found: {job.officialCount}
                    </span>
                  </div>
                  {job.lastScrape && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Last: {new Date(job.lastScrape).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scrapeGovernmentWebsite(job)}
                    disabled={job.status === 'processing' || isScrapingAll}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Scrape Now
                  </Button>
                  {job.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Notice */}
      <Alert className="mt-8">
        <Building className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> Make sure the Firecrawl API key is configured in Supabase Edge Function secrets 
          to enable government website scraping. This system bypasses the lack of official APIs by extracting structured data 
          directly from government web pages.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GovWebsiteScraper;