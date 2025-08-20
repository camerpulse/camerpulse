import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { URLBuilder } from '@/utils/slug';
import { 
  Users, 
  Target, 
  Clock, 
  MapPin, 
  TrendingUp,
  ExternalLink,
  Star
} from 'lucide-react';

interface FeaturedPetition {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  current_signatures: number;
  goal_signatures: number;
  created_at: string;
  target_institution: string;
  featured_reason?: string;
}

interface FeaturedPetitionsProps {
  className?: string;
}

const FEATURED_PETITIONS: FeaturedPetition[] = [
  {
    id: '1',
    title: 'Improve Healthcare Access in Rural Communities',
    description: 'Demand better healthcare facilities and medical equipment in remote villages across Cameroon.',
    category: 'health',
    location: 'National',
    current_signatures: 15420,
    goal_signatures: 25000,
    created_at: '2024-01-15',
    target_institution: 'Ministry of Health',
    featured_reason: 'Most Impactful'
  },
  {
    id: '2',
    title: 'Transparent Government Procurement Process',
    description: 'Call for complete transparency in government contracts and public procurement to reduce corruption.',
    category: 'governance',
    location: 'National',
    current_signatures: 12890,
    goal_signatures: 20000,
    created_at: '2024-01-20',
    target_institution: 'Office of the Prime Minister',
    featured_reason: 'Trending Now'
  },
  {
    id: '3',
    title: 'Digital Infrastructure for Education',
    description: 'Ensure reliable internet connectivity and digital tools for schools in underserved areas.',
    category: 'education',
    location: 'Centre Region',
    current_signatures: 8750,
    goal_signatures: 15000,
    created_at: '2024-01-25',
    target_institution: 'Ministry of Education',
    featured_reason: 'Community Favorite'
  }
];

export const FeaturedPetitions: React.FC<FeaturedPetitionsProps> = ({ className }) => {
  const getCategoryIcon = (category: string) => {
    const icons = {
      health: '🏥',
      governance: '🏛️',
      education: '📚',
      justice: '⚖️',
      environment: '🌍',
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getFeaturedBadgeVariant = (reason: string) => {
    switch (reason) {
      case 'Most Impactful':
        return 'default';
      case 'Trending Now':
        return 'destructive';
      case 'Community Favorite':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getFeaturedIcon = (reason: string) => {
    switch (reason) {
      case 'Most Impactful':
        return Target;
      case 'Trending Now':
        return TrendingUp;
      case 'Community Favorite':
        return Star;
      default:
        return Star;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Featured Petitions</h2>
          <p className="text-muted-foreground">
            Highlighting petitions making the biggest impact
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURED_PETITIONS.map((petition) => {
          const FeaturedIcon = getFeaturedIcon(petition.featured_reason!);
          
          return (
            <Card key={petition.id} className="group hover:shadow-lg transition-all duration-200 relative overflow-hidden">
              {/* Featured Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge 
                  variant={getFeaturedBadgeVariant(petition.featured_reason!)}
                  className="flex items-center gap-1 text-xs"
                >
                  <FeaturedIcon className="w-3 h-3" />
                  {petition.featured_reason}
                </Badge>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Category & Location */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryIcon(petition.category)} {petition.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {petition.location}
                  </Badge>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <Link to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })}>
                    <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
                      {petition.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {petition.description}
                  </p>
                </div>

                {/* Target Institution */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="truncate">{petition.target_institution}</span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 font-medium">
                      <Users className="w-4 h-4" />
                      {petition.current_signatures.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">
                      of {petition.goal_signatures.toLocaleString()}
                    </div>
                  </div>
                  
                  <Progress 
                    value={getProgressPercentage(petition.current_signatures, petition.goal_signatures)}
                    className="h-2"
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage(petition.current_signatures, petition.goal_signatures).toFixed(1)}% complete
                  </div>
                </div>

                {/* Action Button */}
                <Link to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })}>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Sign Petition
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};