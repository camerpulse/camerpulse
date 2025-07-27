import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  BarChart3,
  PieChart,
  CalendarIcon,
  Users,
  ShoppingCart,
  CreditCard
} from 'lucide-react';

interface FinancialReportingProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

export const FinancialReporting: React.FC<FinancialReportingProps> = ({
  hasPermission,
  logActivity
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState('monthly');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get default date range (last 30 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: thirtyDaysAgo, to: today };
  };

  const effectiveDateRange = dateRange || getDefaultDateRange();

  // Fetch financial overview
  const { data: financialOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['financial-overview', effectiveDateRange],
    queryFn: async () => {
      const startDate = effectiveDateRange.from?.toISOString();
      const endDate = effectiveDateRange.to?.toISOString();

      const [transactionsRes, ordersRes, vendorsRes, commissionsRes] = await Promise.all([
        supabase
          .from('payment_transactions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('marketplace_orders')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('marketplace_vendors')
          .select('*')
          .eq('status', 'approved'),
        supabase
          .from('commission_tracking')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);

      const transactions = transactionsRes.data || [];
      const orders = ordersRes.data || [];
      const vendors = vendorsRes.data || [];
      const commissions = commissionsRes.data || [];

      const totalRevenue = transactions
        .filter(t => t.payment_status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalCommission = commissions
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);

      const totalVendorPayouts = commissions
        .reduce((sum, c) => sum + Number(c.vendor_payout), 0);

      const averageOrderValue = orders.length > 0 
        ? orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) / orders.length
        : 0;

      return {
        totalRevenue,
        totalCommission,
        totalVendorPayouts,
        transactionCount: transactions.length,
        orderCount: orders.length,
        vendorCount: vendors.length,
        averageOrderValue,
        commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
      };
    }
  });

  // Fetch commission breakdown by vendor
  const { data: vendorCommissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['vendor-commissions', effectiveDateRange],
    queryFn: async () => {
      const startDate = effectiveDateRange.from?.toISOString();
      const endDate = effectiveDateRange.to?.toISOString();

      const { data, error } = await supabase
        .from('commission_tracking')
        .select(`
          *,
          marketplace_vendors(business_name, contact_email)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('commission_amount', { ascending: false });

      if (error) throw error;

      // Group by vendor
      const vendorGroups = data.reduce((acc: any, commission: any) => {
        const vendorId = commission.vendor_id;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: commission.marketplace_vendors,
            totalCommission: 0,
            totalPayout: 0,
            transactionCount: 0,
            transactions: []
          };
        }
        acc[vendorId].totalCommission += Number(commission.commission_amount);
        acc[vendorId].totalPayout += Number(commission.vendor_payout);
        acc[vendorId].transactionCount += 1;
        acc[vendorId].transactions.push(commission);
        return acc;
      }, {});

      return Object.values(vendorGroups).slice(0, 10); // Top 10 vendors
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, dateRange }: { reportType: string; dateRange: DateRange }) => {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert({
          report_type: reportType,
          report_period_start: dateRange.from!.toISOString().split('T')[0],
          report_period_end: dateRange.to!.toISOString().split('T')[0],
          total_revenue: financialOverview?.totalRevenue || 0,
          total_commission: financialOverview?.totalCommission || 0,
          total_vendor_payouts: financialOverview?.totalVendorPayouts || 0,
          transaction_count: financialOverview?.transactionCount || 0,
          vendor_count: financialOverview?.vendorCount || 0,
          customer_count: 0, // Would need to calculate this
          report_data: JSON.stringify({
            averageOrderValue: financialOverview?.averageOrderValue || 0,
            commissionRate: financialOverview?.commissionRate || 0,
            vendorBreakdown: vendorCommissions || []
          }) as any,
          generated_by_admin_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      logActivity('generate_financial_report', { reportId: data.id, reportType });
      toast({
        title: "Report Generated",
        description: "Financial report has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    if (effectiveDateRange.from && effectiveDateRange.to) {
      generateReportMutation.mutate({
        reportType,
        dateRange: effectiveDateRange as DateRange
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analysis and commission tracking
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="text-sm">Date range selector would go here</div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialOverview?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialOverview?.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialOverview?.totalCommission || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialOverview?.commissionRate?.toFixed(1) || 0}% commission rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialOverview?.totalVendorPayouts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              To {financialOverview?.vendorCount || 0} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialOverview?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialOverview?.orderCount || 0} orders total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Top Vendors by Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorCommissions?.map((vendor: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{vendor.vendor?.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(vendor.totalCommission)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payout: {formatCurrency(vendor.totalPayout)}
                    </p>
                  </div>
                </div>
              ))}
              {!vendorCommissions?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No commission data available for the selected period
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Export Transaction Data
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Vendor Payout Report
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue Trend Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {financialOverview?.transactionCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {financialOverview?.orderCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Orders Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {financialOverview?.vendorCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Vendors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {financialOverview?.commissionRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Commission Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};