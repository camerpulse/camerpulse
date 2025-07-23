import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVerification } from '@/hooks/useVerification';
import { Shield, Building, IdCard, Phone, MapPin, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';

export const VerificationCenter: React.FC = () => {
  const { 
    verificationRequests, 
    businessVerifications, 
    loading, 
    submitIdentityVerification, 
    submitBusinessVerification 
  } = useVerification();

  const [identityForm, setIdentityForm] = useState({
    documentType: '',
    documentNumber: '',
    additionalInfo: ''
  });

  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_type: '',
    registration_number: '',
    tax_id: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    website_url: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'needs_review':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success';
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      case 'needs_review':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitIdentityVerification([], identityForm);
      setIdentityForm({ documentType: '', documentNumber: '', additionalInfo: '' });
    } catch (error) {
      console.error('Error submitting identity verification:', error);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitBusinessVerification(businessForm);
      setBusinessForm({
        business_name: '',
        business_type: '',
        registration_number: '',
        tax_id: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        website_url: ''
      });
    } catch (error) {
      console.error('Error submitting business verification:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Verification Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <IdCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Verify your identity to access premium features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Business</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Verify your business to participate in tenders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Verify your location for local opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity">Identity Verification</TabsTrigger>
          <TabsTrigger value="business">Business Verification</TabsTrigger>
          <TabsTrigger value="status">Verification Status</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                Submit your identity documents for verification to unlock premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIdentitySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input
                    id="documentType"
                    placeholder="e.g., National ID, Passport, Driver's License"
                    value={identityForm.documentType}
                    onChange={(e) => setIdentityForm({...identityForm, documentType: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Document Number</Label>
                  <Input
                    id="documentNumber"
                    placeholder="Enter document number"
                    value={identityForm.documentNumber}
                    onChange={(e) => setIdentityForm({...identityForm, documentNumber: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional information that might help with verification"
                    value={identityForm.additionalInfo}
                    onChange={(e) => setIdentityForm({...identityForm, additionalInfo: e.target.value})}
                  />
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload documents or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Submit Identity Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Verification</CardTitle>
              <CardDescription>
                Verify your business to participate in government tenders and contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter business name"
                      value={businessForm.business_name}
                      onChange={(e) => setBusinessForm({...businessForm, business_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., LLC, Corporation, Partnership"
                      value={businessForm.business_type}
                      onChange={(e) => setBusinessForm({...businessForm, business_type: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="Business registration number"
                      value={businessForm.registration_number}
                      onChange={(e) => setBusinessForm({...businessForm, registration_number: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      placeholder="Tax identification number"
                      value={businessForm.tax_id}
                      onChange={(e) => setBusinessForm({...businessForm, tax_id: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    placeholder="Enter complete business address"
                    value={businessForm.business_address}
                    onChange={(e) => setBusinessForm({...businessForm, business_address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      placeholder="+237 6XX XXX XXX"
                      value={businessForm.business_phone}
                      onChange={(e) => setBusinessForm({...businessForm, business_phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="business@company.com"
                      value={businessForm.business_email}
                      onChange={(e) => setBusinessForm({...businessForm, business_email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://www.yourcompany.com"
                    value={businessForm.website_url}
                    onChange={(e) => setBusinessForm({...businessForm, website_url: e.target.value})}
                  />
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload business documents (Registration, Tax Certificate, etc.)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted: PDF, JPG, PNG (Max 10MB each)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Submit Business Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification Requests</CardTitle>
                <CardDescription>Track the status of your identity verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                {verificationRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No identity verification requests found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {verificationRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <p className="font-medium capitalize">{request.verification_type} Verification</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Verification Requests</CardTitle>
                <CardDescription>Track the status of your business verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                {businessVerifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No business verification requests found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {businessVerifications.map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(verification.status)}
                          <div>
                            <p className="font-medium">{verification.business_name}</p>
                            <p className="text-sm text-muted-foreground">{verification.business_type}</p>
                            {verification.rejection_reason && (
                              <p className="text-sm text-destructive mt-1">{verification.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(verification.status)}>
                          {verification.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};