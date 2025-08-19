import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Users, 
  Star, 
  TrendingUp, 
  Award, 
  Shield, 
  Eye,
  Heart,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EnhancedPoliticalCardProps {
  entity: any;
  type: 'politician' | 'senator' | 'mp' | 'minister';
  variant?: 'grid' | 'list' | 'compact';
  showActions?: boolean;
  showMetrics?: boolean;
  showContact?: boolean;
  className?: string;
}

export const EnhancedPoliticalCard: React.FC<EnhancedPoliticalCardProps> = ({
  entity,
  type,
  variant = 'grid',
  showActions = true,
  showMetrics = true,
  showContact = false,
  className = ''
}) => {
  const getEntityPath = () => {
    switch (type) {
      case 'politician': return `/politicians/${entity.slug}`;
      case 'senator': return `/senators/${entity.slug}`;
      case 'mp': return `/mps/${entity.slug}`;
      case 'minister': return `/ministers/${entity.slug}`;
      default: return '#';
    }
  };

  const getPositionBadgeColor = (position?: string) => {
    if (!position) return 'secondary';
    if (position.includes('President')) return 'default';
    if (position.includes('Vice') || position.includes('Deputy')) return 'outline';
    if (position.includes('Minister')) return 'destructive';
    if (position.includes('Secretary')) return 'secondary';
    return 'outline';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderCompactView = () => (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entity.photo_url || entity.profile_picture_url} />
            <AvatarFallback>{entity.name?.[0] || entity.full_name?.[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {entity.name || entity.full_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {entity.position || entity.office || 'Member of Parliament'}
            </p>
            {entity.political_party && (
              <Badge variant="outline" className="text-xs mt-1">
                {entity.political_party}
              </Badge>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-xs text-muted-foreground">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {(entity.average_rating || 0).toFixed(1)}
            </div>
            <Link to={getEntityPath()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={entity.photo_url || entity.profile_picture_url} />
            <AvatarFallback className="text-lg">
              {entity.name?.[0] || entity.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <Link to={getEntityPath()}>
                <h3 className="text-xl font-bold hover:text-primary transition-colors">
                  {entity.name || entity.full_name}
                </h3>
              </Link>
              <p className="text-muted-foreground">
                {entity.position || entity.office || 'Member of Parliament'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {entity.political_party && (
                <Badge variant={getPositionBadgeColor(entity.position)}>
                  {entity.political_party}
                </Badge>
              )}
              {entity.region && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {entity.region}
                </Badge>
              )}
              {entity.constituency && (
                <Badge variant="outline">
                  {entity.constituency}
                </Badge>
              )}
            </div>
            
            {showMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {(entity.performance_score || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {(entity.transparency_score || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Transparency</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-lg font-bold">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {(entity.average_rating || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {entity.bills_proposed_count || entity.bills_passed_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Bills</div>
                </div>
              </div>
            )}
            
            {showContact && (entity.email || entity.phone) && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                {entity.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {entity.email}
                  </div>
                )}
                {entity.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {entity.phone}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="flex flex-col gap-2">
              <Link to={getEntityPath()}>
                <Button size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                Follow
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderGridView = () => (
    <Card className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Avatar className="h-16 w-16">
            <AvatarImage src={entity.photo_url || entity.profile_picture_url} />
            <AvatarFallback className="text-lg">
              {entity.name?.[0] || entity.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-right">
            <div className="flex items-center text-sm font-medium">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              {(entity.average_rating || 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              ({entity.total_ratings || 0} reviews)
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link to={getEntityPath()}>
            <h3 className="font-bold text-lg hover:text-primary transition-colors cursor-pointer">
              {entity.name || entity.full_name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            {entity.position || entity.office || 'Member of Parliament'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {entity.political_party && (
            <Badge variant={getPositionBadgeColor(entity.position)} className="text-xs">
              {entity.political_party}
            </Badge>
          )}
          {entity.region && (
            <Badge variant="outline" className="text-xs">
              {entity.region}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showMetrics && (
          <>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Performance</span>
                  <span className={getPerformanceColor(entity.performance_score || 0)}>
                    {(entity.performance_score || 0).toFixed(1)}%
                  </span>
                </div>
                <Progress value={entity.performance_score || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Transparency</span>
                  <span className={getPerformanceColor(entity.transparency_score || 0)}>
                    {(entity.transparency_score || 0).toFixed(1)}%
                  </span>
                </div>
                <Progress value={entity.transparency_score || 0} className="h-2" />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">
                  {entity.bills_proposed_count || entity.bills_passed_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Bills</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary">
                  {entity.committee_memberships?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Committees</div>
              </div>
            </div>
          </>
        )}
        
        {showActions && (
          <div className="flex gap-2">
            <Link to={getEntityPath()} className="flex-1">
              <Button size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (variant === 'compact') return renderCompactView();
  if (variant === 'list') return renderListView();
  return renderGridView();
};