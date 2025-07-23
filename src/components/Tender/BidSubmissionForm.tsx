import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, FileText, X } from 'lucide-react';

const bidSchema = z.object({
  bid_amount_fcfa: z.number().min(1, 'Bid amount is required'),
  proposal_summary: z.string().min(1, 'Proposal summary is required'),
  technical_approach: z.string().optional(),
  timeline_weeks: z.number().min(1, 'Timeline is required'),
  company_name: z.string().min(1, 'Company name is required'),
  company_registration: z.string().optional(),
  contact_person: z.string().min(1, 'Contact person is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  experience_years: z.number().min(0, 'Experience years must be 0 or more'),
  team_size: z.number().min(1, 'Team size must be at least 1'),
  additional_notes: z.string().optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

interface BidSubmissionFormProps {
  tenderId?: string;
}

export const BidSubmissionForm: React.FC<BidSubmissionFormProps> = ({ tenderId: propTenderId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tender, setTender] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const tenderId = propTenderId || id;

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      experience_years: 0,
      team_size: 1,
    },
  });

  useEffect(() => {
    if (tenderId) {
      fetchTender();
    }
  }, [tenderId]);

  const fetchTender = async () => {
    if (!tenderId) return;

    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single();

    if (error) {
      console.error('Error fetching tender:', error);
      toast.error('Failed to load tender details');
      navigate('/tenders');
      return;
    }

    setTender(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${tenderId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('bid-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload file');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('bid-documents')
        .getPublicUrl(filePath);

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        url: urlData.publicUrl
      }]);

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // Extract file path from URL for deletion
    const urlParts = fileToRemove.url.split('/');
    const filePath = urlParts.slice(-2).join('/');
    
    try {
      await supabase.storage
        .from('bid-documents')
        .remove([filePath]);
      
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      toast.success('File removed');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    }
  };

  const onSubmit = async (data: BidFormData) => {
    if (!tenderId) {
      toast.error('Tender ID is missing');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to submit a bid');
        return;
      }

      const bidData = {
        tender_id: tenderId,
        bidder_user_id: user.id,
        ...data,
        documents: uploadedFiles,
        status: 'submitted',
      };

      const { error } = await supabase
        .from('tender_bids')
        .insert([bidData]);

      if (error) {
        console.error('Error submitting bid:', error);
        toast.error('Failed to submit bid');
        return;
      }

      // Update tender bid count
      const { error: updateError } = await supabase
        .from('tenders')
        .update({ bids_count: tender.bids_count + 1 })
        .eq('id', tenderId);

      if (updateError) {
        console.error('Error updating bid count:', updateError);
      }

      toast.success('Bid submitted successfully!');
      navigate(`/tenders/${tenderId}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tender) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Bid</CardTitle>
        <CardDescription>
          Submit your bid for: {tender.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bid_amount_fcfa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Amount (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline_weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (Weeks)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Main contact person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+237 XXX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="proposal_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief summary of your proposal"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technical_approach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technical Approach (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your technical approach"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Upload proposals, certificates, and other documents
                  </div>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/tenders/${tenderId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};