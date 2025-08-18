import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useTopRatedPoliticians } from '@/hooks/usePoliticalData';
import { Star, TrendingUp, Award, Users } from 'lucide-react';

interface TopRatedPoliticiansProps {
  limit?: number;
  showHeader?: boolean;
}

export const TopRatedPoliticians: React.FC<TopRatedPoliticiansProps> = ({
  limit = 10,
  showHeader = true,
}) => {
  const { data: politicians, isLoading, error } = useTopRatedPoliticians(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          {showHeader && <CardTitle>Top Rated Politicians</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !politicians) {
    return (
      <Card>
        <CardHeader>
          {showHeader && <CardTitle>Top Rated Politicians</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load top rated politicians</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {showHeader && (
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Rated Politicians
            </CardTitle>
            <Link to="/politicians">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {politicians.map((politician, index) => {
            const politicianSlug = politician.name.toLowerCase().replace(/\s+/g, '-');
            
            return (
              <Link key={politician.id} to={`/politicians/${politicianSlug}`}>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={politician.profile_image_url} 
                      alt={politician.name}
                    />
                    <AvatarFallback>
                      {politician.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {politician.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {politician.role_title} • {politician.region}
                        </p>
                        {politician.political_parties?.name && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {politician.political_parties.acronym || politician.political_parties.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {(politician.performance_score / 20).toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Performance Score
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Overall Performance</span>
                        <span>{politician.performance_score}/100</span>
                      </div>
                      <Progress value={politician.performance_score} className="h-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {politicians.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rated Politicians</h3>
            <p className="text-muted-foreground">
              Be the first to rate politicians and help build transparency.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};