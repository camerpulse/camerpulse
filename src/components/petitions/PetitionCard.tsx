import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { URLBuilder } from '@/utils/slug';
import { 
  Users, 
  Clock, 
  MapPin, 
  Target, 
  Share2,
  Bookmark,
  MoreHorizontal,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PetitionCardProps {
  petition: {
    id: string;
    title: string;
    description: string;
    target_institution: string;
    goal_signatures: number;
    current_signatures: number;
    status: string;
    category: string;
    location: string;
    created_at: string;
    deadline?: string;
    creator_id: string;
  };
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
}

export const PetitionCard: React.FC<PetitionCardProps> = ({
  petition,
  showActions = true,
  variant = 'default',
  isBookmarked = false,
  onBookmark,
  onShare
}) => {
  const getCategoryIcon = (category: string) => {
    const icons = {
      governance: '🏛️',
      justice: '⚖️',
      education: '📚',
      health: '🏥',
      agriculture: '🌾',
      digital_rights: '💻',
      local_issues: '🏘️',
      corruption: '🛡️',
      security: '🔒',
      environment: '🌍',
      traditional_authority: '👑',
      others: '📝'
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(petition.deadline);
  const progress = getProgressPercentage(petition.current_signatures, petition.goal_signatures);

  const cardClassName = variant === 'compact' 
    ? "group hover:shadow-md transition-all duration-200" 
    : "group hover:shadow-lg transition-all duration-200 hover:-translate-y-1";

  return (
    <Card className={cardClassName}>
      <CardContent className={variant === 'compact' ? "p-4 space-y-3" : "p-6 space-y-4"}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {getCategoryIcon(petition.category)} {petition.category.replace('_', ' ')}
              </Badge>
              {petition.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {petition.location}
                </Badge>
              )}
              {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {daysLeft} days left
                </Badge>
              )}
            </div>
            
            <Link to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })}>
              <h3 className={`font-semibold hover:text-primary transition-colors line-clamp-2 group-hover:text-primary ${
                variant === 'compact' ? 'text-base' : 'text-lg'
              }`}>
                {petition.title}
              </h3>
            </Link>
            
            <p className={`text-muted-foreground line-clamp-2 ${
              variant === 'compact' ? 'text-sm' : 'text-base'
            }`}>
              {petition.description}
            </p>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onBookmark}>
                  <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="w-4 h-4 mr-2" />
                  View Target
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Target Institution */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Target className="w-4 h-4" />
          <span className="truncate">{petition.target_institution}</span>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1 font-medium">
              <Users className="w-4 h-4" />
              {petition.current_signatures.toLocaleString()} signatures
            </div>
            <div className="text-muted-foreground">
              Goal: {petition.goal_signatures.toLocaleString()}
            </div>
          </div>
          
          <Progress 
            value={progress}
            className="h-2"
          />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{progress.toFixed(1)}% complete</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(petition.created_at)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 pt-2 ${variant === 'compact' ? 'flex-col' : ''}`}>
          <Link 
            to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })} 
            className="flex-1"
          >
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
              Sign Petition
            </Button>
          </Link>
          {variant !== 'compact' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShare}
              className="shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Trending Indicator */}
        {progress > 80 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
            <TrendingUp className="w-3 h-3" />
            Nearly reached goal!
          </div>
        )}
      </CardContent>
    </Card>
  );
};