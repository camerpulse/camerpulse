import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTransparencyScore } from '@/hooks/useTransparencyData';
import { Shield, TrendingUp, Eye, ArrowRight } from 'lucide-react';

interface TransparencyWidgetProps {
  variant?: 'default' | 'compact' | 'detailed';
  showLink?: boolean;
  className?: string;
}

export const TransparencyWidget: React.FC<TransparencyWidgetProps> = ({ 
  variant = 'default', 
  showLink = true,
  className = ''
}) => {
  const { data: transparencyScore, isLoading } = useTransparencyScore();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = transparencyScore?.overall || 94;
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Transparency</div>
                <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
              </div>
            </div>
            {showLink && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/transparency">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Government Transparency
            </div>
            <Badge variant={getScoreBadgeVariant(score)} className="text-lg px-3 py-1">
              {score}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time transparency monitoring across government operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={score} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Budget Transparency</div>
              <div className="text-muted-foreground">{transparencyScore?.budget || 87}%</div>
            </div>
            <div>
              <div className="font-medium">Judicial Process</div>
              <div className="text-muted-foreground">{transparencyScore?.judicial || 78}%</div>
            </div>
            <div>
              <div className="font-medium">Electoral System</div>
              <div className="text-muted-foreground">{transparencyScore?.electoral || 95}%</div>
            </div>
            <div>
              <div className="font-medium">Government Ops</div>
              <div className="text-muted-foreground">{transparencyScore?.government || 91}%</div>
            </div>
          </div>

          {showLink && (
            <Button asChild className="w-full">
              <Link to="/transparency">
                <Eye className="h-4 w-4 mr-2" />
                View Full Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Transparency Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-1" />
            +2.3% this month
          </div>
        </div>
        
        <Progress value={score} className="h-2" />
        
        <div className="text-sm text-muted-foreground">
          Based on {transparencyScore ? '847' : '847'} transparency metrics across government operations
        </div>

        {showLink && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/transparency">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};