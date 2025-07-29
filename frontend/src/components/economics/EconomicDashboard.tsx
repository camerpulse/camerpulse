import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Building2, MapPin, Calendar, Users, CheckCircle } from 'lucide-react';
import { useEconomics } from '@/hooks/useEconomics';
import { formatCurrency } from '@/lib/utils';

interface EconomicSummary {
  total_projects: number;
  completed_projects: number;
  completion_rate: number;
  total_budget_fcfa: number;
  active_businesses: number;
  critical_alerts: number;
  region: string;
}

const CAMEROON_REGIONS = [
  'all', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const EconomicDashboard: React.FC = () => {
  const { 
    indicators, 
    projects, 
    businesses, 
    alerts, 
    isLoading, 
    fetchEconomicData, 
    getEconomicSummary, 
    acknowledgeAlert 
  } = useEconomics();
  
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [summary, setSummary] = useState<EconomicSummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      const data = await getEconomicSummary(selectedRegion === 'all' ? undefined : selectedRegion);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setSummary(data as unknown as EconomicSummary);
      }
    };
    
    fetchEconomicData(selectedRegion);
    loadSummary();
  }, [selectedRegion]);

  const getIndicatorTrend = (value: number, type: string) => {
    // Simplified trend logic - in real app this would compare with historical data
    if (type === 'inflation' || type === 'unemployment') {
      return value > 5 ? 'declining' : 'improving';
    }
    return value > 3 ? 'improving' : 'stable';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'ongoing': return 'secondary';
      case 'delayed': return 'destructive';
      case 'suspended': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Economic Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor economic indicators, development projects, and business activity
          </p>
        </div>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {CAMEROON_REGIONS.slice(1).map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Projects</p>
                  <p className="text-2xl font-bold">{summary.total_projects}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.completion_rate}% completion rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_budget_fcfa, 'FCFA')}</p>
                  <p className="text-xs text-muted-foreground">Allocated funds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Active Businesses</p>
                  <p className="text-2xl font-bold">{summary.active_businesses}</p>
                  <p className="text-xs text-muted-foreground">Verified entities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Critical Alerts</p>
                  <p className="text-2xl font-bold">{summary.critical_alerts}</p>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicators">Economic Indicators</TabsTrigger>
          <TabsTrigger value="projects">Development Projects</TabsTrigger>
          <TabsTrigger value="businesses">Local Businesses</TabsTrigger>
          <TabsTrigger value="alerts">Economic Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <Card>
            <CardHeader>
              <CardTitle>Economic Indicators</CardTitle>
              <CardDescription>
                Key economic metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicators.map((indicator) => {
                  const trend = getIndicatorTrend(indicator.value, indicator.indicator_type);
                  return (
                    <div key={indicator.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{indicator.indicator_name}</h3>
                          <Badge variant="outline">{indicator.indicator_type}</Badge>
                          {trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {indicator.region} • {indicator.data_source}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-2xl font-bold">
                          {indicator.value}{indicator.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reliability: {indicator.reliability_score}/10
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Development Projects</CardTitle>
              <CardDescription>
                Government and international development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{project.project_name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {project.region}
                          </span>
                          <span>{project.implementing_agency}</span>
                          <Badge variant={getStatusColor(project.current_status)}>
                            {project.current_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{formatCurrency(project.total_budget, 'FCFA')}</p>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Funding: {project.funding_source}</span>
                      <span>Transparency: {project.transparency_rating}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Local Businesses</CardTitle>
              <CardDescription>
                Verified local businesses and economic actors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <Card key={business.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-medium">{business.business_name}</h3>
                        <p className="text-sm text-muted-foreground">{business.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{business.sector}</Badge>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">Verified</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{business.city}, {business.region}</span>
                        </div>
                        {business.employees_count && (
                          <div className="flex justify-between">
                            <span>Employees:</span>
                            <span>{business.employees_count}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Impact Score:</span>
                          <span>{business.economic_impact_score}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Economic Alerts</CardTitle>
              <CardDescription>
                Critical economic issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                        {alert.affected_region && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {alert.affected_region}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No critical alerts at this time</p>
                    <p className="text-sm">All economic indicators are within normal ranges</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};