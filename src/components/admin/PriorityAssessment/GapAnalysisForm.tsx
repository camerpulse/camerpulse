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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useCreatePlatformGap, PlatformGap } from '@/hooks/usePriorityAssessment';

const gapSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['feature', 'performance', 'security', 'compliance', 'user_experience', 'technical_debt']),
  priority_level: z.enum(['must_have', 'should_have', 'could_have', 'wont_have']),
  status: z.enum(['identified', 'in_progress', 'completed', 'deferred', 'cancelled']).default('identified'),
  impact_score: z.number().min(1).max(10),
  effort_score: z.number().min(1).max(10),
  feasibility_score: z.number().min(1).max(10),
  risk_score: z.number().min(1).max(10),
  affected_modules: z.array(z.string()),
  stakeholders: z.array(z.string()),
  estimated_effort_hours: z.number().optional(),
  target_completion_date: z.string().optional(),
  business_justification: z.string().optional(),
  technical_notes: z.string().optional(),
});

type GapFormData = z.infer<typeof gapSchema>;

interface GapAnalysisFormProps {
  onSuccess?: () => void;
  initialData?: Partial<PlatformGap>;
}

export const GapAnalysisForm: React.FC<GapAnalysisFormProps> = ({
  onSuccess,
  initialData,
}) => {
  const createGap = useCreatePlatformGap();
  const [newModule, setNewModule] = React.useState('');
  const [newStakeholder, setNewStakeholder] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<GapFormData>({
    resolver: zodResolver(gapSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'feature',
      priority_level: initialData?.priority_level || 'should_have',
      status: initialData?.status || 'identified',
      impact_score: initialData?.impact_score || 5,
      effort_score: initialData?.effort_score || 5,
      feasibility_score: initialData?.feasibility_score || 5,
      risk_score: initialData?.risk_score || 5,
      affected_modules: initialData?.affected_modules || [],
      stakeholders: initialData?.stakeholders || [],
      estimated_effort_hours: initialData?.estimated_effort_hours,
      target_completion_date: initialData?.target_completion_date,
      business_justification: initialData?.business_justification || '',
      technical_notes: initialData?.technical_notes || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: GapFormData) => {
    try {
      await createGap.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create gap:', error);
    }
  };

  const addModule = () => {
    if (newModule.trim()) {
      const currentModules = watchedValues.affected_modules || [];
      setValue('affected_modules', [...currentModules, newModule.trim()]);
      setNewModule('');
    }
  };

  const removeModule = (index: number) => {
    const currentModules = watchedValues.affected_modules || [];
    setValue('affected_modules', currentModules.filter((_, i) => i !== index));
  };

  const addStakeholder = () => {
    if (newStakeholder.trim()) {
      const currentStakeholders = watchedValues.stakeholders || [];
      setValue('stakeholders', [...currentStakeholders, newStakeholder.trim()]);
      setNewStakeholder('');
    }
  };

  const removeStakeholder = (index: number) => {
    const currentStakeholders = watchedValues.stakeholders || [];
    setValue('stakeholders', currentStakeholders.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Platform Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Gap Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Enhanced Security Authentication"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="user_experience">User Experience</SelectItem>
                  <SelectItem value="technical_debt">Technical Debt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the gap..."
              rows={3}
            />
          </div>

          {/* MoSCoW Prioritization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority_level">MoSCoW Priority *</Label>
              <Select value={watchedValues.priority_level} onValueChange={(value) => setValue('priority_level', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="must_have">Must Have (M)</SelectItem>
                  <SelectItem value="should_have">Should Have (S)</SelectItem>
                  <SelectItem value="could_have">Could Have (C)</SelectItem>
                  <SelectItem value="wont_have">Won't Have (W)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={watchedValues.status} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scoring Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scoring Criteria (1-10)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Impact Score: {watchedValues.impact_score}</Label>
                <Slider
                  value={[watchedValues.impact_score]}
                  onValueChange={(value) => setValue('impact_score', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">How critical is this gap?</p>
              </div>

              <div className="space-y-2">
                <Label>Effort Score: {watchedValues.effort_score}</Label>
                <Slider
                  value={[watchedValues.effort_score]}
                  onValueChange={(value) => setValue('effort_score', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">How much effort to fix?</p>
              </div>

              <div className="space-y-2">
                <Label>Feasibility Score: {watchedValues.feasibility_score}</Label>
                <Slider
                  value={[watchedValues.feasibility_score]}
                  onValueChange={(value) => setValue('feasibility_score', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">How feasible to implement?</p>
              </div>

              <div className="space-y-2">
                <Label>Risk Score: {watchedValues.risk_score}</Label>
                <Slider
                  value={[watchedValues.risk_score]}
                  onValueChange={(value) => setValue('risk_score', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">What's the risk level?</p>
              </div>
            </div>

            {/* Priority Score Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Calculated Priority Score: {' '}
                <span className="text-lg font-bold text-primary">
                  {((watchedValues.impact_score * watchedValues.feasibility_score) / watchedValues.effort_score).toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Formula: (Impact × Feasibility) ÷ Effort
              </p>
            </div>
          </div>

          {/* Affected Modules */}
          <div className="space-y-2">
            <Label>Affected Modules</Label>
            <div className="flex gap-2">
              <Input
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                placeholder="e.g., auth, user_management"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())}
              />
              <Button type="button" onClick={addModule} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedValues.affected_modules?.map((module, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {module}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeModule(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Stakeholders */}
          <div className="space-y-2">
            <Label>Stakeholders</Label>
            <div className="flex gap-2">
              <Input
                value={newStakeholder}
                onChange={(e) => setNewStakeholder(e.target.value)}
                placeholder="e.g., Product Team, Engineering Team"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStakeholder())}
              />
              <Button type="button" onClick={addStakeholder} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedValues.stakeholders?.map((stakeholder, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {stakeholder}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeStakeholder(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_effort_hours">Estimated Effort (Hours)</Label>
              <Input
                id="estimated_effort_hours"
                type="number"
                {...register('estimated_effort_hours', { valueAsNumber: true })}
                placeholder="e.g., 120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_completion_date">Target Completion Date</Label>
              <Input
                id="target_completion_date"
                type="date"
                {...register('target_completion_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_justification">Business Justification</Label>
            <Textarea
              id="business_justification"
              {...register('business_justification')}
              placeholder="Why is this gap important to fix from a business perspective?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technical_notes">Technical Notes</Label>
            <Textarea
              id="technical_notes"
              {...register('technical_notes')}
              placeholder="Technical details, constraints, or implementation notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={createGap.isPending}>
              {createGap.isPending ? 'Creating...' : 'Create Gap Analysis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};