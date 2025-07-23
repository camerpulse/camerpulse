import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Company {
  id?: string;
  company_name: string;
  company_registration_number?: string;
  company_type: string;
  industry_sector?: string;
  company_size: string;
  website_url?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country: string;
  business_description?: string;
  tax_id?: string;
  verification_status: string;
  annual_revenue_fcfa?: number;
  employee_count?: number;
  founding_year?: number;
  contact_person_name?: string;
  contact_person_position?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  can_bid: boolean;
  can_issue_tenders: boolean;
}

const INDUSTRY_SECTORS = [
  'Construction & Infrastructure',
  'Information Technology',
  'Healthcare & Medical',
  'Education & Training',
  'Agriculture & Food',
  'Manufacturing',
  'Transportation & Logistics',
  'Financial Services',
  'Energy & Utilities',
  'Telecommunications',
  'Real Estate',
  'Consulting & Professional Services',
  'Retail & Commerce',
  'Tourism & Hospitality',
  'Media & Entertainment',
  'Non-Profit & NGO',
  'Government & Public Sector',
  'Other'
];

const COMPANY_SIZES = [
  'micro', 'small', 'medium', 'large', 'enterprise'
];

const COMPANY_TYPES = [
  'private', 'public', 'partnership', 'sole_proprietorship', 'cooperative', 'ngo', 'government'
];

export const CompanyProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company>({
    company_name: '',
    company_type: 'private',
    company_size: 'small',
    country: 'Cameroon',
    verification_status: 'pending',
    can_bid: false,
    can_issue_tenders: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
    }
  }, [user]);

  const fetchCompanyProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCompany(data);
      setHasCompany(true);
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const companyData = {
        ...company,
        user_id: user.id
      };

      let result;
      if (hasCompany) {
        result = await supabase
          .from('companies')
          .update(companyData)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('companies')
          .insert([companyData]);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Success',
        description: hasCompany ? 'Company profile updated successfully.' : 'Company profile created successfully.',
      });

      setHasCompany(true);
      setIsEditing(false);
      await fetchCompanyProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof Company, value: any) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!hasCompany && !isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Building2 className="h-8 w-8 mr-3 text-primary" />
              Create Company Profile
            </CardTitle>
            <CardDescription>
              Create a company profile to participate in the tender platform as a bidder or issuer
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              You haven't created a company profile yet. Create one to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
              <li>• Submit bids on tenders</li>
              <li>• Issue your own tenders</li>
              <li>• Get verified as a legitimate business</li>
              <li>• Access advanced features</li>
            </ul>
            <Button onClick={() => setIsEditing(true)} size="lg">
              <Building2 className="h-4 w-4 mr-2" />
              Create Company Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-primary" />
              Company Profile
            </h1>
            <p className="text-muted-foreground">Manage your company information and verification status</p>
          </div>
          {hasCompany && (
            <div className="flex items-center space-x-3">
              {getVerificationStatusBadge(company.verification_status)}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic company details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={company.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_registration_number">Registration Number</Label>
                <Input
                  id="company_registration_number"
                  value={company.company_registration_number || ''}
                  onChange={(e) => updateField('company_registration_number', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="company_type">Company Type</Label>
                <Select 
                  value={company.company_type} 
                  onValueChange={(value) => updateField('company_type', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company_size">Company Size</Label>
                <Select 
                  value={company.company_size} 
                  onValueChange={(value) => updateField('company_size', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map(size => (
                      <SelectItem key={size} value={size}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry_sector">Industry Sector</Label>
                <Select 
                  value={company.industry_sector || ''} 
                  onValueChange={(value) => updateField('industry_sector', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={company.business_description || ''}
                onChange={(e) => updateField('business_description', e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={company.website_url || ''}
                  onChange={(e) => updateField('website_url', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={company.phone_number || ''}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Company physical address and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                value={company.address_line1 || ''}
                onChange={(e) => updateField('address_line1', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                value={company.address_line2 || ''}
                onChange={(e) => updateField('address_line2', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={company.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={company.region || ''} 
                  onValueChange={(value) => updateField('region', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adamawa">Adamawa</SelectItem>
                    <SelectItem value="centre">Centre</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="far_north">Far North</SelectItem>
                    <SelectItem value="littoral">Littoral</SelectItem>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="northwest">Northwest</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="southwest">Southwest</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={company.postal_code || ''}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Person</CardTitle>
            <CardDescription>Primary contact person for this company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person_name">Contact Person Name</Label>
                <Input
                  id="contact_person_name"
                  value={company.contact_person_name || ''}
                  onChange={(e) => updateField('contact_person_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="contact_person_position">Position</Label>
                <Input
                  id="contact_person_position"
                  value={company.contact_person_position || ''}
                  onChange={(e) => updateField('contact_person_position', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person_email">Contact Email</Label>
                <Input
                  id="contact_person_email"
                  type="email"
                  value={company.contact_person_email || ''}
                  onChange={(e) => updateField('contact_person_email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="contact_person_phone">Contact Phone</Label>
                <Input
                  id="contact_person_phone"
                  value={company.contact_person_phone || ''}
                  onChange={(e) => updateField('contact_person_phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification & Permissions</CardTitle>
            <CardDescription>Company verification status and platform permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  {company.verification_status === 'verified' && 'Your company has been verified and can participate in tenders.'}
                  {company.verification_status === 'pending' && 'Your company verification is pending review.'}
                  {company.verification_status === 'rejected' && 'Your company verification was rejected. Please contact support.'}
                </p>
              </div>
              {getVerificationStatusBadge(company.verification_status)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Can Submit Bids</p>
                  <p className="text-sm text-muted-foreground">Ability to bid on tenders</p>
                </div>
                <Badge variant={company.can_bid ? 'default' : 'secondary'}>
                  {company.can_bid ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Can Issue Tenders</p>
                  <p className="text-sm text-muted-foreground">Ability to create and manage tenders</p>
                </div>
                <Badge variant={company.can_issue_tenders ? 'default' : 'secondary'}>
                  {company.can_issue_tenders ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            {company.verification_status === 'pending' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Your company verification is under review. You'll be notified once the review is complete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};