import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Globe } from "lucide-react";
import { Job } from "@/types/jobs";
import { useApplyToJob } from "@/hooks/useJobs";
import { toast } from "sonner";

interface JobApplicationProps {
  job: Job;
  onBack?: () => void;
  onSuccess?: () => void;
}

export function JobApplication({ job, onBack, onSuccess }: JobApplicationProps) {
  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    cover_letter: "",
    cv_url: "",
    portfolio_url: ""
  });
  
  const applyToJobMutation = useApplyToJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applicant_name || !formData.applicant_email || !formData.cover_letter) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await applyToJobMutation.mutateAsync({
        jobId: job.id,
        coverLetter: formData.cover_letter,
        cvUrl: formData.cv_url,
        portfolioUrl: formData.portfolio_url
      });
      
      toast.success("Application submitted successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <div>
          <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
          <p className="text-muted-foreground">at {job.company_name}</p>
        </div>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.applicant_name}
                    onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.applicant_email}
                    onChange={(e) => handleInputChange("applicant_email", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.applicant_phone}
                  onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cover Letter *</h3>
              <div className="space-y-2">
                <Label htmlFor="cover-letter">
                  Tell us why you're interested in this position
                </Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Write your cover letter here..."
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange("cover_letter", e.target.value)}
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documents & Links</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv">CV/Resume URL</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="cv"
                        placeholder="https://drive.google.com/... or upload link"
                        value={formData.cv_url}
                        onChange={(e) => handleInputChange("cv_url", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your CV to Google Drive, Dropbox, or any cloud storage and paste the share link here
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="portfolio"
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolio_url}
                      onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={applyToJobMutation.isPending}
                className="flex-1"
              >
                {applyToJobMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Application Tips */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Application Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Write a personalized cover letter that shows you've researched the company</p>
          <p>• Highlight specific skills and experiences relevant to this position</p>
          <p>• Make sure your CV is up-to-date and easy to read</p>
          <p>• Double-check all links work and documents are accessible</p>
          <p>• Follow up appropriately if you don't hear back within the timeframe specified</p>
        </CardContent>
      </Card>
    </div>
  );
}