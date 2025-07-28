import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  TrendingUp, 
  Building, 
  Settings, 
  FileText, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ShippingCompany {
  id: string;
  company_name: string;
  company_type: string;
  verification_status: string;
  subscription_tier: string;
  subscription_active: boolean;
  total_shipments: number;
  completed_shipments: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  logo_url?: string;
  description?: string;
}

interface Branch {
  id: string;
  branch_name: string;
  branch_code: string;
  city: string;
  region: string;
  is_main_branch: boolean;
  is_active: boolean;
}

const ShippingDashboard = () => {
  const [company, setCompany] = useState<ShippingCompany | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('shipping_companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          // No company found - redirect to registration
          navigate('/shipping/register');
          return;
        }
        throw companyError;
      }

      setCompany(companyData);

      // Fetch branches
      const { data: branchData, error: branchError } = await supabase
        .from('shipping_company_branches')
        .select('*')
        .eq('company_id', companyData.id)
        .order('is_main_branch', { ascending: false });

      if (branchError) throw branchError;
      setBranches(branchData || []);

    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-700">Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionTierLabel = (tier: string) => {
    switch (tier) {
      case 'small_agent':
        return 'Small Agent';
      case 'medium_courier':
        return 'Medium Courier';
      case 'nationwide_express':
        return 'Nationwide Express';
      case 'white_label':
        return 'White Label';
      default:
        return tier;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <div className="h-8 bg-muted animate-pulse rounded"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Company Found</h1>
          <p className="text-muted-foreground mb-6">
            You haven't registered a shipping company yet.
          </p>
          <Button asChild>
            <Link to="/shipping/register">Register Your Company</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{company.company_name}</h1>
            <div className="flex items-center gap-4">
              {getStatusBadge(company.verification_status)}
              <span className="text-sm text-muted-foreground">
                {getSubscriptionTierLabel(company.subscription_tier)}
              </span>
              <span className={`text-sm ${company.subscription_active ? 'text-green-600' : 'text-red-600'}`}>
                {company.subscription_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {company.verification_status === 'pending' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Verification Pending</p>
                  <p className="text-sm text-yellow-700">
                    Your application is being reviewed. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {company.verification_status === 'verified' && !company.subscription_active && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Payment Required</p>
                  <p className="text-sm text-red-700">
                    Your account is verified but requires payment to activate services.
                  </p>
                </div>
                <Button size="sm" className="ml-auto">
                  Make Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                  <p className="text-2xl font-bold">{company.total_shipments}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{company.completed_shipments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{company.average_rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{company.total_reviews} reviews</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {company.total_shipments > 0 
                      ? Math.round((company.completed_shipments / company.total_shipments) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="branches">
              <Building className="w-4 h-4 mr-2" />
              Branches ({branches.length})
            </TabsTrigger>
            <TabsTrigger value="shipments">
              <Package className="w-4 h-4 mr-2" />
              Shipments
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="capitalize">{company.company_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p>{company.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p>{new Date(company.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Shipment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Building className="w-4 h-4 mr-2" />
                    Add Branch
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Staff
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="branches">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Branch Locations</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Branch
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((branch) => (
                  <Card key={branch.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{branch.branch_name}</h4>
                        <div className="flex gap-1">
                          {branch.is_main_branch && (
                            <Badge variant="secondary" className="text-xs">Main</Badge>
                          )}
                          <Badge 
                            variant={branch.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Code: {branch.branch_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {branch.city}, {branch.region}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {branches.length === 0 && (
                <Card className="p-12 text-center">
                  <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first branch to start managing shipments
                  </p>
                  <Button>Add Branch</Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shipments">
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shipment Management</h3>
              <p className="text-muted-foreground mb-4">
                This feature will be available in Phase 2 of the shipping system
              </p>
              <Button disabled>Coming Soon</Button>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
              <p className="text-muted-foreground mb-4">
                Upload business licenses, insurance, and other required documents
              </p>
              <Button>Upload Documents</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ShippingDashboard;