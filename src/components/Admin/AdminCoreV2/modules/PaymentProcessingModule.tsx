import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { CreditCard, DollarSign, TrendingUp, Shield, AlertTriangle, Eye, Settings, CheckCircle } from 'lucide-react';

interface PaymentProcessingModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PaymentProcessingModule: React.FC<PaymentProcessingModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const paymentStats = {
    totalTransactions: stats?.total_transactions || 15678,
    dailyVolume: stats?.daily_volume || 456789000, // FCFA
    successRate: stats?.success_rate || 98.7,
    failedTransactions: stats?.failed_transactions || 23
  };

  const paymentMethods = [
    { name: 'Mobile Money', transactions: 8456, volume: 234567000, percentage: 68.2, color: 'bg-green-500' },
    { name: 'Bank Transfer', transactions: 3234, volume: 156789000, percentage: 24.8, color: 'bg-blue-500' },
    { name: 'Cash Payment', transactions: 567, volume: 34567000, percentage: 4.3, color: 'bg-orange-500' },
    { name: 'Digital Wallet', transactions: 345, volume: 23456000, percentage: 2.7, color: 'bg-purple-500' }
  ];

  const recentTransactions = [
    {
      id: 'TX001',
      type: 'Government Fee',
      amount: 25000,
      method: 'Mobile Money',
      status: 'completed',
      timestamp: '2024-01-15 14:30:22',
      reference: 'GF2024-001',
      user: 'Marie Mballa'
    },
    {
      id: 'TX002',
      type: 'Business License',
      amount: 150000,
      method: 'Bank Transfer',
      status: 'pending',
      timestamp: '2024-01-15 14:25:15',
      reference: 'BL2024-089',
      user: 'Jean Nkomo'
    },
    {
      id: 'TX003',
      type: 'Tax Payment',
      amount: 450000,
      method: 'Mobile Money',
      status: 'failed',
      timestamp: '2024-01-15 14:20:45',
      reference: 'TX2024-234',
      user: 'Sarah Doe'
    },
    {
      id: 'TX004',
      type: 'Service Fee',
      amount: 75000,
      method: 'Digital Wallet',
      status: 'completed',
      timestamp: '2024-01-15 14:15:30',
      reference: 'SF2024-456',
      user: 'Paul Johnson'
    }
  ];

  const paymentProviders = [
    { name: 'MTN Mobile Money', status: 'active', uptime: '99.8%', lastUpdate: '2 min ago' },
    { name: 'Orange Money', status: 'active', uptime: '99.5%', lastUpdate: '5 min ago' },
    { name: 'Commercial Bank of Cameroon', status: 'maintenance', uptime: '97.2%', lastUpdate: '1 hour ago' },
    { name: 'Afriland First Bank', status: 'active', uptime: '99.1%', lastUpdate: '3 min ago' }
  ];

  const securityMetrics = [
    { metric: 'Fraud Detection Rate', value: '99.2%', status: 'excellent' },
    { metric: 'Transaction Security', value: '100%', status: 'excellent' },
    { metric: 'Data Encryption', value: 'AES-256', status: 'secure' },
    { metric: 'Compliance Score', value: '98.5%', status: 'compliant' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'active': return 'text-green-600';
      case 'maintenance': return 'text-orange-600';
      case 'excellent': return 'text-green-600';
      case 'secure': return 'text-blue-600';
      case 'compliant': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Mobile Money': return 'bg-green-100 text-green-800';
      case 'Bank Transfer': return 'bg-blue-100 text-blue-800';
      case 'Cash Payment': return 'bg-orange-100 text-orange-800';
      case 'Digital Wallet': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Payment Processing"
        description="Monitor and manage payment transactions, methods, and security"
        icon={CreditCard}
        iconColor="text-purple-600"
        searchPlaceholder="Search transactions, payments, users..."
        onSearch={(query) => {
          console.log('Searching payments:', query);
        }}
        onRefresh={() => {
          logActivity('payments_refresh', { timestamp: new Date() });
        }}
      />

      {/* Payment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.dailyVolume)}</div>
            <p className="text-xs text-muted-foreground">Today's transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Transaction success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.failedTransactions}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods Distribution
          </CardTitle>
          <CardDescription>
            Transaction volume and count by payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{method.name}</h4>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {method.transactions.toLocaleString()} transactions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(method.volume)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${method.color}`}
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {method.percentage}% of total volume
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest payment transactions across all methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{transaction.type}</h4>
                        <Badge className={getMethodColor(transaction.method)} variant="secondary">
                          {transaction.method}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {transaction.user} • {transaction.reference}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.timestamp}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                      <Badge className={getStatusColor(transaction.status)} variant="outline">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Payment Providers & Security */}
        <div className="space-y-6">
          {/* Payment Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Payment Providers
              </CardTitle>
              <CardDescription>
                Status and health of payment service providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <h4 className="font-medium text-sm">{provider.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Uptime: {provider.uptime}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(provider.status)} variant="outline">
                        {provider.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {provider.lastUpdate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Metrics
              </CardTitle>
              <CardDescription>
                Payment security and compliance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityMetrics.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between p-2 rounded border">
                    <h4 className="font-medium text-sm">{metric.metric}</h4>
                    <div className="text-right">
                      <p className="font-medium">{metric.value}</p>
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Management Tools */}
      {hasPermission('payments:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Management Tools</CardTitle>
            <CardDescription>
              Advanced tools for payment processing and security management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('payment_reconciliation', {})}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reconciliation
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('fraud_monitoring', {})}
              >
                <Shield className="w-4 h-4 mr-2" />
                Fraud Monitoring
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('payment_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Payment Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('payment_settings', {})}
              >
                <Settings className="w-4 h-4 mr-2" />
                Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};