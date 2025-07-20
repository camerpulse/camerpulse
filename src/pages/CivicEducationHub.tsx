import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Award, 
  Search, 
  Filter,
  Star,
  Clock,
  Users,
  Play,
  FileText,
  Image,
  HelpCircle,
  TrendingUp,
  Calendar,
  Trophy
} from 'lucide-react';

const CivicEducationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featuredContent = [
    {
      id: 1,
      title: 'Understanding Democratic Governance in Cameroon',
      type: 'article',
      difficulty: 'beginner',
      duration: 15,
      summary: 'A comprehensive introduction to how democratic institutions work in Cameroon',
      tags: ['democracy', 'governance', 'cameroon'],
      author: 'CamerPulse Education Team',
      rating: 4.8,
      enrollments: 2340,
      featured: true,
      thumbnail: '/placeholder.svg'
    },
    {
      id: 2,
      title: 'Your Rights as a Citizen',
      type: 'video',
      difficulty: 'beginner',
      duration: 25,
      summary: 'Learn about your fundamental rights and how to protect them',
      tags: ['rights', 'citizenship', 'law'],
      author: 'Legal Education Initiative',
      rating: 4.6,
      enrollments: 1890,
      featured: true,
      thumbnail: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'How to Engage with Local Government',
      type: 'interactive',
      difficulty: 'intermediate',
      duration: 45,
      summary: 'Interactive guide to participating in local governance',
      tags: ['local government', 'participation'],
      author: 'Civic Engagement Network',
      rating: 4.9,
      enrollments: 1234,
      featured: false,
      thumbnail: '/placeholder.svg'
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'Civic Participation Fundamentals',
      description: 'A complete introduction to civic engagement and democratic participation',
      difficulty: 'beginner',
      duration: 8,
      modules: 6,
      enrollments: 5670,
      completion: 78,
      certificate: true
    },
    {
      id: 2,
      title: 'Advanced Government Relations',
      description: 'Master the art of effective government advocacy and policy influence',
      difficulty: 'advanced',
      duration: 12,
      modules: 8,
      enrollments: 1234,
      completion: 65,
      certificate: true
    }
  ];

  const achievements = [
    { title: 'Civic Scholar', description: 'Completed first learning path', icon: Trophy, earned: true },
    { title: 'Democracy Expert', description: 'Mastered governance fundamentals', icon: Award, earned: true },
    { title: 'Community Leader', description: 'Completed community engagement course', icon: Users, earned: false },
    { title: 'Rights Advocate', description: 'Finished constitutional rights module', icon: FileText, earned: false }
  ];

  const categories = [
    { id: 'all', label: 'All Content', count: 234 },
    { id: 'democracy', label: 'Democracy', count: 45 },
    { id: 'rights', label: 'Rights & Law', count: 38 },
    { id: 'governance', label: 'Governance', count: 52 },
    { id: 'participation', label: 'Civic Participation', count: 41 },
    { id: 'history', label: 'History', count: 28 },
    { id: 'economics', label: 'Economics', count: 30 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <HelpCircle className="w-4 h-4" />;
      case 'quiz': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const ContentCard = ({ content }: { content: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="relative">
          <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
            <div className="text-muted-foreground">
              {getTypeIcon(content.type)}
            </div>
          </div>
          {content.featured && (
            <Badge className="absolute top-2 right-2 bg-orange-500">Featured</Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              {getTypeIcon(content.type)}
              <span className="capitalize">{content.type}</span>
            </Badge>
            <Badge className={`${getDifficultyColor(content.difficulty)} text-white text-xs`}>
              {content.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {content.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {content.summary}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Content Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{content.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{content.enrollments}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{content.rating}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Author */}
          <div className="text-sm text-muted-foreground">
            by {content.author}
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            <Button variant="outline" size="icon">
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LearningPathCard = ({ path }: { path: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`${getDifficultyColor(path.difficulty)} text-white`}>
                {path.difficulty}
              </Badge>
              {path.certificate && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Certificate</span>
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{path.title}</CardTitle>
            <CardDescription className="mt-2">{path.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{path.duration}h</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{path.modules}</div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{path.enrollments}</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Avg. Completion Rate</span>
              <span>{path.completion}%</span>
            </div>
            <Progress value={path.completion} className="h-2" />
          </div>

          <Button className="w-full">Enroll Now</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Civic Education Hub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn about democracy, civic engagement, and your role as an active citizen
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">234</div>
              <div className="text-sm text-muted-foreground">Learning Resources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">12.4k</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">3,241</div>
              <div className="text-sm text-muted-foreground">Certificates Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">89%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="content" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="content">Learning Content</TabsTrigger>
                  <TabsTrigger value="paths">Learning Paths</TabsTrigger>
                  <TabsTrigger value="progress">My Progress</TabsTrigger>
                </TabsList>

                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-8"
                  >
                    {category.label} ({category.count})
                  </Button>
                ))}
              </div>

              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredContent.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="paths" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {learningPaths.map((path) => (
                    <LearningPathCard key={path.id} path={path} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>Track your civic education journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start Your Learning Journey</h3>
                      <p className="text-muted-foreground mb-4">
                        Begin with any course or learning path to track your progress here.
                      </p>
                      <Button>Browse Content</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-muted/50'}`}>
                      <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Take a Quiz
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Watch Introduction
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Earn Certificate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicEducationHub;