import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, DollarSign, Clock, Eye } from 'lucide-react';

interface AnomalyDetectionProps {
  budgetData: any[] | undefined;
  onViewProject?: (projectId: string) => void;
}

interface Anomaly {
  id: string;
  type: 'budget_overrun' | 'execution_delay' | 'transparency_risk' | 'cost_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  value?: number;
  threshold?: number;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ 
  budgetData, 
  onViewProject 
}) => {
  const anomalies = useMemo(() => {
    if (!budgetData) return [];

    const detectedAnomalies: Anomaly[] = [];

    budgetData.forEach(project => {
      // Budget overrun detection
      if (project.spent_amount > project.allocated_amount * 1.1) {
        const overrunPercentage = ((project.spent_amount - project.allocated_amount) / project.allocated_amount) * 100;
        detectedAnomalies.push({
          id: `overrun_${project.id}`,
          type: 'budget_overrun',
          severity: overrunPercentage > 50 ? 'critical' : overrunPercentage > 25 ? 'high' : 'medium',
          title: 'Budget Overrun Detected',
          description: `Project spending exceeds allocated budget by ${overrunPercentage.toFixed(1)}%`,
          projectId: project.id,
          projectName: project.project_name,
          value: overrunPercentage,
          threshold: 10
        });
      }

      // Execution delay detection
      if (project.execution_percentage < 20 && project.status === 'executing') {
        detectedAnomalies.push({
          id: `delay_${project.id}`,
          type: 'execution_delay',
          severity: project.execution_percentage < 5 ? 'high' : 'medium',
          title: 'Severe Execution Delay',
          description: `Project execution rate is only ${project.execution_percentage}%`,
          projectId: project.id,
          projectName: project.project_name,
          value: project.execution_percentage,
          threshold: 20
        });
      }

      // Transparency risk detection
      if (project.transparency_score < 30) {
        detectedAnomalies.push({
          id: `transparency_${project.id}`,
          type: 'transparency_risk',
          severity: project.transparency_score < 15 ? 'critical' : 'high',
          title: 'Low Transparency Score',
          description: `Project transparency score is ${project.transparency_score}/100`,
          projectId: project.id,
          projectName: project.project_name,
          value: project.transparency_score,
          threshold: 30
        });
      }

      // Cost anomaly detection (unusually high allocation for sector)
      const sectorAverage = budgetData
        .filter(p => p.sector === project.sector)
        .reduce((sum, p) => sum + p.allocated_amount, 0) / 
        budgetData.filter(p => p.sector === project.sector).length;

      if (project.allocated_amount > sectorAverage * 3) {
        detectedAnomalies.push({
          id: `cost_${project.id}`,
          type: 'cost_anomaly',
          severity: project.allocated_amount > sectorAverage * 5 ? 'high' : 'medium',
          title: 'Unusual Cost Allocation',
          description: `Project allocation significantly exceeds sector average`,
          projectId: project.id,
          projectName: project.project_name,
          value: project.allocated_amount,
          threshold: sectorAverage
        });
      }
    });

    return detectedAnomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [budgetData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-500 bg-blue-50 text-blue-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'budget_overrun': return <DollarSign className="h-4 w-4" />;
      case 'execution_delay': return <Clock className="h-4 w-4" />;
      case 'transparency_risk': return <Eye className="h-4 w-4" />;
      case 'cost_anomaly': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(amount / 1000).toFixed(1)}K FCFA`;
  };

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <AlertTriangle className="h-5 w-5" />
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">No Anomalies Detected</h3>
            <p className="text-green-600">All budget items appear to be within normal parameters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Anomaly Detection Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="text-red-600 border-red-200">
              {anomalies.filter(a => a.severity === 'critical').length} Critical
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {anomalies.filter(a => a.severity === 'high').length} High
            </Badge>
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              {anomalies.filter(a => a.severity === 'medium').length} Medium
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {anomalies.filter(a => a.severity === 'low').length} Low
            </Badge>
          </div>
        </CardContent>
      </Card>

      {anomalies.map((anomaly) => (
        <Card key={anomaly.id} className={`border-l-4 ${getSeverityColor(anomaly.severity)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getAnomalyIcon(anomaly.type)}
                <div>
                  <CardTitle className="text-lg">{anomaly.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {anomaly.projectName}
                  </p>
                </div>
              </div>
              <Badge className={getSeverityColor(anomaly.severity)}>
                {anomaly.severity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {anomaly.description}
                {anomaly.value && anomaly.threshold && (
                  <div className="mt-2 text-sm">
                    <strong>Current:</strong> {
                      anomaly.type === 'cost_anomaly' 
                        ? formatCurrency(anomaly.value)
                        : anomaly.type === 'budget_overrun'
                        ? `${anomaly.value.toFixed(1)}%`
                        : anomaly.type === 'transparency_risk'
                        ? `${anomaly.value.toFixed(1)}/100`
                        : `${anomaly.value.toFixed(1)}%`
                    } | 
                    <strong> Threshold:</strong> {
                      anomaly.type === 'cost_anomaly' 
                        ? formatCurrency(anomaly.threshold)
                        : anomaly.type === 'budget_overrun'
                        ? `${anomaly.threshold}%`
                        : anomaly.type === 'transparency_risk'
                        ? `${anomaly.threshold}/100`
                        : `${anomaly.threshold}%`
                    }
                  </div>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              {onViewProject && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewProject(anomaly.projectId)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Project
                </Button>
              )}
              <Button size="sm" variant="outline">
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};