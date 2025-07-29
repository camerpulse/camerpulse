import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Star, Trophy, Calendar } from 'lucide-react';
import { useGrantPrograms } from '@/hooks/useCivicIncentives';

export const ScholarshipTracker: React.FC = () => {
  const { data: scholarships } = useGrantPrograms();

  const scholarshipPrograms = scholarships?.filter(program => program.program_type === 'scholarship') || [];

  const categories = [
    {
      title: "Top Civic Quiz Performers",
      description: "Scholarships for students who excel in civic education quizzes",
      icon: Star,
      color: "text-yellow-600",
      requirement: "Score 85%+ in constitutional knowledge"
    },
    {
      title: "Constitution Literacy Champions", 
      description: "Awards for demonstrating mastery of constitutional principles",
      icon: Trophy,
      color: "text-blue-600",
      requirement: "Complete advanced constitutional courses"
    },
    {
      title: "Village Leadership Excellence",
      description: "Supporting students from civic-leading communities",
      icon: GraduationCap,
      color: "text-green-600",
      requirement: "From top-performing civic villages"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scholarship Opportunities</h2>
        <p className="text-muted-foreground">
          Earn scholarships through civic engagement and educational excellence
        </p>
      </div>

      {/* Scholarship Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${category.color}`} />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Requirement:</p>
                    <p className="text-sm">{category.requirement}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Eligibility
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Scholarship Programs */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Current Scholarship Programs</h3>
        <div className="grid gap-4">
          {scholarshipPrograms.map((scholarship) => (
            <Card key={scholarship.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{scholarship.program_name}</CardTitle>
                    <CardDescription className="mt-2">{scholarship.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {scholarship.max_award_amount_fcfa?.toLocaleString()} FCFA
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Deadline: {scholarship.application_deadline ? 
                          new Date(scholarship.application_deadline).toLocaleDateString() : 
                          'Open'
                        }
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {scholarship.program_category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Learn More</Button>
                    <Button size="sm">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Eligibility Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Your Scholarship Eligibility</CardTitle>
          <CardDescription>
            Track your progress toward scholarship requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Quiz Completion Rate</span>
              <Badge variant="secondary">78%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Constitutional Knowledge Score</span>
              <Badge variant="secondary">82%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Civic Engagement Level</span>
              <Badge variant="default">High</Badge>
            </div>
            <Button className="w-full mt-4">
              Complete Eligibility Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};