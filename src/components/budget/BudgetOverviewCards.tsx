import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Target, PieChart } from 'lucide-react';

interface BudgetOverviewCardsProps {
  statistics: {
    totalAllocated: number;
    totalSpent: number;
    avgExecution: number;
    highRiskProjects: number;
    completedProjects: number;
    totalProjects: number;
    executionRate: number;
  } | null;
  budgetData: any[] | undefined;
}

export const BudgetOverviewCards: React.FC<BudgetOverviewCardsProps> = ({ statistics, budgetData }) => {
  if (!statistics) return null;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(1)}T FCFA`;
    } else if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const sectorBreakdown = budgetData?.reduce((acc, item) => {
    acc[item.sector] = (acc[item.sector] || 0) + item.allocated_amount_fcfa;
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorBreakdown || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalAllocated)}</div>
            <p className="text-xs text-muted-foreground">
              National budget allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.executionRate}% execution rate
            </p>
            <Progress value={statistics.executionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completedProjects}/{statistics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((statistics.completedProjects / statistics.totalProjects) * 100)}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Projects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.highRiskProjects}</div>
            <p className="text-xs text-muted-foreground">
              Require close monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Sectors by Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSectors.map(([sector, amount]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sector}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((amount / statistics.totalAllocated) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Execution</span>
                  <span>{statistics.executionRate}%</span>
                </div>
                <Progress value={statistics.executionRate} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Project Completion</span>
                  <span>{Math.round((statistics.completedProjects / statistics.totalProjects) * 100)}%</span>
                </div>
                <Progress value={(statistics.completedProjects / statistics.totalProjects) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Assessment</span>
                  <span>{Math.round(((statistics.totalProjects - statistics.highRiskProjects) / statistics.totalProjects) * 100)}% Low Risk</span>
                </div>
                <Progress value={((statistics.totalProjects - statistics.highRiskProjects) / statistics.totalProjects) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};