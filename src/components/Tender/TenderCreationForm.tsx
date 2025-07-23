import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const tenderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  organization_name: z.string().min(1, 'Organization name is required'),
  organization_email: z.string().email('Valid email is required'),
  organization_contact: z.string().optional(),
  estimated_value_fcfa: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('XAF'),
  region: z.string().optional(),
  location_details: z.string().optional(),
  scope_of_work: z.string().optional(),
  submission_deadline: z.string().min(1, 'Submission deadline is required'),
  opening_date: z.string().optional(),
  project_start_date: z.string().optional(),
  project_end_date: z.string().optional(),
  minimum_qualification: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  evaluation_criteria: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  category_id: z.string().optional(),
});

type TenderFormData = z.infer<typeof tenderSchema>;

interface TenderCreationFormProps {
  onSuccess?: () => void;
}

export const TenderCreationForm: React.FC<TenderCreationFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const navigate = useNavigate();

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      currency: 'XAF',
    },
  });

  React.useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('tender_categories')
        .select('id, name')
        .eq('is_active', true);
      
      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: TenderFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a tender');
        return;
      }

      // Generate a reference number
      const referenceNumber = `TND-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const tenderData = {
        ...data,
        reference_number: referenceNumber,
        created_by: user.id,
        status: 'draft',
        submission_deadline: new Date(data.submission_deadline).toISOString(),
        opening_date: data.opening_date ? new Date(data.opening_date).toISOString() : null,
        project_start_date: data.project_start_date ? new Date(data.project_start_date).toISOString() : null,
        project_end_date: data.project_end_date ? new Date(data.project_end_date).toISOString() : null,
      };

      const { data: tender, error } = await supabase
        .from('tenders')
        .insert([tenderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating tender:', error);
        toast.error('Failed to create tender');
        return;
      }

      toast.success('Tender created successfully!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/tenders/${tender.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Tender</CardTitle>
        <CardDescription>
          Fill in the details to create a new tender opportunity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tender Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tender title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the tender"
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
                name="organization_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization issuing the tender" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@organization.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name="estimated_value_fcfa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
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
                    <FormControl>
                      <Input placeholder="Project region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submission_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Deadline</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tenders')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Tender'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};