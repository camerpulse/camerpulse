import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  FileText, 
  Clock, 
  Target,
  BarChart3
} from 'lucide-react';

interface JobAnalyticsProps {
  jobId: string;
  analytics: {
    views: number;
    applications: number;
    clickThroughRate: number;
    responseRate: number;
    timeToFill?: number;
    topSources: Array<{ source: string; count: number; percentage: number }>;
    demographics: {
      age: Array<{ range: string; count: number }>;
      location: Array<{ region: string; count: number }>;
      experience: Array<{ level: string; count: number }>;
    };
  };
}

export const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobId, analytics }) => {
  const conversionRate = analytics.views > 0 ? (analytics.applications / analytics.views) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.views.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.applications}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.clickThroughRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your applicants are coming from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{source.source}</span>
                  <Badge variant="outline">{source.count} ({source.percentage}%)</Badge>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applicant Demographics
            </CardTitle>
            <CardDescription>Breakdown of your applicant pool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Experience Level</h4>
              <div className="space-y-2">
                {analytics.demographics.experience.map((exp, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{exp.level}</span>
                    <Badge variant="outline">{exp.count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Top Regions</h4>
              <div className="space-y-2">
                {analytics.demographics.location.slice(0, 3).map((loc, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{loc.region}</span>
                    <Badge variant="outline">{loc.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversionRate < 2 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Low conversion rate:</strong> Consider improving your job description or adjusting requirements to attract more applications.
              </p>
            </div>
          )}
          
          {analytics.views < 100 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Low visibility:</strong> Consider promoting this job or adding more relevant keywords to increase views.
              </p>
            </div>
          )}

          {analytics.applications > 50 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>High interest:</strong> This position is attracting strong candidate interest. Consider raising requirements if needed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};