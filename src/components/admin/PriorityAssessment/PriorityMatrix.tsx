import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlatformGaps, PlatformGap } from '@/hooks/usePriorityAssessment';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const priorityColors = {
  must_have: 'bg-red-500',
  should_have: 'bg-orange-500',
  could_have: 'bg-yellow-500',
  wont_have: 'bg-gray-500',
};

const statusIcons = {
  identified: AlertTriangle,
  in_progress: Clock,
  completed: CheckCircle,
  deferred: XCircle,
  cancelled: XCircle,
};

const categoryColors = {
  feature: 'bg-blue-100 text-blue-800',
  performance: 'bg-green-100 text-green-800',
  security: 'bg-red-100 text-red-800',
  compliance: 'bg-purple-100 text-purple-800',
  user_experience: 'bg-pink-100 text-pink-800',
  technical_debt: 'bg-gray-100 text-gray-800',
};

interface PriorityMatrixProps {
  onGapClick?: (gap: PlatformGap) => void;
}

export const PriorityMatrix: React.FC<PriorityMatrixProps> = ({ onGapClick }) => {
  const { data: gaps, isLoading } = usePlatformGaps();

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (!gaps?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No platform gaps identified yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Create a 4x4 matrix: Impact (high to low) vs Effort (low to high)
  const getMatrixPosition = (gap: PlatformGap) => {
    const impactQuadrant = gap.impact_score > 7 ? 'high' : gap.impact_score > 4 ? 'medium' : 'low';
    const effortQuadrant = gap.effort_score <= 3 ? 'low' : gap.effort_score <= 6 ? 'medium' : 'high';
    
    return { impact: impactQuadrant, effort: effortQuadrant };
  };

  const groupedGaps = gaps.reduce((acc, gap) => {
    const { impact, effort } = getMatrixPosition(gap);
    const key = `${impact}-${effort}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(gap);
    return acc;
  }, {} as Record<string, PlatformGap[]>);

  const QuadrantCard: React.FC<{
    title: string;
    description: string;
    gaps: PlatformGap[];
    className?: string;
  }> = ({ title, description, gaps, className = '' }) => (
    <Card className={`min-h-64 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="text-xs text-muted-foreground">
          {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {gaps.map((gap) => {
            const StatusIcon = statusIcons[gap.status];
            return (
              <TooltipProvider key={gap.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onGapClick?.(gap)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{gap.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${priorityColors[gap.priority_level]}`}
                            />
                            <Badge
                              variant="secondary"
                              className={`text-xs px-1 py-0 ${categoryColors[gap.category]}`}
                            >
                              {gap.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <StatusIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Score: {gap.calculated_priority_score.toFixed(1)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{gap.title}</p>
                      {gap.description && (
                        <p className="text-xs text-muted-foreground">
                          {gap.description.slice(0, 100)}...
                        </p>
                      )}
                      <div className="text-xs">
                        <div>Impact: {gap.impact_score}/10</div>
                        <div>Effort: {gap.effort_score}/10</div>
                        <div>Feasibility: {gap.feasibility_score}/10</div>
                        <div>Risk: {gap.risk_score}/10</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Priority Assessment Matrix</h2>
        <p className="text-muted-foreground">Impact vs Effort Analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Header row */}
        <div />
        <div className="text-center text-sm font-medium text-muted-foreground">
          Low Effort
        </div>
        <div className="text-center text-sm font-medium text-muted-foreground">
          Medium Effort
        </div>
        <div className="text-center text-sm font-medium text-muted-foreground">
          High Effort
        </div>

        {/* High Impact row */}
        <div className="flex items-center justify-center text-sm font-medium text-muted-foreground -rotate-90">
          High Impact
        </div>
        <QuadrantCard
          title="Quick Wins"
          description="High impact, low effort - prioritize these!"
          gaps={groupedGaps['high-low'] || []}
          className="border-green-200 bg-green-50"
        />
        <QuadrantCard
          title="Major Projects"
          description="High impact, medium effort - plan carefully"
          gaps={groupedGaps['high-medium'] || []}
          className="border-blue-200 bg-blue-50"
        />
        <QuadrantCard
          title="Consider Carefully"
          description="High impact, high effort - strategic decisions"
          gaps={groupedGaps['high-high'] || []}
          className="border-orange-200 bg-orange-50"
        />

        {/* Medium Impact row */}
        <div className="flex items-center justify-center text-sm font-medium text-muted-foreground -rotate-90">
          Medium Impact
        </div>
        <QuadrantCard
          title="Fill-in Tasks"
          description="Medium impact, low effort - good for spare time"
          gaps={groupedGaps['medium-low'] || []}
          className="border-yellow-200 bg-yellow-50"
        />
        <QuadrantCard
          title="Evaluate ROI"
          description="Medium impact, medium effort - analyze carefully"
          gaps={groupedGaps['medium-medium'] || []}
          className="border-gray-200 bg-gray-50"
        />
        <QuadrantCard
          title="Maybe Later"
          description="Medium impact, high effort - lower priority"
          gaps={groupedGaps['medium-high'] || []}
          className="border-gray-200 bg-gray-50"
        />

        {/* Low Impact row */}
        <div className="flex items-center justify-center text-sm font-medium text-muted-foreground -rotate-90">
          Low Impact
        </div>
        <QuadrantCard
          title="Nice to Have"
          description="Low impact, low effort - if time permits"
          gaps={groupedGaps['low-low'] || []}
          className="border-gray-200 bg-gray-50"
        />
        <QuadrantCard
          title="Question Value"
          description="Low impact, medium effort - reconsider"
          gaps={groupedGaps['low-medium'] || []}
          className="border-red-200 bg-red-50"
        />
        <QuadrantCard
          title="Avoid"
          description="Low impact, high effort - don't do"
          gaps={groupedGaps['low-high'] || []}
          className="border-red-200 bg-red-50"
        />
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium mb-2">Priority Levels</h4>
              <div className="space-y-1">
                {Object.entries(priorityColors).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm capitalize">
                      {level.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="space-y-1">
                {Object.entries(statusIcons).map(([status, Icon]) => (
                  <div key={status} className="flex items-center gap-2">
                    <Icon className="h-3 w-3" />
                    <span className="text-sm capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Scoring Guide</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><strong>Impact:</strong> 1-3 Low, 4-7 Medium, 8-10 High</div>
                <div><strong>Effort:</strong> 1-3 Low, 4-6 Medium, 7-10 High</div>
                <div><strong>Priority Score:</strong> (Impact × Feasibility) ÷ Effort</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};