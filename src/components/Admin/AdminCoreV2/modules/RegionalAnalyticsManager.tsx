import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, TrendingUp, Users } from 'lucide-react';

interface RegionalAnalyticsManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const RegionalAnalyticsManager: React.FC<RegionalAnalyticsManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for regional analytics
  const regions = [
    {
      name: 'Centre',
      population: 4500000,
      sentiment_score: 75,
      poll_participation: 68,
      civic_engagement: 82
    },
    {
      name: 'Littoral',
      population: 3200000,
      sentiment_score: 62,
      poll_participation: 71,
      civic_engagement: 78
    },
    {
      name: 'Northwest',
      population: 2100000,
      sentiment_score: 45,
      poll_participation: 54,
      civic_engagement: 65
    },
    {
      name: 'Southwest',
      population: 1800000,
      sentiment_score: 41,
      poll_participation: 52,
      civic_engagement: 61
    }
  ];

  const totalPopulation = regions.reduce((sum, r) => sum + r.population, 0);
  const avgSentiment = Math.round(regions.reduce((sum, r) => sum + r.sentiment_score, 0) / regions.length);
  const avgParticipation = Math.round(regions.reduce((sum, r) => sum + r.poll_participation, 0) / regions.length);

  const handleGenerateReport = (regionName: string) => {
    logActivity('regional_report_generated', { region: regionName });
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-blue-600" />
          Regional Analytics Management
        </h2>
        <p className="text-muted-foreground">Monitor regional performance and civic engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{regions.length}</p>
                <p className="text-sm text-muted-foreground">Regions Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{(totalPopulation / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Total Population</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{avgSentiment}%</p>
                <p className="text-sm text-muted-foreground">Avg Sentiment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{avgParticipation}%</p>
                <p className="text-sm text-muted-foreground">Participation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Dashboard</CardTitle>
          <CardDescription>Monitor civic engagement and sentiment across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{region.name} Region</h3>
                    <p className="text-sm text-muted-foreground">
                      Population: {region.population.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(region.name)}
                  >
                    Generate Report
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getSentimentColor(region.sentiment_score)}`}>
                      {region.sentiment_score}%
                    </div>
                    <p className="text-xs text-muted-foreground">Sentiment Score</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {region.poll_participation}%
                    </div>
                    <p className="text-xs text-muted-foreground">Poll Participation</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {region.civic_engagement}%
                    </div>
                    <p className="text-xs text-muted-foreground">Civic Engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Comparison</CardTitle>
            <CardDescription>Compare performance metrics across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Highest Sentiment</h4>
                <div className="flex justify-between items-center">
                  <span>Centre Region</span>
                  <Badge variant="default">75%</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Highest Participation</h4>
                <div className="flex justify-between items-center">
                  <span>Littoral Region</span>
                  <Badge variant="default">71%</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Needs Attention</h4>
                <div className="flex justify-between items-center">
                  <span>Southwest Region</span>
                  <Badge variant="destructive">41% sentiment</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Tools</CardTitle>
            <CardDescription>Regional analysis and reporting tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                Export Regional Data
              </Button>
              
              <Button className="w-full" variant="outline">
                Generate Comparative Report
              </Button>
              
              <Button className="w-full" variant="outline">
                Schedule Automated Reports
              </Button>
              
              <Button className="w-full" variant="outline">
                Configure Alert Thresholds
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};