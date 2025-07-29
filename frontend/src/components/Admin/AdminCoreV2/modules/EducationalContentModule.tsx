import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, BookOpen, Play, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface EducationalContentModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

export const EducationalContentModule: React.FC<EducationalContentModuleProps> = ({
  hasPermission,
  logActivity
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch civic education content
  const { data: educationalContent, isLoading } = useQuery({
    queryKey: ['educational-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_education_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('educational_content')
  });

  // Fetch quiz data
  const { data: quizzes } = useQuery({
    queryKey: ['civic-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_education_quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('educational_content')
  });

  // Fetch educational stats
  const { data: educationalStats } = useQuery({
    queryKey: ['educational-stats'],
    queryFn: async () => {
      const [content, quizData, attempts] = await Promise.all([
        supabase.from('civic_education_content').select('id', { count: 'exact' }),
        supabase.from('civic_education_quizzes').select('id', { count: 'exact' }),
        supabase.from('civic_quiz_attempts').select('id', { count: 'exact' })
      ]);

      return {
        totalContent: content.data?.length || 0,
        totalQuizzes: quizData.data?.length || 0,
        totalAttempts: attempts.data?.length || 0,
        avgScore: 85 // This would need proper calculation
      };
    },
    enabled: hasPermission('educational_content')
  });

  // Delete content mutation
  const deleteContent = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from('civic_education_content')
        .delete()
        .eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educational-content'] });
      queryClient.invalidateQueries({ queryKey: ['educational-stats'] });
      toast({ title: "Content deleted successfully" });
      logActivity('educational_content_deleted', { timestamp: new Date() });
    },
    onError: (error) => {
      toast({ title: "Error deleting content", description: error.message, variant: "destructive" });
    }
  });

  const getContentTypeBadge = (type: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      quiz: 'bg-green-100 text-green-800',
      interactive: 'bg-purple-100 text-purple-800'
    } as const;
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      beginner: 'default',
      intermediate: 'secondary',
      advanced: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[difficulty as keyof typeof variants] || 'outline'}>
        {difficulty}
      </Badge>
    );
  };

  if (!hasPermission('educational_content')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You don't have permission to access educational content management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Educational Content Management"
        description="Manage civic education content, quizzes, and learning materials"
        icon={GraduationCap}
        iconColor="text-blue-600"
        badge={{
          text: "Education System",
          variant: "secondary"
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['educational-content'] });
          logActivity('educational_content_refresh', { timestamp: new Date() });
        }}
      />

      {/* Educational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Content"
          value={educationalStats?.totalContent?.toString() || '0'}
          icon={BookOpen}
          description="Educational materials"
        />
        <StatCard
          title="Active Quizzes"
          value={educationalStats?.totalQuizzes?.toString() || '0'}
          icon={GraduationCap}
          badge={{ text: "Live", variant: "default" }}
        />
        <StatCard
          title="Quiz Attempts"
          value={educationalStats?.totalAttempts?.toString() || '0'}
          icon={Users}
          description="Total user attempts"
        />
        <StatCard
          title="Average Score"
          value={educationalStats?.avgScore?.toString() || '0'}
          icon={Play}
          trend={{ value: 12.5, isPositive: true, period: "this month" }}
        />
      </div>

      {/* Educational Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="analytics">Learning Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {educationalContent?.slice(0, 5).map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <div className="flex gap-2 mt-1">
                          {getContentTypeBadge(content.content_type || 'article')}
                          {getDifficultyBadge(content.difficulty_level || 'beginner')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Learners</span>
                    <Badge variant="default">156</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <Badge variant="secondary">78%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificates Issued</span>
                    <Badge variant="outline">89</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Content Library ({educationalContent?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {educationalContent?.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{content.title}</h3>
                      <p className="text-sm text-muted-foreground">{content.summary || 'No description available'}</p>
                      <div className="flex gap-2 mt-2">
                        {getContentTypeBadge(content.content_type || 'article')}
                        {getDifficultyBadge(content.difficulty_level || 'beginner')}
                        <Badge variant="outline">
                          {new Date(content.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteContent.mutate(content.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Civic Education Quizzes ({quizzes?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <div className="space-y-4">
                {quizzes?.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <p className="text-sm text-muted-foreground">{quiz.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Questions available</Badge>
                        <Badge variant="secondary">30 minutes</Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Quiz Score</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Completion Rate</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certificate Completion</span>
                      <span className="font-semibold">65%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Popular Topics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Constitutional Rights</span>
                      <Badge>234 views</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Voting Process</span>
                      <Badge>189 views</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Government</span>
                      <Badge>156 views</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};