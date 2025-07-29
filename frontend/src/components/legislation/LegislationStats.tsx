import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface LegislationStatsProps {
  stats?: {
    total_bills: number;
    active_bills: number;
    passed_bills: number;
    rejected_bills: number;
    total_citizen_votes: number;
    avg_citizen_engagement: number;
  };
}

export const LegislationStats: React.FC<LegislationStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_bills}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active_bills} currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passed Laws</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.passed_bills}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.passed_bills / stats.total_bills) * 100).toFixed(1)}% success rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Citizen Votes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_citizen_votes.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.avg_citizen_engagement.toFixed(1)} avg per bill
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected Bills</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rejected_bills}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.rejected_bills / stats.total_bills) * 100).toFixed(1)}% rejection rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};