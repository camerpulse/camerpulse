import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsChartProps {
  title: string;
  data: unknown;
  className?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, data, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center bg-muted rounded">
        Chart placeholder - Data: {JSON.stringify(data).slice(0, 50)}...
      </div>
    </CardContent>
  </Card>
);