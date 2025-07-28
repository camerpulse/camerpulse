import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { DollarSign, TrendingUp, PieChart, Calculator, FileText, Eye, Download, AlertTriangle } from 'lucide-react';

interface FinancialManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const FinancialManagementModule: React.FC<FinancialManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const financialStats = {
    totalBudget: stats?.total_budget || 2450000000, // 2.45B FCFA
    spentAmount: stats?.spent_amount || 1876543210,
    remainingBudget: stats?.remaining_budget || 573456790,
    monthlyRevenue: stats?.monthly_revenue || 45623000
  };

  const budgetCategories = [
    { 
      name: 'Infrastructure', 
      allocated: 980000000, 
      spent: 743500000, 
      percentage: 75.8,
      status: 'on-track'
    },
    { 
      name: 'Education', 
      allocated: 612000000, 
      spent: 498300000, 
      percentage: 81.4,
      status: 'over-budget'
    },
    { 
      name: 'Healthcare', 
      allocated: 458000000, 
      spent: 356200000, 
      percentage: 77.8,
      status: 'on-track'
    },
    { 
      name: 'Agriculture', 
      allocated: 245000000, 
      spent: 167800000, 
      percentage: 68.5,
      status: 'under-budget'
    },
    { 
      name: 'Youth Programs', 
      allocated: 155000000, 
      spent: 110743210, 
      percentage: 71.4,
      status: 'on-track'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      description: 'Road Construction Payment - Phase 2',
      amount: -45000000,
      date: '2024-01-15',
      category: 'Infrastructure',
      type: 'expense',
      status: 'completed'
    },
    {
      id: 2,
      description: 'School Equipment Purchase',
      amount: -12500000,
      date: '2024-01-14',
      category: 'Education',
      type: 'expense',
      status: 'pending'
    },
    {
      id: 3,
      description: 'Federal Transfer - Q1',
      amount: 125000000,
      date: '2024-01-12',
      category: 'Revenue',
      type: 'income',
      status: 'completed'
    },
    {
      id: 4,
      description: 'Health Center Renovation',
      amount: -8750000,
      date: '2024-01-10',
      category: 'Healthcare',
      type: 'expense',
      status: 'completed'
    }
  ];

  const financialAlerts = [
    { id: 1, type: 'warning', message: 'Education budget 81% utilized with 3 months remaining', priority: 'high' },
    { id: 2, type: 'info', message: 'Agriculture spending below target - consider reallocation', priority: 'medium' },
    { id: 3, type: 'success', message: 'Infrastructure projects on schedule and budget', priority: 'low' }
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
      case 'on-track': return 'text-green-600';
      case 'over-budget': return 'text-red-600';
      case 'under-budget': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Financial Management"
        description="Manage budgets, expenses, revenue, and financial planning"
        icon={DollarSign}
        iconColor="text-green-600"
        searchPlaceholder="Search transactions, budgets, categories..."
        onSearch={(query) => {
          console.log('Searching financial data:', query);
        }}
        onRefresh={() => {
          logActivity('financial_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('financial_report', {})}>
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        )}
      />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Annual allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.spentAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {((financialStats.spentAmount / financialStats.totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.remainingBudget)}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts */}
      {financialAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Financial Alerts
            </CardTitle>
            <CardDescription>
              Important financial notifications and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <Badge variant="outline">{alert.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget by Category
            </CardTitle>
            <CardDescription>
              Budget allocation and spending progress by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                      </span>
                      <Badge className={getStatusColor(category.status)} variant="outline">
                        {category.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        category.percentage > 90 ? 'bg-red-500' :
                        category.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(1)}% utilized
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest financial transactions and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{transaction.description}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{transaction.date}</span>
                      <span>{transaction.category}</span>
                      <Badge className={getStatusColor(transaction.status)} variant="outline">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.type}
                    </p>
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
      </div>

      {/* Financial Management Tools */}
      {hasPermission('finance:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Management Tools</CardTitle>
            <CardDescription>
              Advanced tools for financial planning and budget management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('budget_planning', {})}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Budget Planning
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('financial_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Financial Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('audit_trail', {})}
              >
                <FileText className="w-4 h-4 mr-2" />
                Audit Trail
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('payment_processing', {})}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payment Processing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};