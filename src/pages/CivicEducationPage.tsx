import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Play,
  Award,
  CheckCircle,
  Clock,
  Globe,
  Scale,
  Vote
} from 'lucide-react';

export function CivicEducationPage() {
  const courses = [
    {
      title: "Understanding Democracy",
      description: "Learn the fundamentals of democratic governance and citizen participation",
      duration: "2 hours",
      level: "Beginner",
      progress: 0,
      icon: Vote,
      lessons: 8
    },
    {
      title: "Cameroon Constitution",
      description: "Comprehensive guide to Cameroon's constitution and legal framework",
      duration: "3 hours", 
      level: "Intermediate",
      progress: 0,
      icon: Scale,
      lessons: 12
    },
    {
      title: "Citizen Rights & Duties",
      description: "Know your rights and responsibilities as a Cameroonian citizen",
      duration: "1.5 hours",
      level: "Beginner", 
      progress: 0,
      icon: Users,
      lessons: 6
    },
    {
      title: "Electoral Process",
      description: "How elections work in Cameroon from registration to results",
      duration: "2.5 hours",
      level: "Intermediate",
      progress: 0,
      icon: FileText,
      lessons: 10
    }
  ];

  const quickFacts = [
    {
      title: "Independence Day",
      fact: "January 1, 1960 (from France) & October 1, 1961 (reunification)",
      icon: "🇨🇲"
    },
    {
      title: "Government Type", 
      fact: "Unitary presidential republic",
      icon: "🏛️"
    },
    {
      title: "Official Languages",
      fact: "French and English",
      icon: "🗣️"
    },
    {
      title: "Capital Cities",
      fact: "Yaoundé (political), Douala (economic)",
      icon: "🏙️"
    },
    {
      title: "Voting Age",
      fact: "18 years old",
      icon: "🗳️"
    },
    {
      title: "Term Length",
      fact: "President: 7 years, Parliament: 5 years",
      icon: "⏰"
    }
  ];

  const achievements = [
    { title: "Constitution Expert", icon: Award, earned: false },
    { title: "Democracy Scholar", icon: BookOpen, earned: false },
    { title: "Civic Champion", icon: Users, earned: false },
    { title: "Rights Advocate", icon: Scale, earned: false }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Civic Education</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Empower yourself with knowledge about democratic processes, citizen rights, 
          and civic responsibilities. Build a stronger democracy through education.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">Courses Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">15.2K</div>
            <p className="text-sm text-muted-foreground">Students Learning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">8.7K</div>
            <p className="text-sm text-muted-foreground">Certificates Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Languages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Courses */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <course.icon className="h-8 w-8 text-primary" />
                      <Badge variant={course.level === 'Beginner' ? 'default' : 'secondary'}>
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                    
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {course.lessons} lessons
                      </span>
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    )}

                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quick Facts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickFacts.map((fact, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl">{fact.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{fact.title}</h4>
                    <p className="text-xs text-muted-foreground">{fact.fact}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </span>
                  {achievement.earned && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold mb-2">Start Your Journey</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Begin with our democracy fundamentals course
              </p>
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}