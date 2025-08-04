import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, MessageCircle, FileText, Eye, AlertTriangle, TrendingUp } from 'lucide-react';

interface BudgetTableProps {
  budgetData: any[] | undefined;
  onRateProject: (projectId: string) => void;
  onRequestClarification: (projectId: string) => void;
  onStartPetition: (projectId: string) => void;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({ 
  budgetData, 
  onRateProject, 
  onRequestClarification, 
  onStartPetition 
}) => {
  if (!budgetData) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'executing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'budgeted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {budgetData.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">{item.project_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.ministry_name} • {item.sector} • {item.region}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.project_description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
                <Badge className={getRiskColor(item.transparency_score > 7 ? 'low' : item.transparency_score > 4 ? 'medium' : 'high')}>
                  {getRiskIcon(item.transparency_score > 7 ? 'low' : item.transparency_score > 4 ? 'medium' : 'high')}
                  {item.transparency_score > 7 ? 'Low' : item.transparency_score > 4 ? 'Medium' : 'High'} Risk
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="font-semibold">{formatCurrency(item.allocated_amount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="font-semibold">{formatCurrency(item.spent_amount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Execution Rate</p>
                <div className="flex items-center gap-2">
                  <Progress value={item.execution_percentage} className="flex-1" />
                  <span className="text-sm font-medium">{item.execution_percentage}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transparency Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={item.transparency_score * 10} className="flex-1" />
                  <span className="text-sm font-medium">{item.transparency_score}/10</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span>Ministry: {item.ministry_department}</span>
                <span className="ml-4">FY {item.budget_year}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRateProject(item.id)}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Rate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRequestClarification(item.id)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Clarify
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStartPetition(item.id)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Petition
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {budgetData.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budget items found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};