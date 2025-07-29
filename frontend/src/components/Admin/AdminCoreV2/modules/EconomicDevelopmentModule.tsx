import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { TrendingUp, BarChart3, Building, Factory, Users, Eye, Plus, Target } from 'lucide-react';

interface EconomicDevelopmentModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const EconomicDevelopmentModule: React.FC<EconomicDevelopmentModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const economicStats = {
    gdpGrowth: stats?.gdp_growth || 5.8, // percentage
    unemployment: stats?.unemployment_rate || 12.3,
    businessLicenses: stats?.business_licenses || 1456,
    activeProjects: stats?.active_projects || 23
  };

  const developmentProjects = [
    {
      id: 1,
      name: 'Douala Port Expansion',
      sector: 'Infrastructure',
      budget: 45000000000,
      progress: 67,
      startDate: '2023-03-15',
      expectedCompletion: '2025-12-31',
      status: 'on-track',
      region: 'Littoral'
    },
    {
      id: 2,
      name: 'Yaoundé Tech Hub Development',
      sector: 'Technology',
      budget: 12500000000,
      progress: 34,
      startDate: '2023-08-01',
      expectedCompletion: '2024-10-15',
      status: 'delayed',
      region: 'Centre'
    },
    {
      id: 3,
      name: 'Agricultural Processing Center',
      sector: 'Agriculture',
      budget: 8750000000,
      progress: 89,
      startDate: '2022-11-10',
      expectedCompletion: '2024-03-30',
      status: 'on-track',
      region: 'West'
    },
    {
      id: 4,
      name: 'Tourism Infrastructure Bamenda',
      sector: 'Tourism',
      budget: 6200000000,
      progress: 23,
      startDate: '2023-12-01',
      expectedCompletion: '2025-06-15',
      status: 'planning',
      region: 'Northwest'
    }
  ];

  const economicIndicators = [
    { indicator: 'GDP Growth Rate', value: '5.8%', trend: '+0.3%', period: 'Q4 2023' },
    { indicator: 'Inflation Rate', value: '3.2%', trend: '-0.5%', period: 'Dec 2023' },
    { indicator: 'Foreign Investment', value: '₣78.5B', trend: '+12%', period: '2023' },
    { indicator: 'Export Value', value: '₣156.8B', trend: '+8%', period: '2023' }
  ];

  const sectorPerformance = [
    { sector: 'Agriculture', contribution: 23.5, growth: 4.2, color: 'bg-green-500' },
    { sector: 'Manufacturing', contribution: 18.7, growth: 6.8, color: 'bg-blue-500' },
    { sector: 'Services', contribution: 35.2, growth: 7.1, color: 'bg-purple-500' },
    { sector: 'Mining', contribution: 12.8, growth: 3.9, color: 'bg-orange-500' },
    { sector: 'Technology', contribution: 9.8, growth: 12.4, color: 'bg-cyan-500' }
  ];

  const businessInitiatives = [
    { name: 'SME Support Program', beneficiaries: 1456, funding: 2500000000, status: 'active' },
    { name: 'Youth Entrepreneurship Fund', beneficiaries: 892, funding: 1800000000, status: 'active' },
    { name: 'Women in Business Initiative', beneficiaries: 634, funding: 1200000000, status: 'completed' },
    { name: 'Digital Economy Acceleration', beneficiaries: 423, funding: 3400000000, status: 'planning' }
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
      case 'delayed': return 'text-red-600';
      case 'planning': return 'text-blue-600';
      case 'completed': return 'text-gray-600';
      case 'active': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Economic Development"
        description="Monitor economic growth, development projects, and business initiatives"
        icon={TrendingUp}
        iconColor="text-blue-600"
        searchPlaceholder="Search projects, sectors, initiatives..."
        onSearch={(query) => {
          console.log('Searching economic data:', query);
        }}
        onRefresh={() => {
          logActivity('economic_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('economic_project_create', {})}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      />

      {/* Economic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDP Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicStats.gdpGrowth}%</div>
            <p className="text-xs text-muted-foreground">Annual growth rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unemployment Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicStats.unemployment}%</div>
            <p className="text-xs text-muted-foreground">Current rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Licenses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicStats.businessLicenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Development projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Economic Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Economic Indicators
          </CardTitle>
          <CardDescription>
            Important economic metrics and their trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {economicIndicators.map((indicator) => (
              <div key={indicator.indicator} className="text-center p-4 rounded-lg border">
                <h4 className="font-medium text-sm">{indicator.indicator}</h4>
                <p className="text-2xl font-bold mt-2">{indicator.value}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-sm text-green-600">{indicator.trend}</span>
                  <span className="text-xs text-muted-foreground">({indicator.period})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Development Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Major Development Projects
            </CardTitle>
            <CardDescription>
              Large-scale projects driving economic growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {developmentProjects.map((project) => (
                <div key={project.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {project.sector} • {project.region}
                      </p>
                    </div>
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress: {project.progress}%</span>
                      <span>Budget: {formatCurrency(project.budget)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expected completion: {project.expectedCompletion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Projects
            </Button>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sector Performance
            </CardTitle>
            <CardDescription>
              Economic contribution and growth by sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorPerformance.map((sector) => (
                <div key={sector.sector} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{sector.sector}</h4>
                    <div className="text-right">
                      <p className="text-sm font-medium">{sector.contribution}% of GDP</p>
                      <p className="text-xs text-green-600">+{sector.growth}% growth</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${sector.color}`}
                      style={{ width: `${sector.contribution}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Business Initiatives */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Business Support Initiatives</h4>
              <div className="space-y-2">
                {businessInitiatives.map((initiative) => (
                  <div key={initiative.name} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <h5 className="font-medium text-sm">{initiative.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {initiative.beneficiaries} beneficiaries
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(initiative.funding)}</p>
                      <Badge className={getStatusColor(initiative.status)} variant="outline">
                        {initiative.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic Development Tools */}
      {hasPermission('economic:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Economic Development Tools</CardTitle>
            <CardDescription>
              Tools for managing economic development and business support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('economic_planning', {})}
              >
                <Target className="w-4 h-4 mr-2" />
                Economic Planning
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('investment_tracking', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Investment Tracking
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('business_support', {})}
              >
                <Building className="w-4 h-4 mr-2" />
                Business Support
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('sector_analysis', {})}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Sector Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};