import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Eye, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  diaspora_engagement_score: number;
  relevance_score: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  query,
  onResultClick,
  className = ''
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
    }

    return stars;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <CardContent>
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No villages found</h3>
          <p className="text-muted-foreground mb-4">
            {query 
              ? `No villages match "${query}". Try adjusting your search or filters.`
              : 'Enter a search term to find villages across Cameroon.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {results.length} village{results.length !== 1 ? 's' : ''} found
          {query && (
            <span className="text-muted-foreground font-normal">
              {' '}for "{query}"
            </span>
          )}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((village) => (
          <Card 
            key={village.id} 
            className="hover:shadow-lg transition-all duration-200 group cursor-pointer"
          >
            <Link 
              to={`/villages/${village.id}`}
              onClick={() => onResultClick?.(village)}
              className="block"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {highlightText(village.village_name, query)}
                      {village.is_verified && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {highlightText(`${village.subdivision}, ${village.division}, ${village.region}`, query)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <div className="flex items-center">
                      {renderStars(village.overall_rating)}
                      <span className="ml-1 text-sm font-medium">
                        {village.overall_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {village.total_ratings_count} ratings
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <div className="text-lg font-bold text-primary">{village.sons_daughters_count}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-secondary">{village.view_count}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent">{village.infrastructure_score}/20</div>
                    <div className="text-xs text-muted-foreground">Infra</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Education: {village.education_score}/10
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Health: {village.health_score}/10
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Diaspora: {village.diaspora_engagement_score}/10
                  </Badge>
                </div>

                {village.relevance_score > 0 && village.relevance_score < 1 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Relevance: {Math.round(village.relevance_score * 100)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};