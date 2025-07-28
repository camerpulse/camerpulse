import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Phone,
  Mail,
  Eye, 
  Edit, 
  Check,
  X,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyDirectoryManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CompanyDirectoryManager: React.FC<CompanyDirectoryManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Company stats
  const companyStats = {
    totalCompanies: companies.length,
    verifiedCompanies: companies.filter(c => c.status === 'approved').length,
    pendingVerification: companies.filter(c => c.status === 'pending').length,
    activeListings: companies.filter(c => c.status === 'approved').length
  };

  // Update company status
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: 'Company updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update company', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleVerifyCompany = (id: string) => {
    updateCompanyMutation.mutate({ 
      id, 
      updates: { is_verified: true, verified_at: new Date().toISOString() }
    });
    logActivity('company_verified', { company_id: id });
  };

  const handleRejectCompany = (id: string) => {
    updateCompanyMutation.mutate({ 
      id, 
      updates: { status: 'rejected' }
    });
    logActivity('company_rejected', { company_id: id });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry_category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && company.status === 'approved') ||
                         (statusFilter === 'unverified' && company.status === 'pending') ||
                         (statusFilter === 'active' && company.status === 'approved');
    const matchesRegion = regionFilter === 'all' || company.location === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Company Directory Management"
        description="Manage company listings, verification, and business directory"
        icon={Building2}
        iconColor="text-orange-600"
        badge={{
          text: "Business Intelligence",
          variant: "secondary"
        }}
        searchPlaceholder="Search companies, industries..."
        onSearch={(query) => {
          setSearchTerm(query);
          logActivity('company_search', { query });
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['companies'] });
          logActivity('company_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Companies"
              value={companyStats.totalCompanies}
              description="Registered businesses"
              icon={Building2}
            />
            <StatCard
              title="Verified Companies"
              value={companyStats.verifiedCompanies}
              description="Approved listings"
              icon={Check}
            />
            <StatCard
              title="Pending Verification"
              value={companyStats.pendingVerification}
              description="Awaiting review"
              icon={Users}
            />
            <StatCard
              title="Active Listings"
              value={companyStats.activeListings}
              description="Currently active"
              icon={Globe}
            />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setRegionFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <Card>
            <CardHeader>
              <CardTitle>Company Directory</CardTitle>
              <CardDescription>Manage all registered companies and businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading companies...</div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No companies found</div>
                ) : (
                  filteredCompanies.slice(0, 10).map((company) => (
                    <DataTableCard
                      key={company.id}
                      title={company.company_name}
                      subtitle={company.description}
                      status={{
                        label: company.status === 'approved' ? 'Verified' : 'Pending',
                        variant: company.status === 'approved' ? 'default' : 'outline'
                      }}
                      tags={[company.industry_category, company.company_type].filter(Boolean)}
                      metadata={[
                        { icon: MapPin, label: 'Location', value: company.location || 'N/A' },
                        { icon: Users, label: 'Size', value: company.company_size || 'N/A' },
                        { icon: Globe, label: 'Website', value: company.website_url || 'N/A' },
                        { icon: Phone, label: 'Phone', value: company.phone_number || 'N/A' }
                      ]}
                      actions={[
                        {
                          label: 'View',
                          icon: Eye,
                          onClick: () => console.log('View company', company.id),
                          variant: 'outline'
                        },
                        ...(company.status === 'pending' ? [
                          {
                            label: 'Approve',
                            icon: Check,
                            onClick: () => handleVerifyCompany(company.id),
                            variant: 'default' as const
                          },
                          {
                            label: 'Reject',
                            icon: X,
                            onClick: () => handleRejectCompany(company.id),
                            variant: 'destructive' as const
                          }
                        ] : []),
                        {
                          label: 'Edit',
                          icon: Edit,
                          onClick: () => console.log('Edit company', company.id),
                          variant: 'outline'
                        }
                      ]}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Verification Queue</CardTitle>
              <CardDescription>Review and verify pending company applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Check className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Verification System</h3>
                <p className="text-muted-foreground">
                  Automated verification workflows and manual review tools
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Analytics</CardTitle>
              <CardDescription>Insights and trends from company directory data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Business Intelligence</h3>
                <p className="text-muted-foreground">
                  Industry trends, growth patterns, and market analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};