import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart3, TrendingUp, MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface BudgetVisualizationProps {
  budgetData: any[] | undefined;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const BudgetVisualization: React.FC<BudgetVisualizationProps> = ({ budgetData }) => {
  if (!budgetData) return null;

  const sectorData = useMemo(() => {
    const sectorBreakdown = budgetData.reduce((acc, item) => {
      acc[item.sector] = (acc[item.sector] || 0) + (item.allocated_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorBreakdown).map(([name, value]) => ({
      name,
      value: value as number
    }));
  }, [budgetData]);

  const ministryData = useMemo(() => {
    const ministryBreakdown = budgetData.reduce((acc, item) => {
      acc[item.ministry_department] = (acc[item.ministry_department] || 0) + (item.allocated_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ministryBreakdown)
      .map(([name, value]) => ({ name, allocated: value as number }))
      .sort((a, b) => b.allocated - a.allocated)
      .slice(0, 10);
  }, [budgetData]);

  const regionData = useMemo(() => {
    const regionBreakdown = budgetData.reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + (item.allocated_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionBreakdown).map(([name, value]) => ({
      name,
      allocation: value as number
    }));
  }, [budgetData]);

  const executionTrends = useMemo(() => {
    const yearlyData = budgetData.reduce((acc, item) => {
      const year = item.budget_year;
      if (!acc[year]) {
        acc[year] = { year, allocated: 0, spent: 0, count: 0 };
      }
      acc[year].allocated += item.allocated_amount || 0;
      acc[year].spent += item.spent_amount || 0;
      acc[year].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(yearlyData).map((item: any) => ({
      ...item,
      executionRate: item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0
    }));
  }, [budgetData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(1)}K`;
  };

  const downloadChart = (chartName: string) => {
    // In a real implementation, this would export the chart as an image
    console.log(`Downloading ${chartName} chart`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sector Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget by Sector
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => downloadChart('sector')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ministry Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Ministry Allocations
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => downloadChart('ministry')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ministryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="allocated" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Allocation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Allocation
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => downloadChart('regional')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis dataKey="name" type="category" width={80} fontSize={12} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="allocation" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Execution Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Execution Trends
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => downloadChart('execution')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="executionRate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Execution Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};