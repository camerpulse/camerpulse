import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, FileCheck, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/Tenders/FileUpload';

interface BusinessVerification {
  id: string;
  company_name: string;
  company_type: string;
  registration_number: string;
  tax_identification_number?: string;
  business_address: string;
  phone_number: string;
  email: string;
  industry_sector: string;
  verification_status: string;
  verification_level: string;
  documents_submitted: any;
  verification_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

const companyTypes = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'ngo', label: 'NGO/Non-Profit' }
];

const industrySectors = [
  'Construction & Engineering',
  'Information Technology',
  'Healthcare & Medical',
  'Education & Training',
  'Agriculture & Food',
  'Manufacturing',
  'Transportation & Logistics',
  'Financial Services',
  'Energy & Utilities',
  'Consulting Services',
  'Retail & Commerce',
  'Other'
];

const statusColors = {
  pending: 'default',
  in_review: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  needs_clarification: 'outline'
} as const;

const statusIcons = {
  pending: Clock,
  in_review: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  needs_clarification: AlertCircle
};

export default function BusinessVerification() {
  const [verification, setVerification] = useState<BusinessVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    registration_number: '',
    tax_identification_number: '',
    business_address: '',
    phone_number: '',
    email: '',
    industry_sector: ''
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessVerification();
  }, []);

  const loadBusinessVerification = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('business_verifications')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setVerification(data);
        setFormData({
          company_name: data.company_name || '',
          company_type: data.company_type || '',
          registration_number: data.registration_number || '',
          tax_identification_number: data.tax_identification_number || '',
          business_address: data.business_address || '',
          phone_number: data.phone_number || '',
          email: data.email || '',
          industry_sector: data.industry_sector || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading business verification:', error);
      toast({
        title: "Error",
        description: "Failed to load business verification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const submissionData = {
        ...formData,
        user_id: user.user.id,
        documents_submitted: uploadedDocuments,
        verification_status: verification ? verification.verification_status : 'pending'
      };

      let result;
      if (verification) {
        // Update existing verification
        result = await supabase
          .from('business_verifications')
          .update(submissionData)
          .eq('id', verification.id)
          .select()
          .single();
      } else {
        // Create new verification
        result = await supabase
          .from('business_verifications')
          .insert(submissionData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setVerification(result.data);
      toast({
        title: "Success",
        description: verification ? "Business verification updated successfully" : "Business verification submitted successfully",
      });

    } catch (error: any) {
      console.error('Error submitting business verification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit business verification",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (files: any[]) => {
    setUploadedDocuments(files);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading business verification...</div>
      </div>
    );
  }

  const StatusIcon = verification ? statusIcons[verification.verification_status as keyof typeof statusIcons] : Clock;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Business Verification</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verify your business to participate in tenders and build trust with potential partners.
            Complete verification unlocks premium features and increases your credibility.
          </p>
        </div>

        {/* Status Card */}
        {verification && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">Verification Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColors[verification.verification_status as keyof typeof statusColors]}>
                  {verification.verification_status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {verification.verification_notes && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <p className="text-sm">{verification.verification_notes}</p>
                </div>
              )}
              
              {verification.rejection_reason && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Rejection Reason</h4>
                  <p className="text-sm text-destructive">{verification.rejection_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Provide accurate information about your business. All fields are required for verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    required
                    disabled={verification?.verification_status === 'approved'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select
                    value={formData.company_type}
                    onValueChange={(value) => handleInputChange('company_type', value)}
                    disabled={verification?.verification_status === 'approved'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    required
                    disabled={verification?.verification_status === 'approved'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_identification_number">Tax ID Number</Label>
                  <Input
                    id="tax_identification_number"
                    value={formData.tax_identification_number}
                    onChange={(e) => handleInputChange('tax_identification_number', e.target.value)}
                    disabled={verification?.verification_status === 'approved'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    required
                    disabled={verification?.verification_status === 'approved'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={verification?.verification_status === 'approved'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry_sector">Industry Sector *</Label>
                  <Select
                    value={formData.industry_sector}
                    onValueChange={(value) => handleInputChange('industry_sector', value)}
                    disabled={verification?.verification_status === 'approved'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {industrySectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address">Business Address *</Label>
                <Textarea
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) => handleInputChange('business_address', e.target.value)}
                  required
                  disabled={verification?.verification_status === 'approved'}
                  rows={3}
                />
              </div>

              <Separator />

              {/* Document Upload */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload the following documents to complete your business verification:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Business registration certificate</li>
                    <li>• Tax identification certificate (if applicable)</li>
                    <li>• Proof of business address</li>
                    <li>• Company profile or brochure</li>
                    <li>• Bank statement or financial documents</li>
                  </ul>
                </div>

                <FileUpload
                  bucket="business-verification"
                  folder="documents"
                  maxFiles={10}
                  maxSize={5}
                  onUploadComplete={handleDocumentUpload}
                  disabled={verification?.verification_status === 'approved'}
                />
              </div>

              {/* Submit Button */}
              {verification?.verification_status !== 'approved' && (
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="px-8"
                  >
                    {saving ? 'Saving...' : verification ? 'Update Verification' : 'Submit for Verification'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Verification Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Benefits</CardTitle>
            <CardDescription>
              Unlock these benefits by completing your business verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Enhanced Credibility</h4>
                <p className="text-sm text-muted-foreground">
                  Display verified badge on your profile and increase trust with tender issuers
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Priority Access</h4>
                <p className="text-sm text-muted-foreground">
                  Get early access to premium tenders and exclusive opportunities
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Business Growth</h4>
                <p className="text-sm text-muted-foreground">
                  Access to analytics, networking tools, and business development resources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}