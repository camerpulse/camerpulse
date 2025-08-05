import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useCreateRoadmapItem, usePlatformGaps } from '@/hooks/usePriorityAssessment';

const roadmapSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  quarter: z.string().optional(),
  theme: z.string().optional(),
  planned_gaps: z.array(z.string()),
  allocated_budget: z.number().optional(),
  team_capacity_hours: z.number().optional(),
  completion_percentage: z.number().min(0).max(100).default(0),
  actual_effort_hours: z.number().default(0),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']).default('planning'),
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

interface RoadmapFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RoadmapForm: React.FC<RoadmapFormProps> = ({ onSuccess, onCancel }) => {
  const createRoadmapItem = useCreateRoadmapItem();
  const { data: gaps } = usePlatformGaps();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      quarter: '',
      theme: '',
      planned_gaps: [],
      allocated_budget: undefined,
      team_capacity_hours: undefined,
      completion_percentage: 0,
      actual_effort_hours: 0,
      status: 'planning',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: RoadmapFormData) => {
    try {
      await createRoadmapItem.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create roadmap item:', error);
    }
  };

  const toggleGap = (gapId: string) => {
    const currentGaps = watchedValues.planned_gaps || [];
    const newGaps = currentGaps.includes(gapId)
      ? currentGaps.filter(id => id !== gapId)
      : [...currentGaps, gapId];
    setValue('planned_gaps', newGaps);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Roadmap Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Q2 2024 Security Improvements"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                {...register('theme')}
                placeholder="e.g., Security Improvements, User Experience"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the roadmap initiative..."
              rows={3}
            />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={watchedValues.quarter} onValueChange={(value) => setValue('quarter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allocated_budget">Allocated Budget ($)</Label>
              <Input
                id="allocated_budget"
                type="number"
                {...register('allocated_budget', { valueAsNumber: true })}
                placeholder="e.g., 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_capacity_hours">Team Capacity (Hours)</Label>
              <Input
                id="team_capacity_hours"
                type="number"
                {...register('team_capacity_hours', { valueAsNumber: true })}
                placeholder="e.g., 240"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={watchedValues.status} onValueChange={(value) => setValue('status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Planned Gaps */}
          <div className="space-y-4">
            <Label>Platform Gaps to Address</Label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
              {gaps?.map((gap) => (
                <div
                  key={gap.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors mb-2 ${
                    watchedValues.planned_gaps.includes(gap.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleGap(gap.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{gap.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Priority Score: {gap.calculated_priority_score.toFixed(1)} | 
                        {gap.priority_level.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <Badge variant={gap.priority_level === 'must_have' ? 'destructive' : 'secondary'}>
                      {gap.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {watchedValues.planned_gaps.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Selected gaps ({watchedValues.planned_gaps.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {watchedValues.planned_gaps.map((gapId) => {
                    const gap = gaps?.find(g => g.id === gapId);
                    return gap ? (
                      <Badge key={gapId} variant="outline" className="flex items-center gap-1">
                        {gap.title}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleGap(gapId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={createRoadmapItem.isPending}>
              {createRoadmapItem.isPending ? 'Creating...' : 'Create Roadmap Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};