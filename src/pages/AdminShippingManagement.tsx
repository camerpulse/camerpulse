import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  FileText,
  Mail
} from 'lucide-react';

interface ShippingCompany {
  id: string;
  company_name: string;
  company_type: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  verification_status: string;
  subscription_tier: string;
  subscription_active: boolean;
  created_at: string;
  description?: string;
  tax_number?: string;
}

const AdminShippingManagement = () => {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ShippingCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<ShippingCompany | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load shipping companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.verification_status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const updateCompanyStatus = async (companyId: string, status: string, notes?: string) => {
    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        verification_status: status,
        admin_notes: notes
      };

      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.id;
      }

      const { error } = await supabase
        .from('shipping_companies')
        .update(updateData)
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Company status changed to ${status}`,
      });

      await fetchCompanies();
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update company status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
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
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shipping Companies</h1>
            <p className="text-muted-foreground">
              Manage shipping company registrations and verifications
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-sm text-muted-foreground">Total Companies</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {companies.filter(c => c.verification_status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {companies.filter(c => c.verification_status === 'verified').length}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {companies.filter(c => c.subscription_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{company.company_name}</h3>
                          {getStatusBadge(company.verification_status)}
                          <Badge variant="outline">
                            {getSubscriptionTierLabel(company.subscription_tier)}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>Type:</strong> {company.company_type.replace('_', ' ')}</p>
                            <p><strong>Email:</strong> {company.email}</p>
                          </div>
                          <div>
                            <p><strong>Phone:</strong> {company.phone}</p>
                            <p><strong>Location:</strong> {company.city}, {company.region}</p>
                          </div>
                          <div>
                            <p><strong>Registered:</strong> {new Date(company.created_at).toLocaleDateString()}</p>
                            <p><strong>Subscription:</strong> 
                              <span className={company.subscription_active ? 'text-green-600' : 'text-red-600'}>
                                {company.subscription_active ? ' Active' : ' Inactive'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {company.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {company.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCompany(company)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Company Application</DialogTitle>
                          <DialogDescription>
                            Review and approve or reject this shipping company registration
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedCompany && (
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Company Name</Label>
                                <p className="text-sm">{selectedCompany.company_name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Company Type</Label>
                                <p className="text-sm capitalize">{selectedCompany.company_type.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm">{selectedCompany.email}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <p className="text-sm">{selectedCompany.phone}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Tax Number</Label>
                                <p className="text-sm">{selectedCompany.tax_number || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Location</Label>
                                <p className="text-sm">{selectedCompany.city}, {selectedCompany.region}</p>
                              </div>
                            </div>

                            {selectedCompany.description && (
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm">{selectedCompany.description}</p>
                              </div>
                            )}

                            <div>
                              <Label htmlFor="admin_notes">Admin Notes</Label>
                              <Textarea
                                id="admin_notes"
                                placeholder="Add notes about this application..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => updateCompanyStatus(
                                  selectedCompany.id, 
                                  'verified',
                                  (document.getElementById('admin_notes') as HTMLTextAreaElement)?.value
                                )}
                                disabled={updating}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Verify
                              </Button>
                              
                              <Button
                                onClick={() => updateCompanyStatus(
                                  selectedCompany.id, 
                                  'under_review',
                                  (document.getElementById('admin_notes') as HTMLTextAreaElement)?.value
                                )}
                                disabled={updating}
                                variant="outline"
                                className="flex-1"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark Under Review
                              </Button>
                              
                              <Button
                                onClick={() => updateCompanyStatus(
                                  selectedCompany.id, 
                                  'rejected',
                                  (document.getElementById('admin_notes') as HTMLTextAreaElement)?.value
                                )}
                                disabled={updating}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>

                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCompanies.length === 0 && (
            <Card className="p-12 text-center">
              <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No shipping companies have registered yet'
                }
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminShippingManagement;