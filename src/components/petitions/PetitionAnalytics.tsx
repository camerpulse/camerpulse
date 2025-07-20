import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Download,
  Filter,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface AnalyticsData {
  signaturesByDay: { date: string; count: number }[];
  signaturesByRegion: { region: string; count: number; percentage: number }[];
  topPetitions: { id: string; title: string; signatures: number; growth: number }[];
  demographics: { ageGroup: string; count: number; percentage: number }[];
  performanceMetrics: {
    averageSignaturesPerDay: number;
    conversionRate: number;
    averageTimeToGoal: number;
    completionRate: number;
  };
}

interface PetitionAnalyticsProps {
  petitionId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

export function PetitionAnalytics({ petitionId, timeRange = '30d' }: PetitionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchAnalytics();
  }, [petitionId, selectedTimeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - in real implementation, this would fetch from Supabase
      const mockData: AnalyticsData = {
        signaturesByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 20
        })),
        signaturesByRegion: [
          { region: 'Centre', count: 1250, percentage: 35.2 },
          { region: 'Littoral', count: 890, percentage: 25.1 },
          { region: 'West', count: 567, percentage: 16.0 },
          { region: 'Northwest', count: 345, percentage: 9.7 },
          { region: 'Southwest', count: 298, percentage: 8.4 },
          { region: 'Other', count: 195, percentage: 5.5 }
        ],
        topPetitions: [
          { id: '1', title: 'Improve Road Infrastructure in Douala', signatures: 2450, growth: 15.2 },
          { id: '2', title: 'Better Healthcare Access in Rural Areas', signatures: 1890, growth: 22.1 },
          { id: '3', title: 'Educational Reform Initiative', signatures: 1567, growth: 8.7 },
          { id: '4', title: 'Environmental Protection Laws', signatures: 1234, growth: 31.4 },
          { id: '5', title: 'Youth Employment Programs', signatures: 987, growth: 12.8 }
        ],
        demographics: [
          { ageGroup: '18-25', count: 1420, percentage: 40.1 },
          { ageGroup: '26-35', count: 1065, percentage: 30.1 },
          { ageGroup: '36-45', count: 638, percentage: 18.0 },
          { ageGroup: '46-55', count: 284, percentage: 8.0 },
          { ageGroup: '55+', count: 134, percentage: 3.8 }
        ],
        performanceMetrics: {
          averageSignaturesPerDay: 67.3,
          conversionRate: 23.4,
          averageTimeToGoal: 45,
          completionRate: 68.2
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = (format: 'csv' | 'pdf' | 'png') => {
    console.log(`Exporting analytics as ${format}`);
    // Mock export functionality
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Petition Analytics</h2>
          <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as '7d' | '30d' | '90d' | '1y' | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAnalytics('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportAnalytics('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportAnalytics('png')}>
            <Download className="h-4 w-4 mr-2" />
            Chart
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Daily Signatures</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.averageSignaturesPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Goal</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.averageTimeToGoal}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signatures" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signatures">Signature Trends</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Signature Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Signature trend chart would render here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing {analytics.signaturesByDay.length} days of data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Signatures by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.signaturesByRegion.map((region, index) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}></div>
                      <span className="font-medium">{region.region}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${region.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {region.count} ({region.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Age Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.demographics.map((demo, index) => (
                  <div key={demo.ageGroup} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: `hsl(${index * 45 + 180}, 70%, 50%)`
                      }}></div>
                      <span className="font-medium">{demo.ageGroup} years</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-secondary"
                          style={{ width: `${demo.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {demo.count} ({demo.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Petitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPetitions.map((petition, index) => (
                    <div key={petition.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{petition.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {petition.signatures} signatures
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600">
                          +{petition.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Peak Activity</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Most signatures collected between 6-9 PM on weekdays
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100">Best Categories</h4>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Infrastructure and healthcare petitions perform 40% better
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">Optimization</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-200">
                      Adding images increases signature rate by 65%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}