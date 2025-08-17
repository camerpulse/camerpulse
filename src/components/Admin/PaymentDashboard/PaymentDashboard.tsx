import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  DollarSign,
  Phone,
  Calendar,
  Filter,
  Mail,
  BarChart3
} from 'lucide-react';

interface PaymentStats {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
  average_amount: number;
  unique_users: number;
}

interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
  user_id?: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

export const PaymentDashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Load payment analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('payment_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Aggregate stats
      const aggregatedStats = analyticsData.reduce((acc, day) => ({
        total_transactions: acc.total_transactions + day.total_transactions,
        successful_transactions: acc.successful_transactions + day.successful_transactions,
        failed_transactions: acc.failed_transactions + day.failed_transactions,
        pending_transactions: acc.pending_transactions + day.pending_transactions,
        total_amount: acc.total_amount + day.total_amount,
        successful_amount: acc.successful_amount + day.successful_amount,
        average_amount: 0, // Will calculate after
        unique_users: Math.max(acc.unique_users, day.unique_users) // Use highest
      }), {
        total_transactions: 0,
        successful_transactions: 0,
        failed_transactions: 0,
        pending_transactions: 0,
        total_amount: 0,
        successful_amount: 0,
        average_amount: 0,
        unique_users: 0
      });

      aggregatedStats.average_amount = aggregatedStats.successful_transactions > 0 
        ? aggregatedStats.successful_amount / aggregatedStats.successful_transactions 
        : 0;

      setStats(aggregatedStats);

      // Load recent transactions
      let transactionQuery = supabase
        .from('nokash_transactions')
        .select(`
          *,
          profiles:user_id(display_name, email)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        transactionQuery = transactionQuery.eq('status', statusFilter);
      }

      const { data: transactionData, error: transactionError } = await transactionQuery;

      if (transactionError) throw transactionError;

      // Filter by search query
      const filteredTransactions = transactionData.filter(tx => 
        searchQuery === '' || 
        tx.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.phone_number.includes(searchQuery) ||
        tx.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setTransactions(filteredTransactions);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async (transactionId: string, type: 'success' | 'failed') => {
    try {
      const { error } = await supabase.functions.invoke('send-payment-notification', {
        body: {
          transaction_id: transactionId,
          notification_type: type
        }
      });

      if (error) throw error;

      toast({
        title: "Notification Sent",
        description: `Test ${type} notification sent successfully`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Order ID', 'Amount', 'Currency', 'Phone', 'Method', 'Status', 'User', 'Created', 'Completed'].join(','),
      ...transactions.map(tx => [
        tx.order_id,
        tx.amount,
        tx.currency,
        tx.phone_number,
        tx.payment_method,
        tx.status,
        tx.profiles?.display_name || 'Unknown',
        new Date(tx.created_at).toLocaleString(),
        tx.completed_at ? new Date(tx.completed_at).toLocaleString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nokash-transactions-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCESS: { variant: 'default', color: 'text-green-600', icon: CheckCircle },
      FAILED: { variant: 'destructive', color: 'text-red-600', icon: AlertTriangle },
      PENDING: { variant: 'secondary', color: 'text-yellow-600', icon: Clock },
      CANCELLED: { variant: 'outline', color: 'text-gray-600', icon: AlertTriangle }
    };

    const config = variants[status as keyof typeof variants] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payment Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor Nokash payment transactions and analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportTransactions} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.successful_transactions || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.successful_amount?.toLocaleString() || 0} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats?.average_amount?.toFixed(0) || 0} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_transactions > 0 
                ? ((stats.successful_transactions / stats.total_transactions) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.failed_transactions || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unique_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_transactions || 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {transactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{tx.order_id}</td>
                    <td className="p-2">
                      <div className="font-semibold">{tx.amount} {tx.currency}</div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{tx.phone_number}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{tx.payment_method}</Badge>
                    </td>
                    <td className="p-2">{getStatusBadge(tx.status)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">
                          {tx.profiles?.display_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500">
                          {tx.profiles?.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendTestNotification(tx.id, 'success')}
                          title="Send success notification"
                        >
                          <Mail className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendTestNotification(tx.id, 'failed')}
                          title="Send failure notification"
                        >
                          <Mail className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};