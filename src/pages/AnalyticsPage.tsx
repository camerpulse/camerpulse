import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📊 Civic Analytics</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Data-driven insights into civic engagement, political performance, and democratic participation across Cameroon.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">2.4M</div>
            <p className="text-sm text-muted-foreground">Civic data points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">+24%</div>
            <p className="text-sm text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Regional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">10/10</div>
            <p className="text-sm text-muted-foreground">Regions covered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">Live</div>
            <p className="text-sm text-muted-foreground">Data streaming</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Political Performance Metrics</div>
                <div className="text-sm text-muted-foreground">Track politician ratings and performance over time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-semibold">Civic Engagement Trends</div>
                <div className="text-sm text-muted-foreground">Monitor poll participation and community involvement</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold">Regional Insights</div>
                <div className="text-sm text-muted-foreground">Compare civic activity across different regions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <div className="font-semibold">Interactive Dashboards</div>
              <div className="text-sm text-muted-foreground">Real-time civic engagement visualizations</div>
            </div>
            <div className="border-l-2 border-green-500 pl-4">
              <div className="font-semibold">Predictive Analytics</div>
              <div className="text-sm text-muted-foreground">AI-powered insights for democratic trends</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-4">
              <div className="font-semibold">Export Reports</div>
              <div className="text-sm text-muted-foreground">Download detailed civic analytics reports</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Advanced Analytics Platform</h2>
        <p className="text-muted-foreground mb-6">
          Our comprehensive analytics system will provide deep insights into civic engagement patterns, political performance, and democratic participation across Cameroon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/auth">Access Analytics</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;