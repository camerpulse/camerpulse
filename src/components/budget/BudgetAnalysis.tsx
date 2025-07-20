import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Users,
  MapPin,
  Building
} from 'lucide-react';

interface BudgetAnalysisProps {
  budgetData: any[] | undefined;
}

export const BudgetAnalysis: React.FC<BudgetAnalysisProps> = ({ budgetData }) => {
  if (!budgetData) return null;

  const analysis = useMemo(() => {
    const totalProjects = budgetData.length;
    const totalAllocated = budgetData.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + (item.spent_amount || 0), 0);
    
    // Execution analysis
    const averageExecution = budgetData.reduce((sum, item) => sum + (item.execution_percentage || 0), 0) / totalProjects;
    const lowPerformingProjects = budgetData.filter(item => (item.execution_percentage || 0) < 30).length;
    const completedProjects = budgetData.filter(item => item.status === 'completed').length;
    
    // Transparency analysis
    const averageTransparency = budgetData.reduce((sum, item) => sum + (item.transparency_score || 0), 0) / totalProjects;
    const highRiskProjects = budgetData.filter(item => (item.transparency_score || 0) < 30).length;
    
    // Regional distribution
    const regionalSpread = budgetData.reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Ministry analysis
    const ministryAllocation = budgetData.reduce((acc, item) => {
      acc[item.ministry_department] = (acc[item.ministry_department] || 0) + (item.allocated_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const topMinistry = Object.entries(ministryAllocation)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    // Sector analysis
    const sectorAllocation = budgetData.reduce((acc, item) => {
      acc[item.sector] = (acc[item.sector] || 0) + (item.allocated_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const topSector = Object.entries(sectorAllocation)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    // Alerts and recommendations
    const alerts = [];
    const recommendations = [];

    if (averageExecution < 50) {
      alerts.push({
        type: 'warning',
        title: 'Low Execution Rate',
        message: `Average execution rate is ${averageExecution.toFixed(1)}%, below optimal threshold of 70%`
      });
      recommendations.push('Implement stronger project monitoring and evaluation systems');
    }

    if (highRiskProjects > totalProjects * 0.3) {
      alerts.push({
        type: 'danger',
        title: 'High Risk Projects',
        message: `${highRiskProjects} projects (${((highRiskProjects/totalProjects)*100).toFixed(1)}%) have low transparency scores`
      });
      recommendations.push('Enhance transparency measures and public disclosure requirements');
    }

    if (lowPerformingProjects > totalProjects * 0.2) {
      alerts.push({
        type: 'warning',
        title: 'Underperforming Projects',
        message: `${lowPerformingProjects} projects are significantly behind schedule`
      });
      recommendations.push('Review project implementation strategies and resource allocation');
    }

    return {
      totalProjects,
      totalAllocated,
      totalSpent,
      averageExecution,
      lowPerformingProjects,
      completedProjects,
      averageTransparency,
      highRiskProjects,
      regionalSpread,
      topMinistry,
      topSector,
      alerts,
      recommendations
    };
  }, [budgetData]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(amount / 1000).toFixed(1)}K FCFA`;
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{analysis.totalProjects}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold">{formatCurrency(analysis.totalAllocated)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Execution</p>
                <p className="text-2xl font-bold">{analysis.averageExecution.toFixed(1)}%</p>
              </div>
              {analysis.averageExecution >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Projects</p>
                <p className="text-2xl font-bold">{analysis.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {analysis.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Budget Analysis Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.alerts.map((alert, index) => (
              <Alert key={index} className={alert.type === 'danger' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.title}:</strong> {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Average Execution Rate</span>
                <span>{analysis.averageExecution.toFixed(1)}%</span>
              </div>
              <Progress value={analysis.averageExecution} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Transparency Score</span>
                <span>{analysis.averageTransparency.toFixed(1)}/100</span>
              </div>
              <Progress value={analysis.averageTransparency} className="mt-2" />
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Low Performing Projects</span>
                <Badge variant="outline" className="text-red-600 border-red-200">
                  {analysis.lowPerformingProjects}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">High Risk Projects</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {analysis.highRiskProjects}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4" />
                <span className="text-sm font-medium">Top Ministry</span>
              </div>
              <div className="text-lg font-semibold">{analysis.topMinistry?.[0] || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">
                {analysis.topMinistry ? formatCurrency(analysis.topMinistry[1] as number) : ''}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Top Sector</span>
              </div>
              <div className="text-lg font-semibold">{analysis.topSector?.[0] || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">
                {analysis.topSector ? formatCurrency(analysis.topSector[1] as number) : ''}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Regional Coverage</span>
              </div>
              <div className="text-lg font-semibold">{Object.keys(analysis.regionalSpread).length} Regions</div>
              <div className="text-sm text-muted-foreground">
                Most Active: {Object.entries(analysis.regionalSpread)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};