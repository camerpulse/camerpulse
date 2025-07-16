import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, Upload, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const BUSINESS_SECTORS = [
  'Agriculture', 'Banking & Finance', 'Construction', 'Education',
  'Energy & Utilities', 'Healthcare', 'Hospitality & Tourism',
  'Information Technology', 'Manufacturing', 'Mining',
  'Real Estate', 'Retail & Trade', 'Transportation', 'Other'
];

const EMPLOYEE_RANGES = [
  '1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '251-500', '500+'
];

const COMPANY_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor', price: 25000 },
  { value: 'limited_company', label: 'Limited Company', price: 100000 },
  { value: 'public_company', label: 'Public Company', price: 1000000 }
];

const companySchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  company_type: z.enum(['sole_proprietor', 'limited_company', 'public_company']),
  sector: z.string().min(1, 'Please select a business sector'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  physical_address: z.string().min(10, 'Address must be at least 10 characters'),
  region: z.string().min(1, 'Please select a region'),
  division: z.string().min(2, 'Division is required'),
  phone_number: z.string().min(9, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  website_url: z.string().url().optional().or(z.literal('')),
  employee_count_range: z.string().min(1, 'Please select employee range'),
  past_management: z.string().optional(),
  tax_identification_number: z.string().min(8, 'Valid TIN required'),
  estimated_net_worth: z.number().min(0).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: '',
      company_type: 'sole_proprietor',
      sector: '',
      description: '',
      physical_address: '',
      region: '',
      division: '',
      phone_number: '',
      email: user?.email || '',
      website_url: '',
      employee_count_range: '',
      past_management: '',
      tax_identification_number: '',
      estimated_net_worth: 0,
    },
  });

  const selectedCompanyType = form.watch('company_type');
  const selectedTypeInfo = COMPANY_TYPES.find(type => type.value === selectedCompanyType);

  const handleFileUpload = (file: File, type: 'logo' | 'cover') => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(result);
        } else {
          setCoverFile(file);
          setCoverPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register your company",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if company name or TIN already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .or(`company_name.eq.${data.company_name},tax_identification_number.eq.${data.tax_identification_number}`)
        .single();

      if (existingCompany) {
        toast({
          title: "Company Already Exists",
          description: "A company with this name or TIN is already registered",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload files
      let logoUrl = null;
      let coverUrl = null;

      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logos');
      }

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers');
      }

      // Get payment amount
      const paymentAmount = selectedTypeInfo?.price || 25000;

      // Create company record
      const companyData = {
        company_name: data.company_name,
        company_type: data.company_type,
        sector: data.sector,
        description: data.description,
        physical_address: data.physical_address,
        region: data.region,
        division: data.division,
        phone_number: data.phone_number,
        email: data.email,
        website_url: data.website_url || null,
        employee_count_range: data.employee_count_range,
        past_management: data.past_management || null,
        tax_identification_number: data.tax_identification_number,
        estimated_net_worth: data.estimated_net_worth || null,
        user_id: user.id,
        logo_url: logoUrl,
        cover_photo_url: coverUrl,
        payment_amount: paymentAmount,
        social_media_links: {},
      };

      const { data: company, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Registration Submitted",
        description: "Your company registration has been submitted for approval. Please proceed to payment.",
      });

      // Redirect to payment
      navigate(`/company-payment/${company.id}`);

    } catch (error) {
      console.error('Error registering company:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Company Information</h2>
        <p className="text-muted-foreground">Basic details about your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMPANY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.price.toLocaleString()} FCFA
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
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Sector *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BUSINESS_SECTORS.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employee_count_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Employees *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYEE_RANGES.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your company's business, services, and mission..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_identification_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax Identification Number (TIN) *</FormLabel>
            <FormControl>
              <Input placeholder="Enter your TIN" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Contact & Location</h2>
        <p className="text-muted-foreground">How customers can reach your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="company@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="+237 6XX XXX XXX" {...field} />
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
              <FormLabel>Region *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CAMEROON_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division/City *</FormLabel>
              <FormControl>
                <Input placeholder="Enter division or city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="physical_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Physical Address *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Complete physical address with street, neighborhood, etc."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="website_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website URL (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://www.yourcompany.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Additional Details</h2>
        <p className="text-muted-foreground">Optional information to enhance your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Company Logo</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            {logoPreview ? (
              <div className="space-y-2">
                <img src={logoPreview} alt="Logo preview" className="w-20 h-20 mx-auto rounded-lg object-cover" />
                <p className="text-sm text-muted-foreground">Logo uploaded</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload company logo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cover Photo</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            {coverPreview ? (
              <div className="space-y-2">
                <img src={coverPreview} alt="Cover preview" className="w-full h-20 mx-auto rounded-lg object-cover" />
                <p className="text-sm text-muted-foreground">Cover photo uploaded</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload cover photo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="estimated_net_worth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Net Worth (FCFA)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="past_management"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Past Management/Leadership (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Information about previous leadership, founders, etc."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Payment Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Company Type:</span>
              <span className="font-semibold">{selectedTypeInfo?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Listing Fee:</span>
              <span className="font-semibold">{selectedTypeInfo?.price.toLocaleString()} FCFA</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{selectedTypeInfo?.price.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Register Your Company
          </h1>
          <p className="text-lg text-muted-foreground">
            Join the official business network of Cameroon
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNumber
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  stepNumber
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="p-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>

                  {step < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}