import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  DollarSign, 
  FileText,
  Eye,
  Settings,
  Crown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  claimed_net_worth_fcfa: number;
  wealth_source: string;
  business_background: string;
  application_tier: string;
  payment_amount: number;
  payment_status: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Billionaire {
  id: string;
  full_name: string;
  verified_net_worth_fcfa: number;
  net_worth_usd: number;
  wealth_source: string;
  region: string;
  current_rank?: number;
  is_verified: boolean;
  profile_views: number;
  created_at: string;
}

const BillionaireAdmin = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [billionaires, setBillionaires] = useState<Billionaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('billionaire_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);

      // Fetch billionaires
      const { data: billionairesData, error: billionairesError } = await supabase
        .from('billionaires')
        .select('*')
        .order('verified_net_worth_fcfa', { ascending: false });

      if (billionairesError) throw billionairesError;
      setBillionaires(billionairesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('billionaire_applications')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${action}d successfully`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} application`,
        variant: "destructive"
      });
    }
  };

  const toggleBillionaireVerification = async (billionaireId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('billionaires')
        .update({ 
          is_verified: !currentStatus,
          verified_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', billionaireId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Billionaire ${!currentStatus ? 'verified' : 'unverified'} successfully`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M FCFA`;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      under_review: "secondary"
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      bronze: "bg-orange-100 text-orange-800",
      silver: "bg-gray-100 text-gray-800", 
      gold: "bg-yellow-100 text-yellow-800"
    };
    
    return (
      <Badge className={colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800">Loading admin panel...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Settings className="h-12 w-12 text-amber-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Billionaire Admin Panel
              </h1>
            </div>
            <p className="text-xl text-amber-800">
              Manage Applications & Verify Billionaires
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-100 to-blue-200">
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {applications.filter(app => app.status === 'pending').length}
                </div>
                <p className="text-blue-600">Pending Applications</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-100 to-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {billionaires.filter(b => b.is_verified).length}
                </div>
                <p className="text-green-600">Verified Billionaires</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-purple-200">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(billionaires.reduce((sum, b) => sum + b.verified_net_worth_fcfa, 0))}
                </div>
                <p className="text-purple-600">Total Wealth</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-100 to-orange-200">
              <CardContent className="pt-6 text-center">
                <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {billionaires.reduce((sum, b) => sum + b.profile_views, 0)}
                </div>
                <p className="text-orange-600">Total Profile Views</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="billionaires">Manage Billionaires</TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <div className="grid gap-6">
                {applications.map((application) => (
                  <Card key={application.id} className="bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {application.applicant_name}
                          </CardTitle>
                          <CardDescription>
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(application.status)}
                          {getTierBadge(application.application_tier)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p><strong>Email:</strong> {application.applicant_email}</p>
                          <p><strong>Phone:</strong> {application.applicant_phone}</p>
                          <p><strong>Net Worth:</strong> {formatCurrency(application.claimed_net_worth_fcfa)}</p>
                        </div>
                        <div>
                          <p><strong>Wealth Source:</strong> {application.wealth_source.replace('_', ' ')}</p>
                          <p><strong>Payment Amount:</strong> {(application.payment_amount / 1000).toFixed(0)}k FCFA</p>
                          <p><strong>Payment Status:</strong> {application.payment_status}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <strong>Business Background:</strong>
                        <p className="text-sm text-muted-foreground mt-1 bg-gray-50 p-3 rounded">
                          {application.business_background}
                        </p>
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApplicationAction(application.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleApplicationAction(application.id, 'reject')}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {applications.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xl text-muted-foreground">No applications found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Billionaires Tab */}
            <TabsContent value="billionaires" className="space-y-6">
              <div className="grid gap-6">
                {billionaires.map((billionaire) => (
                  <Card key={billionaire.id} className="bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-600" />
                            {billionaire.full_name}
                            {billionaire.current_rank === 1 && (
                              <Badge className="bg-amber-100 text-amber-800">#1</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Rank #{billionaire.current_rank || 'Unranked'} • {billionaire.region}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={billionaire.is_verified ? "default" : "outline"}>
                            {billionaire.is_verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p><strong>Net Worth:</strong> {formatCurrency(billionaire.verified_net_worth_fcfa)}</p>
                          <p><strong>USD Equivalent:</strong> ${(billionaire.net_worth_usd / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p><strong>Wealth Source:</strong> {billionaire.wealth_source.replace('_', ' ')}</p>
                          <p><strong>Profile Views:</strong> {billionaire.profile_views}</p>
                        </div>
                        <div>
                          <p><strong>Added:</strong> {new Date(billionaire.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => toggleBillionaireVerification(billionaire.id, billionaire.is_verified)}
                          variant={billionaire.is_verified ? "outline" : "default"}
                        >
                          {billionaire.is_verified ? "Unverify" : "Verify"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {billionaires.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xl text-muted-foreground">No billionaires found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillionaireAdmin;