import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { FileText, Building, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Plus } from 'lucide-react';

interface ProcurementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ProcurementModule: React.FC<ProcurementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const procurementStats = {
    activeTenders: stats?.active_tenders || 23,
    totalValue: stats?.total_procurement_value || 8945678000, // FCFA
    registeredVendors: stats?.registered_vendors || 456,
    completedContracts: stats?.completed_contracts || 189
  };

  const activeTenders = [
    {
      id: 'TND-2024-001',
      title: 'Road Construction Project - Phase II',
      department: 'Infrastructure',
      budget: 2500000000,
      submissionDeadline: '2024-02-15',
      status: 'open',
      bidsReceived: 8,
      category: 'construction'
    },
    {
      id: 'TND-2024-002',
      title: 'Medical Equipment Procurement',
      department: 'Health',
      budget: 850000000,
      submissionDeadline: '2024-02-20',
      status: 'evaluation',
      bidsReceived: 12,
      category: 'medical'
    },
    {
      id: 'TND-2024-003',
      title: 'School Furniture and Supplies',
      department: 'Education',
      budget: 450000000,
      submissionDeadline: '2024-02-25',
      status: 'open',
      bidsReceived: 6,
      category: 'education'
    },
    {
      id: 'TND-2024-004',
      title: 'IT Infrastructure Upgrade',
      department: 'Technology',
      budget: 1200000000,
      submissionDeadline: '2024-03-01',
      status: 'planning',
      bidsReceived: 0,
      category: 'technology'
    }
  ];

  const vendorPerformance = [
    { 
      name: 'Cameroon Construction Ltd',
      contractsCompleted: 15,
      onTimeDelivery: 93.3,
      qualityScore: 4.6,
      totalValue: 3400000000,
      status: 'preferred'
    },
    { 
      name: 'Douala Medical Supplies',
      contractsCompleted: 8,
      onTimeDelivery: 87.5,
      qualityScore: 4.2,
      totalValue: 890000000,
      status: 'active'
    },
    { 
      name: 'YaoTech Solutions',
      contractsCompleted: 12,
      onTimeDelivery: 91.7,
      qualityScore: 4.4,
      totalValue: 1560000000,
      status: 'active'
    },
    { 
      name: 'West Region Logistics',
      contractsCompleted: 6,
      onTimeDelivery: 75.0,
      qualityScore: 3.8,
      totalValue: 670000000,
      status: 'review'
    }
  ];

  const procurementCategories = [
    { category: 'Construction & Infrastructure', count: 45, value: 3450000000, avgDuration: 180 },
    { category: 'Medical & Healthcare', count: 23, value: 1230000000, avgDuration: 90 },
    { category: 'Education & Training', count: 34, value: 890000000, avgDuration: 60 },
    { category: 'Technology & Equipment', count: 28, value: 1560000000, avgDuration: 120 },
    { category: 'Transportation', count: 19, value: 780000000, avgDuration: 150 },
    { category: 'Professional Services', count: 31, value: 560000000, avgDuration: 45 }
  ];

  const recentAwards = [
    {
      id: 1,
      tender: 'TND-2023-089',
      title: 'Village Water Supply System',
      awardedTo: 'Rural Development Co.',
      amount: 340000000,
      awardDate: '2024-01-12',
      startDate: '2024-02-01',
      duration: '8 months'
    },
    {
      id: 2,
      tender: 'TND-2023-087',
      title: 'Hospital Equipment Maintenance',
      awardedTo: 'MedTech Services',
      amount: 125000000,
      awardDate: '2024-01-10',
      startDate: '2024-01-15',
      duration: '12 months'
    },
    {
      id: 3,
      tender: 'TND-2023-085',
      title: 'School Building Renovation',
      awardedTo: 'Education Infrastructure Ltd',
      amount: 890000000,
      awardDate: '2024-01-08',
      startDate: '2024-01-20',
      duration: '6 months'
    }
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
      case 'open': return 'text-green-600';
      case 'evaluation': return 'text-blue-600';
      case 'planning': return 'text-gray-600';
      case 'awarded': return 'text-purple-600';
      case 'preferred': return 'text-blue-600';
      case 'active': return 'text-green-600';
      case 'review': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'construction': return 'bg-orange-100 text-orange-800';
      case 'medical': return 'bg-red-100 text-red-800';
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Public Procurement Management"
        description="Manage tenders, vendor relationships, and procurement processes"
        icon={Building}
        iconColor="text-orange-600"
        searchPlaceholder="Search tenders, vendors, contracts..."
        onSearch={(query) => {
          console.log('Searching procurement data:', query);
        }}
        onRefresh={() => {
          logActivity('procurement_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('create_tender', {})}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tender
          </Button>
        )}
      />

      {/* Procurement Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurementStats.activeTenders}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(procurementStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Annual procurement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Vendors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurementStats.registeredVendors}</div>
            <p className="text-xs text-muted-foreground">Qualified suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurementStats.completedContracts}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tenders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Active Tenders
            </CardTitle>
            <CardDescription>
              Current tender opportunities and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTenders.map((tender) => (
                <div key={tender.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{tender.title}</h4>
                        <Badge className={getCategoryColor(tender.category)} variant="secondary">
                          {tender.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tender.department} • {tender.id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(tender.status)} variant="outline">
                      {tender.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Budget:</p>
                      <p className="font-medium">{formatCurrency(tender.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline:</p>
                      <p className="font-medium">{tender.submissionDeadline}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">
                        Bids received: {tender.bidsReceived}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Tenders
            </Button>
          </CardContent>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Vendor Performance
            </CardTitle>
            <CardDescription>
              Performance metrics for key suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorPerformance.map((vendor) => (
                <div key={vendor.name} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{vendor.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {vendor.contractsCompleted} contracts completed
                      </p>
                    </div>
                    <Badge className={getStatusColor(vendor.status)} variant="outline">
                      {vendor.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">On-time Delivery:</p>
                      <p className="font-medium">{vendor.onTimeDelivery}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quality Score:</p>
                      <p className="font-medium">{vendor.qualityScore}/5.0</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Total Value:</p>
                      <p className="font-medium">{formatCurrency(vendor.totalValue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Vendors
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Procurement by Category
          </CardTitle>
          <CardDescription>
            Breakdown of procurement activities by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {procurementCategories.map((category) => (
              <div key={category.category} className="p-3 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Contracts:</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-medium">{formatCurrency(category.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Duration:</span>
                    <span className="font-medium">{category.avgDuration} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contract Awards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Contract Awards
          </CardTitle>
          <CardDescription>
            Recently awarded contracts and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAwards.map((award) => (
              <div key={award.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{award.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {award.tender} • Awarded to {award.awardedTo}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Start: {award.startDate}</span>
                    <span>Duration: {award.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(award.amount)}</p>
                  <p className="text-xs text-muted-foreground">Awarded {award.awardDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Procurement Management Tools */}
      {hasPermission('procurement:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Procurement Management Tools</CardTitle>
            <CardDescription>
              Advanced tools for managing procurement processes and vendor relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('tender_management', {})}
              >
                <FileText className="w-4 h-4 mr-2" />
                Tender Management
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('vendor_management', {})}
              >
                <Building className="w-4 h-4 mr-2" />
                Vendor Management
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('contract_tracking', {})}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Contract Tracking
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('procurement_analytics', {})}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Analytics & Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};