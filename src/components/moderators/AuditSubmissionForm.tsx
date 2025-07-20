import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUpload } from './DocumentUpload';

const auditSubmissionSchema = z.object({
  document_title: z.string().min(1, 'Title is required'),
  entity_audited: z.string().min(1, 'Entity is required'),
  fiscal_year: z.string().optional(),
  audit_period_start: z.string().optional(),
  audit_period_end: z.string().optional(),
  audit_summary: z.string().optional(),
  audit_score: z.number().min(0).max(10).optional(),
  source_type: z.enum(['government_official', 'third_party_review', 'whistleblower_leak', 'media_report', 'user_submitted', 'investigative_journalism']),
  source_organization: z.string().optional(),
  region: z.string().optional(),
  is_anonymous_submission: z.boolean().default(false),
  is_sensitive: z.boolean().default(false),
});

type AuditSubmissionForm = z.infer<typeof auditSubmissionSchema>;

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const AuditSubmissionForm = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuditSubmissionForm>({
    resolver: zodResolver(auditSubmissionSchema),
    defaultValues: {
      is_anonymous_submission: false,
      is_sensitive: false,
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (url: string) => {
    setUploadedFiles([...uploadedFiles, url]);
  };

  const onSubmit = async (data: AuditSubmissionForm) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to submit an audit');
        return;
      }

      const auditData = {
        document_title: data.document_title,
        entity_audited: data.entity_audited,
        fiscal_year: data.fiscal_year || null,
        audit_period_start: data.audit_period_start || null,
        audit_period_end: data.audit_period_end || null,
        audit_summary: data.audit_summary || null,
        audit_score: data.audit_score || null,
        source_type: data.source_type,
        source_organization: data.source_organization || null,
        region: data.region || null,
        tags: tags.length > 0 ? tags : null,
        uploaded_files: JSON.stringify(uploadedFiles),
        submitted_by: user.id,
        status: 'pending_review' as const,
        is_anonymous_submission: data.is_anonymous_submission,
        is_sensitive: data.is_sensitive,
      };

      const { error } = await supabase
        .from('audit_registry')
        .insert(auditData);

      if (error) throw error;

      toast.success('Audit submitted successfully for review');
      form.reset();
      setTags([]);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error submitting audit:', error);
      toast.error('Failed to submit audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Audit Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="document_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter audit report title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entity_audited"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Audited *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ministry, Department, or Organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiscal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiscal Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cameroonRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="government_official">Government Official</SelectItem>
                        <SelectItem value="third_party_review">Third Party Review</SelectItem>
                        <SelectItem value="whistleblower_leak">Whistleblower Leak</SelectItem>
                        <SelectItem value="media_report">Media Report</SelectItem>
                        <SelectItem value="user_submitted">User Submitted</SelectItem>
                        <SelectItem value="investigative_journalism">Investigative Journalism</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., World Bank, Transparency International" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="audit_period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Period Start</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audit_period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Period End</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audit_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Score (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter score"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="audit_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize the key findings of the audit"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <DocumentUpload onFileUpload={handleFileUpload} />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_anonymous_submission"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Anonymous Submission</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Hide submitter identity for whistleblower protection
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_sensitive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sensitive Content</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Contains sensitive information requiring careful handling
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Audit for Review'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
