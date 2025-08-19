import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, BookOpen, Target, Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
}

interface LearningProgress {
  id: string;
  content_type: string;
  content_id: string;
  progress_percentage: number;
  completed_at?: string;
  time_spent_minutes: number;
}

export const UserProgress: React.FC = () => {
  // Fetch user badges
  const { data: badges } = useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('civic_achievement_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as UserBadge[];
    }
  });

  // Fetch learning progress
  const { data: progress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('civic_learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch quiz attempts
  const { data: quizAttempts } = useQuery({
    queryKey: ['user-quiz-attempts-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('civic_quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const calculateOverallProgress = () => {
    if (!progress || progress.length === 0) return 0;
    const totalProgress = progress.reduce((sum, item) => sum + item.progress_percentage, 0);
    return Math.round(totalProgress / progress.length);
  };

  const getTotalTimeSpent = () => {
    if (!progress) return 0;
    return progress.reduce((sum, item) => sum + item.time_spent_minutes, 0);
  };

  const getCompletedModules = () => {
    if (!progress) return 0;
    return progress.filter(item => item.completed_at).length;
  };

  const getAverageQuizScore = () => {
    if (!quizAttempts || quizAttempts.length === 0) return 0;
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round(totalScore / quizAttempts.length);
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'constitution_scholar': return '📜';
      case 'quiz_master': return '🏆';
      case 'active_learner': return '📚';
      case 'rights_expert': return '⚖️';
      case 'civic_champion': return '🌟';
      default: return '🏅';
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'constitution_scholar': return 'bg-blue-100 text-blue-800';
      case 'quiz_master': return 'bg-yellow-100 text-yellow-800';
      case 'active_learner': return 'bg-green-100 text-green-800';
      case 'rights_expert': return 'bg-purple-100 text-purple-800';
      case 'civic_champion': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallProgress = calculateOverallProgress();
  const totalTimeSpent = getTotalTimeSpent();
  const completedModules = getCompletedModules();
  const averageQuizScore = getAverageQuizScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Learning Progress</h2>
        <p className="text-gray-600">
          Track your civic education journey and achievements
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedModules}</div>
                <div className="text-sm text-gray-600">Modules Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{averageQuizScore}%</div>
                <div className="text-sm text-gray-600">Avg Quiz Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}h</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievement Badges
          </CardTitle>
          <CardDescription>
            Earn badges by completing modules, scoring well on quizzes, and engaging with content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges && badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-4xl mb-2">{getBadgeIcon(badge.badge_type)}</div>
                    <h3 className="font-semibold mb-1">{badge.badge_name}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {badge.badge_description}
                    </p>
                    <Badge className={getBadgeColor(badge.badge_type)}>
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
              <p>Complete modules and quizzes to earn your first badge!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recent Learning Activity
          </CardTitle>
          <CardDescription>
            Your progress on educational modules and constitution articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progress && progress.length > 0 ? (
            <div className="space-y-4">
              {progress.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {item.content_type === 'constitution_article' ? 'Constitution Article' : 'Educational Module'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Time spent: {item.time_spent_minutes} minutes
                    </div>
                    <Progress value={item.progress_percentage} className="h-2" />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-semibold">{item.progress_percentage}%</div>
                    {item.completed_at && (
                      <Badge variant="outline" className="mt-1">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Learning Activity</h3>
              <p>Start exploring the Constitution or educational modules to see your progress here!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Quiz Performance
          </CardTitle>
          <CardDescription>
            Your recent quiz attempts and scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quizAttempts && quizAttempts.length > 0 ? (
            <div className="space-y-4">
              {quizAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium mb-1">Quiz Attempt</div>
                    <div className="text-sm text-gray-600">
                      {new Date(attempt.completed_at).toLocaleDateString()} • 
                      {attempt.time_taken_minutes} minutes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      attempt.score >= 70 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.score}%
                    </div>
                    <Badge variant={attempt.score >= 70 ? "default" : "destructive"}>
                      {attempt.score >= 70 ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Quiz Attempts</h3>
              <p>Take your first civic knowledge quiz to see your performance here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};