import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart3, TrendingUp, MapPin } from 'lucide-react';

interface BudgetVisualizationProps {
  budgetData: any[] | undefined;
}

export const BudgetVisualization: React.FC<BudgetVisualizationProps> = ({ budgetData }) => {
  if (!budgetData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sector Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget by Sector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded">
            <span className="text-muted-foreground">Sunburst Chart: Budget Distribution by Sector</span>
          </div>
        </CardContent>
      </Card>

      {/* Ministry Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ministry Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded">
            <span className="text-muted-foreground">Bar Chart: Ministry Budget Comparison</span>
          </div>
        </CardContent>
      </Card>

      {/* Regional Allocation Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Regional Allocation Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded">
            <span className="text-muted-foreground">Interactive Map: Budget by Region</span>
          </div>
        </CardContent>
      </Card>

      {/* Execution Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Execution Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded">
            <span className="text-muted-foreground">Line Chart: Budget Execution Over Time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};