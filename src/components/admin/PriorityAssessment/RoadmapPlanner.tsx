import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, DollarSign, Users, Plus, Filter } from 'lucide-react';
import { useRoadmapItems, usePlatformGaps } from '@/hooks/usePriorityAssessment';
import { format, differenceInDays, parseISO } from 'date-fns';
import { RoadmapForm } from './RoadmapForm';

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
};

interface RoadmapPlannerProps {
  onCreateItem?: () => void;
  onEditItem?: (itemId: string) => void;
}

export const RoadmapPlanner: React.FC<RoadmapPlannerProps> = ({
  onCreateItem,
  onEditItem,
}) => {
  const [showForm, setShowForm] = React.useState(false);
  const { data: roadmapItems, isLoading: roadmapLoading } = useRoadmapItems();
  const { data: gaps, isLoading: gapsLoading } = usePlatformGaps();

  if (roadmapLoading || gapsLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  const currentDate = new Date();
  const upcomingItems = roadmapItems?.filter(item => 
    parseISO(item.start_date) > currentDate
  ) || [];
  
  const activeItems = roadmapItems?.filter(item => {
    const startDate = parseISO(item.start_date);
    const endDate = parseISO(item.end_date);
    return startDate <= currentDate && endDate >= currentDate;
  }) || [];

  const completedItems = roadmapItems?.filter(item => 
    item.status === 'completed'
  ) || [];

  const RoadmapItemCard: React.FC<{ item: any }> = ({ item }) => {
    const startDate = parseISO(item.start_date);
    const endDate = parseISO(item.end_date);
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(currentDate, startDate);
    const progressPercentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    const relatedGaps = gaps?.filter(gap => 
      item.planned_gaps.includes(gap.id)
    ) || [];

    return (
      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              {item.theme && (
                <Badge variant="outline" className="mt-1">
                  {item.theme}
                </Badge>
              )}
            </div>
            <Badge className={statusColors[item.status]}>
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {item.description}
            </p>
          )}

          {/* Timeline */}
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
            </span>
            {item.quarter && (
              <Badge variant="secondary" className="ml-2">
                {item.quarter}
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{item.completion_percentage}%</span>
            </div>
            <Progress value={item.completion_percentage} className="h-2" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {item.allocated_budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    ${item.allocated_budget.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
              </div>
            )}

            {item.team_capacity_hours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {item.team_capacity_hours}h
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Capacity ({item.actual_effort_hours}h used)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Gaps */}
          {relatedGaps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Addressing {relatedGaps.length} gap{relatedGaps.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {relatedGaps.slice(0, 3).map(gap => (
                  <Badge key={gap.id} variant="outline" className="text-xs">
                    {gap.title}
                  </Badge>
                ))}
                {relatedGaps.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{relatedGaps.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => onEditItem?.(item.id)}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Development Roadmap</h2>
          <p className="text-muted-foreground">
            Plan and track platform improvement initiatives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Roadmap Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{roadmapItems?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeItems.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{upcomingItems.length}</div>
            <div className="text-sm text-muted-foreground">Planned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{completedItems.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Form */}
      {showForm && (
        <RoadmapForm 
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Roadmap Sections */}
      {!showForm && (
        <div className="space-y-8">
          {/* Active Items */}
          {activeItems.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                Active Initiatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeItems.map(item => (
                  <RoadmapItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Items */}
          {upcomingItems.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                Planned Initiatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingItems.map(item => (
                  <RoadmapItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                Completed Initiatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedItems.slice(0, 6).map(item => (
                  <RoadmapItemCard key={item.id} item={item} />
                ))}
              </div>
              {completedItems.length > 6 && (
                <div className="text-center mt-4">
                  <Button variant="outline">
                    View All Completed ({completedItems.length})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!roadmapItems?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No roadmap items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start planning your platform improvements by creating your first roadmap item.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Roadmap Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};