import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Activity, TrendingUp, Users, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface HealthAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const HealthAnalyticsModule: React.FC<HealthAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for health analytics
  const healthMetrics = {
    patientLoad: 89234,
    bedOccupancy: 78.5,
    averageWaitTime: 45, // minutes
    satisfactionScore: 4.2,
    emergencyResponse: 12, // minutes
    mortalityRate: 2.3 // percentage
  };

  const regionalData = [
    { region: 'Centre', hospitals: 45, pharmacies: 234, capacity: 85, utilization: 78 },
    { region: 'Littoral', hospitals: 38, pharmacies: 198, capacity: 82, utilization: 88 },
    { region: 'West', hospitals: 32, pharmacies: 167, capacity: 76, utilization: 65 },
    { region: 'Northwest', hospitals: 28, pharmacies: 145, capacity: 71, utilization: 72 },
    { region: 'Southwest', hospitals: 25, pharmacies: 123, capacity: 68, utilization: 79 }
  ];

  const diseaseOutbreaks = [
    {
      disease: 'Malaria',
      region: 'East',
      cases: 1250,
      trend: 'increasing',
      severity: 'medium',
      lastWeek: 980
    },
    {
      disease: 'Cholera',
      region: 'Far North',
      cases: 156,
      trend: 'stable',
      severity: 'high',
      lastWeek: 158
    },
    {
      disease: 'Typhoid',
      region: 'Adamawa',
      cases: 89,
      trend: 'decreasing',
      severity: 'low',
      lastWeek: 112
    }
  ];

  const performanceMetrics = [
    {
      facility: 'Yaoundé General Hospital',
      type: 'Hospital',
      region: 'Centre',
      patientSatisfaction: 4.5,
      waitTime: 35,
      bedOccupancy: 88,
      staff: 245
    },
    {
      facility: 'Douala Regional Hospital',
      type: 'Hospital',
      region: 'Littoral',
      patientSatisfaction: 4.2,
      waitTime: 42,
      bedOccupancy: 92,
      staff: 198
    },
    {
      facility: 'Pharmacie Centrale',
      type: 'Pharmacy',
      region: 'Centre',
      patientSatisfaction: 4.7,
      waitTime: 15,
      bedOccupancy: null,
      staff: 28
    }
  ];

  const getTrendColor = (trend: string) => {
    const colors = {
      increasing: 'text-red-600',
      decreasing: 'text-green-600',
      stable: 'text-yellow-600'
    };
    return colors[trend as keyof typeof colors] || 'text-gray-600';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    };
    return <Badge variant={variants[severity] || "outline"}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Health Analytics"
        description="Monitor health system performance and disease surveillance"
        icon={Activity}
        iconColor="text-green-600"
        searchPlaceholder="Search health data..."
        onSearch={(query) => {
          console.log('Searching health analytics:', query);
        }}
        onRefresh={() => {
          logActivity('health_analytics_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
          <TabsTrigger value="surveillance">Disease Surveillance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.patientLoad.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Monthly active patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.bedOccupancy}%</div>
                <Progress value={healthMetrics.bedOccupancy} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.averageWaitTime}m</div>
                <p className="text-xs text-muted-foreground">Patient wait time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.satisfactionScore}</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Response</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.emergencyResponse}m</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.mortalityRate}%</div>
                <p className="text-xs text-muted-foreground">Hospital mortality rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Health System Overview</CardTitle>
              <CardDescription>Key metrics and trends across the national health system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Capacity Utilization</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Hospital Beds</span>
                        <span>{healthMetrics.bedOccupancy}%</span>
                      </div>
                      <Progress value={healthMetrics.bedOccupancy} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Service Quality</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Patient Satisfaction</span>
                        <span>{healthMetrics.satisfactionScore}/5.0</span>
                      </div>
                      <Progress value={(healthMetrics.satisfactionScore / 5) * 100} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Health Infrastructure</CardTitle>
              <CardDescription>Health facility distribution and utilization by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{region.region}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{region.hospitals} hospitals</span>
                        <span>{region.pharmacies} pharmacies</span>
                        <span>Capacity: {region.capacity}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 w-48">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span>{region.utilization}%</span>
                      </div>
                      <Progress value={region.utilization} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveillance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Outbreaks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Requiring monitoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,495</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Regions under alert</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Disease Surveillance Dashboard</CardTitle>
              <CardDescription>Real-time monitoring of disease outbreaks and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diseaseOutbreaks.map((outbreak, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{outbreak.disease}</h3>
                        {getSeverityBadge(outbreak.severity)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{outbreak.region} Region</span>
                        <span>{outbreak.cases} cases</span>
                        <span className={getTrendColor(outbreak.trend)}>
                          {outbreak.trend} from {outbreak.lastWeek} last week
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`h-4 w-4 ${getTrendColor(outbreak.trend)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facility Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for hospitals and pharmacies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{facility.facility}</h3>
                        <Badge variant="outline">{facility.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{facility.region}</span>
                        <span>Satisfaction: {facility.patientSatisfaction}/5.0</span>
                        <span>Wait: {facility.waitTime}min</span>
                        {facility.bedOccupancy && <span>Occupancy: {facility.bedOccupancy}%</span>}
                        <span>{facility.staff} staff</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24">
                        <Progress value={(facility.patientSatisfaction / 5) * 100} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};