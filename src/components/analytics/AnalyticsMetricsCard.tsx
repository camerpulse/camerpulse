import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
}

export const AnalyticsMetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-analytics-increase" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-analytics-decrease" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-analytics-increase';
      case 'decrease':
        return 'text-analytics-decrease';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="analytics-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="analytics-icon">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {changeType === 'increase' ? '+' : changeType === 'decrease' ? '-' : ''}
              {Math.abs(change)}% from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};