import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Shield, AlertTriangle } from 'lucide-react';
import { DocumentUpload } from '@/components/moderators/DocumentUpload';

interface AuditSubmissionFormData {
  document_title: string;
  entity_audited: string;
  fiscal_year: string;
  audit_period_start: string;
  audit_period_end: string;
  audit_summary: string;
  audit_score?: number;
  source_type: string;
  source_organization?: string;
  region?: string;
  tags: string;
  is_anonymous_submission: boolean;
  is_sensitive: boolean;
}

export const AuditSubmissionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AuditSubmissionFormData>();
  
  const isAnonymous = watch('is_anonymous_submission');

  const onSubmit = async (data: AuditSubmissionFormData) => {
    try {
      setIsSubmitting(true);
      
      // Split tags by comma and trim
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { data: audit, error } = await supabase
        .from('audit_registry')
        .insert({
          document_title: data.document_title,
          entity_audited: data.entity_audited,
          fiscal_year: data.fiscal_year,
          audit_period_start: data.audit_period_start || null,
          audit_period_end: data.audit_period_end || null,
          audit_summary: data.audit_summary,
          audit_score: data.audit_score || null,
          source_type: data.source_type as any,
          source_organization: data.source_organization,
          region: data.region,
          tags: tagsArray,
          is_anonymous_submission: data.is_anonymous_submission,
          is_sensitive: data.is_sensitive,
          uploaded_files: uploadedFiles,
          submitted_by: data.is_anonymous_submission ? null : (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Audit submission created successfully! It will be reviewed by administrators.');
      
      // Reset form
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error submitting audit:', error);
      toast.error('Failed to submit audit: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (url: string) => {
    setUploadedFiles(prev => [...prev, url]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Public Audit or Disclosure
        </CardTitle>
        <CardDescription>
          Upload official audit reports, financial reviews, leaked documents, or other accountability disclosures.
          All submissions are reviewed before publication.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document_title">Document Title *</Label>
              <Input
                id="document_title"
                {...register('document_title', { required: 'Document title is required' })}
                placeholder="e.g., Ministry of Health 2023 Financial Audit"
              />
              {errors.document_title && (
                <p className="text-sm text-destructive">{errors.document_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_audited">Entity Audited *</Label>
              <Input
                id="entity_audited"
                {...register('entity_audited', { required: 'Entity audited is required' })}
                placeholder="e.g., Ministry of Health"
              />
              {errors.entity_audited && (
                <p className="text-sm text-destructive">{errors.entity_audited.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscal_year">Fiscal Year</Label>
              <Input
                id="fiscal_year"
                {...register('fiscal_year')}
                placeholder="e.g., 2023"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit_period_start">Period Start</Label>
              <Input
                id="audit_period_start"
                type="date"
                {...register('audit_period_start')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit_period_end">Period End</Label>
              <Input
                id="audit_period_end"
                type="date"
                {...register('audit_period_end')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit_summary">Audit Summary *</Label>
            <Textarea
              id="audit_summary"
              {...register('audit_summary', { required: 'Audit summary is required' })}
              placeholder="Provide a detailed summary of the audit findings, key issues identified, and recommendations..."
              rows={4}
            />
            {errors.audit_summary && (
              <p className="text-sm text-destructive">{errors.audit_summary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Source Type *</Label>
              <Select onValueChange={(value) => setValue('source_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government_official">Government Official</SelectItem>
                  <SelectItem value="third_party_review">Third-Party Review</SelectItem>
                  <SelectItem value="whistleblower_leak">Whistleblower Leak</SelectItem>
                  <SelectItem value="media_report">Media Report</SelectItem>
                  <SelectItem value="user_submitted">User Submitted</SelectItem>
                  <SelectItem value="investigative_journalism">Investigative Journalism</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_organization">Source Organization</Label>
              <Input
                id="source_organization"
                {...register('source_organization')}
                placeholder="e.g., World Bank, BEAC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit_score">Audit Score (0-100)</Label>
              <Input
                id="audit_score"
                type="number"
                min="0"
                max="100"
                {...register('audit_score', { valueAsNumber: true })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={(value) => setValue('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adamawa">Adamawa</SelectItem>
                  <SelectItem value="Centre">Centre</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="Far North">Far North</SelectItem>
                  <SelectItem value="Littoral">Littoral</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="Northwest">Northwest</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g., corruption, transparency, financial"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Document Upload</Label>
            <DocumentUpload
              userId="audit-submission"
              onUploadComplete={handleFileUpload}
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/csv', 'application/vnd.ms-excel']}
            />
            {uploadedFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {uploadedFiles.length} file(s) uploaded
              </div>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_anonymous_submission"
                {...register('is_anonymous_submission')}
                onCheckedChange={(checked) => setValue('is_anonymous_submission', checked as boolean)}
              />
              <Label htmlFor="is_anonymous_submission" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Submit anonymously (whistleblower protection)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_sensitive"
                {...register('is_sensitive')}
                onCheckedChange={(checked) => setValue('is_sensitive', checked as boolean)}
              />
              <Label htmlFor="is_sensitive" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Contains sensitive information
              </Label>
            </div>
          </div>

          {isAnonymous && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Shield className="w-4 h-4 inline mr-2" />
                Your identity will be protected. This submission will not be linked to your account.
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};