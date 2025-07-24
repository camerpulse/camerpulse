import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApplyToJob } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/types/jobs';
import { Upload, FileText, ExternalLink } from 'lucide-react';

interface JobApplicationProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export const JobApplication: React.FC<JobApplicationProps> = ({ job, isOpen, onClose }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  const { toast } = useToast();
  const applyMutation = useApplyToJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      toast({
        title: "Cover Letter Required",
        description: "Please provide a cover letter for your application.",
        variant: "destructive"
      });
      return;
    }

    applyMutation.mutate({
      jobId: job.id,
      coverLetter,
      cvUrl: cvUrl || undefined,
      portfolioUrl: portfolioUrl || undefined
    }, {
      onSuccess: () => {
        toast({
          title: "Application Submitted",
          description: "Your application has been sent successfully!",
        });
        onClose();
        // Reset form
        setCoverLetter('');
        setCvUrl('');
        setPortfolioUrl('');
      },
      onError: (error: any) => {
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application",
          variant: "destructive"
        });
      }
    });
  };

  const handleExternalApply = () => {
    if (job.external_apply_url) {
      window.open(job.external_apply_url, '_blank');
      onClose();
    }
  };

  // If job has external application URL, show external apply option
  if (job.external_apply_url) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This position requires you to apply directly on the company's website.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleExternalApply} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply on Company Site
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter *</Label>
            <Textarea
              id="cover-letter"
              placeholder="Tell us why you're interested in this position and how your skills match the requirements..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cv-url">CV/Resume URL</Label>
            <Input
              id="cv-url"
              type="url"
              placeholder="https://drive.google.com/... or https://dropbox.com/..."
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share a link to your CV/Resume (Google Drive, Dropbox, personal website, etc.)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-url">Portfolio URL</Label>
            <Input
              id="portfolio-url"
              type="url"
              placeholder="https://yourportfolio.com or https://github.com/username"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share a link to your portfolio, GitHub, or relevant work samples
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Application Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tailor your cover letter to this specific position</li>
              <li>• Ensure your CV/Resume link is publicly accessible</li>
              <li>• Include relevant projects or achievements</li>
              <li>• Double-check all URLs before submitting</li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={applyMutation.isPending}
              className="flex-1"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};