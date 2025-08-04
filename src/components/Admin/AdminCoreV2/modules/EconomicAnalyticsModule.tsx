import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { TrendingUp, BarChart3, DollarSign, PieChart, Eye, Download, Calendar, Target } from 'lucide-react';

interface EconomicAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const EconomicAnalyticsModule: React.FC<EconomicAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const analyticsStats = {
    economicGrowth: stats?.economic_growth || 5.8,
    tradeBalance: stats?.trade_balance || 456789000000,
    foreignInvestment: stats?.foreign_investment || 123456789000,
    employmentIndex: stats?.employment_index || 87.3
  };

  const economicTrends = [
    { 
      period: 'Q1 2024', 
      gdp: 5.8, 
      inflation: 3.2, 
      employment: 87.3, 
      investment: 12.4,
      exports: 156.8,
      imports: 142.3
    },
    { 
      period: 'Q4 2023', 
      gdp: 5.5, 
      inflation: 3.7, 
      employment: 86.1, 
      investment: 11.8,
      exports: 148.2,
      imports: 139.7
    },
    { 
      period: 'Q3 2023', 
      gdp: 5.2, 
      inflation: 4.1, 
      employment: 84.9, 
      investment: 10.9,
      exports: 142.5,
      imports: 136.8
    },
    { 
      period: 'Q2 2023', 
      gdp: 4.8, 
      inflation: 4.5, 
      employment: 83.7, 
      investment: 10.2,
      exports: 138.9,
      imports: 134.2
    }
  ];

  const sectorAnalysis = [
    {
      sector: 'Agriculture',
      gdpContribution: 23.5,
      employment: 45.2,
      growth: 4.2,
      productivity: 78.3,
      exports: 34.7
    },
    {
      sector: 'Manufacturing',
      gdpContribution: 18.7,
      employment: 12.8,
      growth: 6.8,
      productivity: 85.6,
      exports: 28.9
    },
    {
      sector: 'Services',
      gdpContribution: 35.2,
      employment: 28.3,
      growth: 7.1,
      productivity: 91.2,
      exports: 15.8
    },
    {
      sector: 'Mining & Energy',
      gdpContribution: 12.8,
      employment: 8.9,
      growth: 3.9,
      productivity: 88.7,
      exports: 42.1
    },
    {
      sector: 'Technology',
      gdpContribution: 9.8,
      employment: 4.8,
      growth: 12.4,
      productivity: 94.5,
      exports: 8.3
    }
  ];

  const regionalEconomics = [
    { region: 'Centre', gdpShare: 28.5, population: 4.2, perCapitaIncome: 1245000, growth: 6.1 },
    { region: 'Littoral', gdpShare: 24.8, population: 3.8, perCapitaIncome: 1876000, growth: 5.9 },
    { region: 'West', gdpShare: 12.3, population: 2.1, perCapitaIncome: 987000, growth: 4.8 },
    { region: 'Northwest', gdpShare: 8.9, population: 2.0, perCapitaIncome: 743000, growth: 4.2 },
    { region: 'Southwest', gdpShare: 7.2, population: 1.6, perCapitaIncome: 856000, growth: 4.5 }
  ];

  const economicIndicators = [
    { name: 'Business Confidence Index', value: 78.5, target: 80, status: 'improving' },
    { name: 'Consumer Price Index', value: 103.2, target: 102, status: 'monitoring' },
    { name: 'Export Competitiveness', value: 67.8, target: 70, status: 'improving' },
    { name: 'Innovation Index', value: 45.3, target: 50, status: 'lagging' },
    { name: 'Ease of Doing Business', value: 156, target: 120, status: 'improving' },
    { name: 'Financial Inclusion Rate', value: 23.7, target: 30, status: 'improving' }
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
      case 'improving': return 'text-green-600';
      case 'monitoring': return 'text-yellow-600';
      case 'lagging': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 6) return 'text-green-600';
    if (growth >= 4) return 'text-blue-600';
    if (growth >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Economic Analytics & Insights"
        description="Comprehensive economic data analysis and performance metrics"
        icon={BarChart3}
        iconColor="text-indigo-600"
        searchPlaceholder="Search metrics, sectors, regions..."
        onSearch={(query) => {
          console.log('Searching economic analytics:', query);
        }}
        onRefresh={() => {
          logActivity('economic_analytics_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('economic_report_export', {})}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        )}
      />

      {/* Key Economic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economic Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.economicGrowth}%</div>
            <p className="text-xs text-muted-foreground">Annual GDP growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trade Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsStats.tradeBalance)}</div>
            <p className="text-xs text-muted-foreground">Exports - Imports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foreign Investment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsStats.foreignInvestment)}</div>
            <p className="text-xs text-muted-foreground">FDI inflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Index</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.employmentIndex}</div>
            <p className="text-xs text-muted-foreground">Employment rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Economic Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quarterly Economic Trends
          </CardTitle>
          <CardDescription>
            Key economic indicators over the past four quarters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Period</th>
                  <th className="text-right p-2">GDP Growth (%)</th>
                  <th className="text-right p-2">Inflation (%)</th>
                  <th className="text-right p-2">Employment (%)</th>
                  <th className="text-right p-2">Investment (%)</th>
                  <th className="text-right p-2">Exports (₣B)</th>
                  <th className="text-right p-2">Imports (₣B)</th>
                </tr>
              </thead>
              <tbody>
                {economicTrends.map((trend) => (
                  <tr key={trend.period} className="border-b">
                    <td className="p-2 font-medium">{trend.period}</td>
                    <td className={`p-2 text-right font-medium ${getGrowthColor(trend.gdp)}`}>
                      {trend.gdp}%
                    </td>
                    <td className="p-2 text-right">{trend.inflation}%</td>
                    <td className="p-2 text-right">{trend.employment}%</td>
                    <td className="p-2 text-right">{trend.investment}%</td>
                    <td className="p-2 text-right">{trend.exports}</td>
                    <td className="p-2 text-right">{trend.imports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sector Analysis
            </CardTitle>
            <CardDescription>
              Economic performance by major sectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorAnalysis.map((sector) => (
                <div key={sector.sector} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{sector.sector}</h4>
                    <Badge className={getGrowthColor(sector.growth)} variant="outline">
                      +{sector.growth}% growth
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">GDP Contribution</p>
                      <p className="font-medium">{sector.gdpContribution}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employment</p>
                      <p className="font-medium">{sector.employment}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Productivity</p>
                      <p className="font-medium">{sector.productivity}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Export Share</p>
                      <p className="font-medium">{sector.exports}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Economics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Regional Economics
            </CardTitle>
            <CardDescription>
              Economic performance by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalEconomics.map((region) => (
                <div key={region.region} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{region.region}</h4>
                    <Badge className={getGrowthColor(region.growth)} variant="outline">
                      {region.growth}% growth
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">GDP Share</p>
                      <p className="font-medium">{region.gdpShare}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Population (M)</p>
                      <p className="font-medium">{region.population}M</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Per Capita Income</p>
                      <p className="font-medium">{formatCurrency(region.perCapitaIncome)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            Progress tracking on important economic metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {economicIndicators.map((indicator) => (
              <div key={indicator.name} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{indicator.name}</h4>
                  <Badge className={getStatusColor(indicator.status)} variant="outline">
                    {indicator.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-medium">{indicator.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Target:</span>
                    <span className="text-muted-foreground">{indicator.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        indicator.value >= indicator.target ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((indicator.value / indicator.target) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tools */}
      {hasPermission('analytics:advanced') && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics Tools</CardTitle>
            <CardDescription>
              Detailed economic analysis and forecasting tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('economic_forecasting', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Economic Forecasting
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('sector_deep_dive', {})}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Sector Deep Dive
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('comparative_analysis', {})}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparative Analysis
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('economic_modeling', {})}
              >
                <Target className="w-4 h-4 mr-2" />
                Economic Modeling
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};