import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useGovernmentTransparencyData } from '@/hooks/useGovernmentTransparencyData';

export const GovernmentTransparency = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  
  const { 
    ministries, 
    budgetData, 
    procurementData, 
    serviceData,
    overallStats,
    isLoading 
  } = useGovernmentTransparencyData();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredMinistries = ministries?.filter(ministry => 
    (selectedMinistry === 'all' || ministry.id === selectedMinistry) &&
    (searchTerm === '' || ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ministry.minister.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Government Transparency Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor government operations, budget execution, and service delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallStats?.overallScore || 91}%</span>
              {getTrendIcon('up')}
            </div>
            <Progress value={overallStats?.overallScore || 91} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Ministries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{ministries?.length || 23}</span>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {ministries?.filter(m => m.transparencyScore >= 80).length || 18} performing well
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{budgetData?.overall || 87}%</span>
              {getTrendIcon('up')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((budgetData?.transparentAmount || 0) / 1000000000).toFixed(1)}B FCFA tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Public Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{procurementData?.transparentContracts || 847}</span>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {procurementData?.overall || 84}% transparency rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ministries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ministries">Ministry Performance</TabsTrigger>
          <TabsTrigger value="budget">Budget Tracking</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="services">Service Delivery</TabsTrigger>
        </TabsList>

        {/* Ministry Performance Tab */}
        <TabsContent value="ministries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Ministry Performance Tracker</CardTitle>
                  <CardDescription>
                    Real-time transparency and performance metrics for all government ministries
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search ministries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by ministry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ministries</SelectItem>
                      {ministries?.map(ministry => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name.split(' ').slice(0, 2).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMinistries.map((ministry) => (
                  <Card key={ministry.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{ministry.name}</h3>
                            <Badge 
                              className={getScoreColor(ministry.transparencyScore)}
                              variant="secondary"
                            >
                              {ministry.transparencyScore}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Minister: <span className="font-medium">{ministry.minister}</span>
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Budget Transparency</p>
                              <div className="flex items-center gap-2">
                                <Progress value={ministry.budgetTransparency} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{ministry.budgetTransparency}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Public Reporting</p>
                              <div className="flex items-center gap-2">
                                <Progress value={ministry.publicReporting} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{ministry.publicReporting}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Citizen Engagement</p>
                              <div className="flex items-center gap-2">
                                <Progress value={ministry.citizenEngagement} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{ministry.citizenEngagement}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Data Access</p>
                              <div className="flex items-center gap-2">
                                <Progress value={ministry.dataAccessibility} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{ministry.dataAccessibility}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(ministry.lastAssessment).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tracking Tab */}
        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
                <CardDescription>National budget transparency metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">
                      {((budgetData?.totalBudget || 0) / 1000000000).toFixed(1)}B FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transparent Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {((budgetData?.transparentAmount || 0) / 1000000000).toFixed(1)}B FCFA
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Budget Allocation</span>
                      <span>{budgetData?.allocation || 96}%</span>
                    </div>
                    <Progress value={budgetData?.allocation || 96} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Execution Rate</span>
                      <span>{budgetData?.execution || 94}%</span>
                    </div>
                    <Progress value={budgetData?.execution || 94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Public Access</span>
                      <span>{budgetData?.publicAccess || 87}%</span>
                    </div>
                    <Progress value={budgetData?.publicAccess || 87} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Audit Compliance</span>
                      <span>{budgetData?.auditCompliance || 92}%</span>
                    </div>
                    <Progress value={budgetData?.auditCompliance || 92} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Alerts & Issues</CardTitle>
                <CardDescription>Current budget transparency concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">High Priority</p>
                      <p className="text-sm text-red-700">
                        Ministry of Infrastructure budget allocation still pending public disclosure
                      </p>
                      <p className="text-xs text-red-600 mt-1">2 days overdue</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Medium Priority</p>
                      <p className="text-sm text-yellow-700">
                        Q3 execution reports missing from 3 ministries
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Due in 3 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Resolved</p>
                      <p className="text-sm text-green-700">
                        Ministry of Health published complete budget breakdown
                      </p>
                      <p className="text-xs text-green-600 mt-1">Resolved 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Procurement Tab */}
        <TabsContent value="procurement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Public Procurement Monitoring
              </CardTitle>
              <CardDescription>
                Track transparency in government contracts and tenders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{procurementData?.totalContracts || 1247}</p>
                  <p className="text-sm text-muted-foreground">Total Contracts</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{procurementData?.transparentContracts || 847}</p>
                  <p className="text-sm text-muted-foreground">Transparent Contracts</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">
                    {((procurementData?.totalValue || 0) / 1000000000).toFixed(1)}B FCFA
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Process Transparency</span>
                    <span>{procurementData?.processTransparency || 89}%</span>
                  </div>
                  <Progress value={procurementData?.processTransparency || 89} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contract Publication</span>
                    <span>{procurementData?.contractPublication || 92}%</span>
                  </div>
                  <Progress value={procurementData?.contractPublication || 92} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bidder Information</span>
                    <span>{procurementData?.bidderInformation || 78}%</span>
                  </div>
                  <Progress value={procurementData?.bidderInformation || 78} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Award Criteria</span>
                    <span>{procurementData?.awardCriteria || 85}%</span>
                  </div>
                  <Progress value={procurementData?.awardCriteria || 85} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Delivery Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Public Service Delivery
              </CardTitle>
              <CardDescription>
                Monitor transparency in public service delivery and citizen satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceData?.map((service) => (
                  <Card key={service.id} className="border-l-4 border-l-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.department}</p>
                        </div>
                        <Badge className={getScoreColor(service.transparencyScore)} variant="secondary">
                          {service.transparencyScore}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Service Delivery</p>
                          <div className="flex items-center gap-2">
                            <Progress value={service.serviceDelivery} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{service.serviceDelivery}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cost Transparency</p>
                          <div className="flex items-center gap-2">
                            <Progress value={service.costTransparency} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{service.costTransparency}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Process Clarity</p>
                          <div className="flex items-center gap-2">
                            <Progress value={service.processClarity} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{service.processClarity}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Citizen Feedback</p>
                          <div className="flex items-center gap-2">
                            <Progress value={service.citizenFeedback} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{service.citizenFeedback}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};