import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, MapPin, Upload, Shield, Heart, FileText, 
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  village_of_origin: z.string().min(2, 'Village name required'),
  region_of_residence: z.string().min(2, 'Region required'),
  civic_experience: z.string().min(10, 'Please describe your civic experience'),
  preferred_coverage_area: z.string().min(2, 'Coverage area required'),
  preferred_role: z.enum(['village_moderator', 'subdivision_moderator', 'regional_moderator']),
  civic_oath_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Civic Oath'
  })
});

type FormData = z.infer<typeof formSchema>;

interface ModeratorApplicationFormProps {
  onSuccess?: () => void;
}

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const ModeratorApplicationForm: React.FC<ModeratorApplicationFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      village_of_origin: '',
      region_of_residence: '',
      civic_experience: '',
      preferred_coverage_area: '',
      preferred_role: 'village_moderator',
      civic_oath_accepted: false
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `moderator-applications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setUploadedFile(publicUrl);
      toast.success('ID document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit application');
        return;
      }

      const { error } = await supabase
        .from('moderator_applications')
        .insert({
          user_id: user.id,
          full_name: data.full_name,
          village_of_origin: data.village_of_origin,
          region_of_residence: data.region_of_residence,
          civic_experience: data.civic_experience,
          preferred_coverage_area: data.preferred_coverage_area,
          preferred_role: data.preferred_role,
          civic_oath_accepted: data.civic_oath_accepted,
          id_document_url: uploadedFile
        });

      if (error) throw error;

      toast.success('Application submitted successfully! You will be contacted within 5-7 business days.');
      form.reset();
      setUploadedFile(null);
      onSuccess?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const civicOathText = `I solemnly swear to serve as a Civic Moderator with integrity, transparency, and dedication to the truth. I will verify information fairly, respect all citizens regardless of political affiliation, and work to build a more informed and connected Cameroon. I will not use my role for personal gain or to spread misinformation.`;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-civic/10 rounded-full w-fit">
          <Shield className="h-8 w-8 text-civic" />
        </div>
        <CardTitle className="text-2xl font-bold">Become a Civic Moderator</CardTitle>
        <p className="text-muted-foreground">
          Join our decentralized civic data corps and help ensure trustworthy information about villages, 
          projects, and civic activities across Cameroon.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full legal name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="village_of_origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village of Origin</FormLabel>
                      <FormControl>
                        <Input placeholder="Your home village" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region_of_residence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region of Residence</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your region" />
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
              </div>
            </div>

            {/* Civic Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Civic Background
              </h3>

              <FormField
                control={form.control}
                name="civic_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Past Civic or Leadership Involvement</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your experience in community leadership, civic organizations, volunteering, or any relevant background that demonstrates your commitment to public service..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Moderation Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Moderation Preferences
              </h3>

              <FormField
                control={form.control}
                name="preferred_coverage_area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Coverage Area</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Douala Urban, Bamenda Villages, Southwest Coast..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Moderator Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="village_moderator">
                          <div className="flex flex-col">
                            <span className="font-medium">Village Moderator</span>
                            <span className="text-sm text-muted-foreground">
                              Manage specific villages and local projects
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="subdivision_moderator">
                          <div className="flex flex-col">
                            <span className="font-medium">Subdivision Moderator</span>
                            <span className="text-sm text-muted-foreground">
                              Oversee 5-20 villages, approve submissions
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="regional_moderator">
                          <div className="flex flex-col">
                            <span className="font-medium">Regional Moderator</span>
                            <span className="text-sm text-muted-foreground">
                              Manage entire region, handle complex disputes
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ID Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Identity Verification
              </h3>

              <div className="space-y-2">
                <Label htmlFor="id-upload">Upload ID Document (Optional but Recommended)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="id-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-civic/10 file:text-civic hover:file:bg-civic/20"
                  />
                  {uploadedFile && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your National ID, Passport, or Driver's License for verification.
                </p>
              </div>
            </div>

            {/* Civic Oath */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Civic Oath
              </h3>

              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-civic">
                <p className="text-sm italic leading-relaxed">
                  {civicOathText}
                </p>
              </div>

              <FormField
                control={form.control}
                name="civic_oath_accepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        I accept the Civic Oath and commit to upholding these principles
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Moderator Application
                  </>
                )}
              </Button>
              
              <div className="mt-4 p-3 bg-info/10 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-info mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-info-foreground">
                    <p className="font-medium">What happens next?</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Admin review within 5-7 business days</li>
                      <li>• Possible video interview for regional roles</li>
                      <li>• Email notification of approval/rejection</li>
                      <li>• Immediate dashboard access upon approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};