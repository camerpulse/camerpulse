import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  action
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return trend.isPositive ? (
        <TrendingUp className="h-4 w-4 text-success" />
      ) : (
        <TrendingDown className="h-4 w-4 text-destructive" />
      );
    } else if (trend.value < 0) {
      return trend.isPositive ? (
        <TrendingDown className="h-4 w-4 text-destructive" />
      ) : (
        <TrendingUp className="h-4 w-4 text-success" />
      );
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value === 0) return 'text-muted-foreground';
    
    const isGoodTrend = (trend.value > 0 && trend.isPositive) || (trend.value < 0 && !trend.isPositive);
    return isGoodTrend ? 'text-success' : 'text-destructive';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.text}
            </Badge>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{value}</div>
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {trend && (
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>
                  {Math.abs(trend.value)}% {trend.period}
                </span>
              </div>
            </div>
          )}

          {action && (
            <>
              <Separator />
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between"
                onClick={action.onClick}
              >
                {action.label}
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};