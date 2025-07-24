import React, { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton } from '@/components/ui/mobile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, MapPin, Phone, Mail, Globe, Users, CreditCard } from 'lucide-react';

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const COMPANY_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' }, 
  { value: 'limited_company', label: 'Limited Company' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government Entity' }
];

const SECTORS = [
  'Technology', 'Agriculture', 'Manufacturing', 'Finance', 'Healthcare',
  'Education', 'Construction', 'Transportation', 'Tourism', 'Energy',
  'Mining', 'Telecommunications', 'Media', 'Retail', 'Other'
];

const EMPLOYEE_RANGES = [
  '1-10', '11-50', '51-200', '201-500', '500+'
];

interface CompanyRegistrationProps {
  onSuccess?: () => void;
}

export const CompanyRegistration: React.FC<CompanyRegistrationProps> = ({ onSuccess }) => {
  const { registerCompany, loading } = useCompanies();
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    sector: '',
    description: '',
    physical_address: '',
    region: '',
    division: '',
    phone_number: '',
    email: '',
    website_url: '',
    employee_count_range: '',
    tax_identification_number: '',
    social_media_links: {
      facebook: '',
      twitter: '',
      linkedin: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await registerCompany({
      ...formData,
      company_type: formData.company_type as any,
      social_media_links: Object.fromEntries(
        Object.entries(formData.social_media_links).filter(([_, value]) => value.trim() !== '')
      )
    });

    if (result.success) {
      onSuccess?.();
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLinks = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [platform]: value
      }
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Register Your Company</CardTitle>
        <CardDescription>
          Join CamerPulse Jobs as an employer and start posting job opportunities
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <MobileForm onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </h3>
              
              <MobileFormField label="Company Name" required>
                <MobileInput
                  value={formData.company_name}
                  onChange={(e) => updateFormData('company_name', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Company Type" required>
                <Select value={formData.company_type} onValueChange={(value) => updateFormData('company_type', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>

              <MobileFormField label="Sector" required>
                <Select value={formData.sector} onValueChange={(value) => updateFormData('sector', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>

              <MobileFormField label="Company Description">
                <MobileTextarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Brief description of your company"
                />
              </MobileFormField>
            </div>

            {/* Location & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Contact
              </h3>
              
              <MobileFormField label="Physical Address" required>
                <MobileTextarea
                  value={formData.physical_address}
                  onChange={(e) => updateFormData('physical_address', e.target.value)}
                  placeholder="Enter complete physical address"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Region" required>
                <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>

              <MobileFormField label="Division" required>
                <MobileInput
                  value={formData.division}
                  onChange={(e) => updateFormData('division', e.target.value)}
                  placeholder="Enter division"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Phone Number" required>
                <MobileInput
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => updateFormData('phone_number', e.target.value)}
                  placeholder="+237 XXX XXX XXX"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Email Address" required>
                <MobileInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="company@example.com"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Website URL">
                <MobileInput
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => updateFormData('website_url', e.target.value)}
                  placeholder="https://www.company.com"
                />
              </MobileFormField>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Company Details
              </h3>
              
              <MobileFormField label="Employee Count" required>
                <Select value={formData.employee_count_range} onValueChange={(value) => updateFormData('employee_count_range', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select employee range" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>

              <MobileFormField label="Tax ID Number" required>
                <MobileInput
                  value={formData.tax_identification_number}
                  onChange={(e) => updateFormData('tax_identification_number', e.target.value)}
                  placeholder="Enter tax identification number"
                  required
                />
              </MobileFormField>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media (Optional)
              </h3>
              
              <MobileFormField label="Facebook">
                <MobileInput
                  value={formData.social_media_links.facebook}
                  onChange={(e) => updateSocialLinks('facebook', e.target.value)}
                  placeholder="https://facebook.com/company"
                />
              </MobileFormField>

              <MobileFormField label="LinkedIn">
                <MobileInput
                  value={formData.social_media_links.linkedin}
                  onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/company"
                />
              </MobileFormField>

              <MobileFormField label="Twitter">
                <MobileInput
                  value={formData.social_media_links.twitter}
                  onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                  placeholder="https://twitter.com/company"
                />
              </MobileFormField>
            </div>
          </div>

          {/* Registration Fee Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">Registration Fee</span>
            </div>
            <p className="text-blue-700 text-sm">
              A registration fee of <strong>25,000 FCFA</strong> is required to activate your company profile 
              and gain access to post jobs. Payment instructions will be provided after registration.
            </p>
          </div>

          <MobileButton 
            type="submit" 
            className="w-full mt-6" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Company'}
          </MobileButton>
        </MobileForm>
      </CardContent>
    </Card>
  );
};