import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { FileText, DollarSign, Calculator, AlertTriangle, TrendingUp, Eye, Users, Calendar } from 'lucide-react';

interface TaxManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const TaxManagementModule: React.FC<TaxManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const taxStats = {
    totalRevenue: stats?.total_tax_revenue || 12456789000, // FCFA
    pendingPayments: stats?.pending_tax_payments || 2345678000,
    complianceRate: stats?.tax_compliance_rate || 78.5,
    activeAudits: stats?.active_audits || 45
  };

  const taxCategories = [
    { 
      name: 'Income Tax', 
      collected: 4567890000, 
      target: 5000000000, 
      compliance: 82.3,
      status: 'on-track'
    },
    { 
      name: 'Corporate Tax', 
      collected: 3456789000, 
      target: 4000000000, 
      compliance: 76.8,
      status: 'below-target'
    },
    { 
      name: 'VAT/Sales Tax', 
      collected: 2890123000, 
      target: 3200000000, 
      compliance: 85.1,
      status: 'on-track'
    },
    { 
      name: 'Property Tax', 
      collected: 1234567000, 
      target: 1500000000, 
      compliance: 65.4,
      status: 'below-target'
    },
    { 
      name: 'Import Duties', 
      collected: 567890000, 
      target: 600000000, 
      compliance: 92.1,
      status: 'exceeding'
    }
  ];

  const recentAudits = [
    {
      id: 1,
      taxpayer: 'Douala Business Center',
      type: 'Corporate Audit',
      startDate: '2024-01-10',
      status: 'ongoing',
      amount: 45000000,
      assignedTo: 'Audit Team A'
    },
    {
      id: 2,
      taxpayer: 'Yaoundé Import Co.',
      type: 'Import Compliance',
      startDate: '2024-01-08',
      status: 'pending-review',
      amount: 12500000,
      assignedTo: 'Audit Team B'
    },
    {
      id: 3,
      taxpayer: 'Agriculture Collective Ltd',
      type: 'VAT Audit',
      startDate: '2024-01-05',
      status: 'completed',
      amount: 8750000,
      assignedTo: 'Audit Team C'
    }
  ];

  const paymentDeadlines = [
    { type: 'Corporate Tax Q1', dueDate: '2024-03-31', affected: 1456, amount: 890000000 },
    { type: 'Income Tax Annual', dueDate: '2024-04-15', affected: 12345, amount: 2340000000 },
    { type: 'VAT Monthly', dueDate: '2024-02-15', affected: 5678, amount: 456000000 },
    { type: 'Property Tax Annual', dueDate: '2024-06-30', affected: 8901, amount: 345000000 }
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
      case 'exceeding': return 'text-blue-600';
      case 'below-target': return 'text-red-600';
      case 'ongoing': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'pending-review': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Tax Management System"
        description="Manage tax collection, compliance, auditing, and revenue tracking"
        icon={Calculator}
        iconColor="text-red-600"
        searchPlaceholder="Search taxpayers, audits, payments..."
        onSearch={(query) => {
          console.log('Searching tax data:', query);
        }}
        onRefresh={() => {
          logActivity('tax_refresh', { timestamp: new Date() });
        }}
      />

      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">This fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxStats.pendingPayments)}</div>
            <p className="text-xs text-muted-foreground">Outstanding amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxStats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">On-time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxStats.activeAudits}</div>
            <p className="text-xs text-muted-foreground">Ongoing investigations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Collection by Category
          </CardTitle>
          <CardDescription>
            Performance against targets for different tax categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatCurrency(category.collected)} / {formatCurrency(category.target)}
                    </span>
                    <Badge className={getStatusColor(category.status)} variant="outline">
                      {category.status}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (category.collected / category.target) >= 1 ? 'bg-blue-500' :
                      (category.collected / category.target) >= 0.8 ? 'bg-green-500' :
                      (category.collected / category.target) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((category.collected / category.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{((category.collected / category.target) * 100).toFixed(1)}% of target</span>
                  <span>{category.compliance}% compliance rate</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Tax Audits
            </CardTitle>
            <CardDescription>
              Current and recent audit activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{audit.taxpayer}</h4>
                      <p className="text-xs text-muted-foreground">{audit.type}</p>
                    </div>
                    <Badge className={getStatusColor(audit.status)} variant="outline">
                      {audit.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Start Date:</p>
                      <p className="font-medium">{audit.startDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount:</p>
                      <p className="font-medium">{formatCurrency(audit.amount)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Assigned to: {audit.assignedTo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Audits
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Payment Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Payment Deadlines
            </CardTitle>
            <CardDescription>
              Important tax payment due dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentDeadlines.map((deadline, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{deadline.type}</h4>
                    <Badge variant="outline">{deadline.dueDate}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Taxpayers Affected:</p>
                      <p className="font-medium">{deadline.affected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Amount:</p>
                      <p className="font-medium">{formatCurrency(deadline.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tax Management Tools */}
      {hasPermission('tax:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Administration Tools</CardTitle>
            <CardDescription>
              Advanced tools for tax management and compliance enforcement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('tax_collection', {})}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Collection Management
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('tax_audit', {})}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Audit Management
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('tax_compliance', {})}
              >
                <FileText className="w-4 h-4 mr-2" />
                Compliance Tracking
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('tax_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Tax Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};