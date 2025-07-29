import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Target, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount_fcfa: number;
  raised_amount_fcfa: number;
  location: string;
  project_status: string;
  completion_percentage: number;
  expected_completion_date?: string;
  project_manager?: string;
}

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, compact = false }) => {
  const progressPercentage = Math.round((project.raised_amount_fcfa / project.target_amount_fcfa) * 100);
  
  const statusColors = {
    fundraising: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  if (compact) {
    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm line-clamp-1">{project.title}</h4>
          <Badge variant="secondary" className="text-xs">
            {project.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs">
            <span>{progressPercentage}% funded</span>
            <span className="font-medium">{project.raised_amount_fcfa.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{project.category}</Badge>
              <Badge 
                variant="outline" 
                className={`${statusColors[project.project_status as keyof typeof statusColors]} text-white border-0`}
              >
                {project.project_status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {project.location}
        </div>
        
        {project.expected_completion_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Expected completion: {new Date(project.expected_completion_date).toLocaleDateString()}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Funding Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm">
            <span>Raised: {project.raised_amount_fcfa.toLocaleString()} FCFA</span>
            <span>Goal: {project.target_amount_fcfa.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <DollarSign className="h-4 w-4 mr-2" />
            Donate
          </Button>
          <Button variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};