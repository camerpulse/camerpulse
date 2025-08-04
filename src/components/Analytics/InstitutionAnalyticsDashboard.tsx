import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Award } from 'lucide-react';

interface InstitutionAnalyticsDashboardProps {
  institutionId?: string;
  institutionType?: string;
  institutionName?: string;
}

export const InstitutionAnalyticsDashboard: React.FC<InstitutionAnalyticsDashboardProps> = ({
  institutionId,
  institutionType,
  institutionName
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {institutionName ? `${institutionName} Analytics` : 'Institution Analytics'}
        </h2>
        <p className="text-muted-foreground">
          Analytics and insights for {institutionType || 'educational'} institutions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground">
              +12% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              Above national average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Awards this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92</div>
            <p className="text-xs text-muted-foreground">
              Data quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Institution Analytics Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Institution Analytics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analytics for educational institutions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            We're building comprehensive analytics tools specifically for educational institutions.
          </p>
          <Badge variant="secondary">In Development</Badge>
        </CardContent>
      </Card>
    </div>
  );
};