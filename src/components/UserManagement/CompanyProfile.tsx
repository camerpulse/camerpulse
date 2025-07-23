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

// Use flexible type to work with existing database schema
type Company = any;

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

export const CompanyProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>({
    company_name: ''
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

  const updateField = (field: string, value: any) => {
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
              Create a company profile to participate in the tender platform
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
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
            <p className="text-muted-foreground">Manage your company information</p>
          </div>
          {hasCompany && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={company.company_name || ''}
                onChange={(e) => updateField('company_name', e.target.value)}
                disabled={!isEditing}
                required
              />
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

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={company.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={company.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="physical_address">Address</Label>
              <Textarea
                id="physical_address"
                value={company.physical_address || ''}
                onChange={(e) => updateField('physical_address', e.target.value)}
                disabled={!isEditing}
                rows={2}
              />
            </div>
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