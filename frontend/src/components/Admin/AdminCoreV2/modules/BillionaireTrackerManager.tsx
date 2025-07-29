import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { CreditCard, Crown, TrendingUp, Users, RefreshCw, Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BillionaireTrackerManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const BillionaireTrackerManager: React.FC<BillionaireTrackerManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch billionaire applications  
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['billionaire_applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billionaire_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch billionaire stats
  const { data: billionaireStats } = useQuery({
    queryKey: ['billionaire_stats'],
    queryFn: async () => {
      const { data: verified } = await supabase
        .from('billionaires')
        .select('count')
        .eq('is_verified', true);
      
      const { data: pending } = await supabase
        .from('billionaire_applications')
        .select('count')
        .eq('status', 'pending');

      const { data: totalWealth } = await supabase
        .from('billionaires')
        .select('verified_net_worth_fcfa')
        .eq('is_verified', true);

      return {
        verified: verified?.[0]?.count || 0,
        pending: pending?.[0]?.count || 0,
        totalWealth: totalWealth?.reduce((sum, b) => sum + (b.verified_net_worth_fcfa || 0), 0) || 0,
        avgWealth: totalWealth && totalWealth.length > 0 
          ? totalWealth.reduce((sum, b) => sum + (b.verified_net_worth_fcfa || 0), 0) / totalWealth.length 
          : 0
      };
    }
  });

  // Update application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('billionaire_applications')
        .update({ 
          status, 
          admin_notes: notes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billionaire_applications'] });
      toast({ title: 'Application status updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update status', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved', notes: 'Approved by admin' });
    logActivity('billionaire_application_approved', { application_id: id });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'rejected', notes: 'Rejected by admin' });
    logActivity('billionaire_application_rejected', { application_id: id });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount) + ' FCFA';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.business_background?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Billionaire Tracker Management"
        description="Manage billionaire applications and wealth verification system"
        icon={CreditCard}
        iconColor="text-yellow-600"
        badge={{
          text: "Premium Platform",
          variant: "secondary"
        }}
        searchPlaceholder="Search applications, billionaires..."
        onSearch={(query) => {
          setSearchTerm(query);
          logActivity('billionaire_search', { query });
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['billionaire_applications'] });
          logActivity('billionaire_refresh', { timestamp: new Date() });
        }}
      />

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Verified Billionaires"
          value={billionaireStats?.verified || 0}
          description="+2 this month"
          icon={Crown}
        />
        <StatCard
          title="Pending Applications"
          value={billionaireStats?.pending || 0}
          description="Awaiting review"
          icon={Users}
        />
        <StatCard
          title="Total Verified Wealth"
          value={formatCurrency(billionaireStats?.totalWealth || 0)}
          description="Combined portfolio"
          icon={TrendingUp}
        />
        <StatCard
          title="Average Net Worth"
          value={formatCurrency(billionaireStats?.avgWealth || 0)}
          description="Per billionaire"
          icon={CreditCard}
        />
      </div>

      {/* Applications Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Application Management
          </CardTitle>
          <CardDescription>Review and process billionaire applications</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No applications found</div>
            ) : (
              filteredApplications.slice(0, 10).map((app) => (
                <DataTableCard
                  key={app.id}
                  title={app.applicant_name}
                  subtitle={app.business_background}
                  status={{
                    label: app.status,
                    variant: app.status === 'approved' ? 'default' :
                            app.status === 'rejected' ? 'destructive' :
                            app.status === 'under_review' ? 'secondary' : 'outline'
                  }}
                  metadata={[
                    { icon: Users, label: 'Tier', value: app.application_tier },
                    { icon: CreditCard, label: 'Net Worth', value: formatCurrency(app.claimed_net_worth_fcfa || 0) },
                    { icon: Eye, label: 'Email', value: app.applicant_email },
                    { icon: Crown, label: 'Phone', value: app.applicant_phone }
                  ]}
                  actions={[
                    ...(app.status === 'pending' ? [
                      {
                        label: 'Approve',
                        icon: Check,
                        onClick: () => handleApprove(app.id),
                        variant: 'default' as const
                      },
                      {
                        label: 'Reject',
                        icon: X,
                        onClick: () => handleReject(app.id),
                        variant: 'destructive' as const
                      }
                    ] : []),
                    {
                      label: 'View Details',
                      icon: Eye,
                      onClick: () => console.log('View details', app.id),
                      variant: 'outline' as const
                    }
                  ]}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};