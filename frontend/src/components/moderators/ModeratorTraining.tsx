import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, CheckCircle, Clock, Star, Award, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { renderTextWithBreaks } from '@/utils/htmlSanitizer';

interface Guideline {
  id: string;
  category: string;
  title: string;
  content: string;
  version: number;
  required_reading: boolean;
  created_at: string;
}

interface TrainingProgress {
  id: string;
  guideline_id: string;
  completed_at: string | null;
  quiz_score: number | null;
  attempts: number;
}

export function ModeratorTraining() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchTrainingData();
  }, [user]);

  const fetchTrainingData = async () => {
    if (!user) return;

    try {
      // Fetch guidelines
      const { data: guidelinesData, error: guidelinesError } = await supabase
        .from('moderator_guidelines')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (guidelinesError) throw guidelinesError;

      // Get moderator ID
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (moderator) {
        // Fetch training progress
        const { data: progressData, error: progressError } = await supabase
          .from('moderator_training_progress')
          .select('*')
          .eq('moderator_id', moderator.id);

        if (progressError) throw progressError;
        setProgress(progressData || []);
      }

      setGuidelines(guidelinesData || []);
    } catch (error: any) {
      console.error('Error fetching training data:', error);
      toast({
        title: "Error",
        description: "Failed to load training materials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (guidelineId: string) => {
    if (!user) return;

    try {
      // Get moderator ID
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!moderator) throw new Error('Moderator not found');

      const { error } = await supabase
        .from('moderator_training_progress')
        .upsert({
          moderator_id: moderator.id,
          guideline_id: guidelineId,
          completed_at: new Date().toISOString(),
          attempts: 1
        }, {
          onConflict: 'moderator_id,guideline_id'
        });

      if (error) throw error;

      toast({
        title: "Progress Updated",
        description: "Training module marked as completed",
      });

      fetchTrainingData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const getProgressForGuideline = (guidelineId: string) => {
    return progress.find(p => p.guideline_id === guidelineId);
  };

  const calculateOverallProgress = () => {
    const completedCount = progress.filter(p => p.completed_at).length;
    const totalCount = guidelines.length;
    return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  };

  const groupedGuidelines = guidelines.reduce((groups, guideline) => {
    const category = guideline.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(guideline);
    return groups;
  }, {} as Record<string, Guideline[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training & Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = calculateOverallProgress();
  const completedModules = progress.filter(p => p.completed_at).length;
  const totalModules = guidelines.length;
  const requiredModules = guidelines.filter(g => g.required_reading).length;
  const completedRequired = progress.filter(p => 
    p.completed_at && guidelines.find(g => g.id === p.guideline_id)?.required_reading
  ).length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Training Progress
          </CardTitle>
          <CardDescription>
            Complete your moderator training to unlock advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedModules}/{totalModules} modules
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Required Modules</p>
                  <p className="text-sm text-blue-700">{completedRequired}/{requiredModules} completed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Completed</p>
                  <p className="text-sm text-green-700">{completedModules} modules</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Certification</p>
                  <p className="text-sm text-purple-700">
                    {completedRequired === requiredModules ? 'Earned' : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>
            Study each module carefully to become an effective moderator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedGuidelines).map(([category, categoryGuidelines]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize">
                  {category.replace('_', ' ')}
                </h3>
                
                <Accordion type="single" collapsible className="space-y-2">
                  {categoryGuidelines.map((guideline) => {
                    const moduleProgress = getProgressForGuideline(guideline.id);
                    const isCompleted = moduleProgress?.completed_at;
                    
                    return (
                      <AccordionItem 
                        key={guideline.id} 
                        value={guideline.id}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-muted-foreground" />
                              )}
                              <span className="font-medium">{guideline.title}</span>
                              {guideline.required_reading && (
                                <Badge variant="secondary" className="ml-2">
                                  <Star className="w-3 h-3 mr-1" />
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            <div className="prose prose-sm max-w-none">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: renderTextWithBreaks(guideline.content)
                                }} 
                              />
                            </div>
                            
                            <div className="flex items-center gap-2 pt-4 border-t">
                              {!isCompleted && (
                                <Button
                                  onClick={() => markAsCompleted(guideline.id)}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Completed
                                </Button>
                              )}
                              
                              {isCompleted && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Completed</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(moduleProgress.completed_at!).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
            
            {guidelines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No training modules available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}