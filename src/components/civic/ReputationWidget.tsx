import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReputationWidgetProps {
  score: number;
  level: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  trend: 'rising' | 'stable' | 'falling';
  entityName: string;
  entityType: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function ReputationWidget({
  score,
  level,
  trend,
  entityName,
  entityType,
  showDetails = false,
  compact = false,
  className
}: ReputationWidgetProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'falling': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600';
      case 'falling': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full border", getLevelColor(level), className)}>
              <span className="text-sm font-medium">{score}/100</span>
              {getTrendIcon(trend)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{entityName}</p>
              <p className="text-sm text-muted-foreground capitalize">{level} reputation</p>
              <p className="text-xs capitalize">{trend} trend</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-3 p-4 border rounded-lg bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Civic Reputation</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-60">
                    Reputation score based on public service performance, transparency, and citizen feedback
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{entityType}</p>
        </div>
        <Badge variant="outline" className={getLevelColor(level)}>
          {level}
        </Badge>
      </div>

      {/* Score Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{score}/100</span>
          <div className={cn("flex items-center gap-1 text-sm", getTrendColor(trend))}>
            {getTrendIcon(trend)}
            <span className="capitalize">{trend}</span>
          </div>
        </div>
        
        <div className="relative">
          <Progress value={score} className="h-2" />
          <div 
            className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Reputation Level Description */}
      <div className="text-xs text-muted-foreground">
        {level === 'excellent' && "🌟 Exemplary public service record"}
        {level === 'good' && "✅ Strong performance and transparency"}
        {level === 'average' && "📊 Standard performance levels"}
        {level === 'poor' && "⚠️ Below expected performance"}
        {level === 'critical' && "🚨 Significant concerns identified"}
      </div>

      {/* Quick Stats */}
      {showDetails && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}