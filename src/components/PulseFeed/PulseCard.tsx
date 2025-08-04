import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  MapPin,
  Globe
} from 'lucide-react';

interface PulseProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    isDiaspora?: boolean;
    location?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  hashtags?: string[];
  isLiked?: boolean;
}

export const PulseCard = ({ pulse }: { pulse: PulseProps }) => {
  const navigate = useNavigate();
  
  const getSentimentColor = () => {
    switch (pulse.sentiment) {
      case 'positive': return 'bg-cm-green text-white';
      case 'negative': return 'bg-cm-red text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSentimentIcon = () => {
    switch (pulse.sentiment) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card className="mb-4 border-border/50 hover:shadow-elegant transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => navigate(`/@${pulse.user.username}`)}
            >
              <AvatarImage src={pulse.user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {pulse.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 
                  className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/@${pulse.user.username}`)}
                >
                  {pulse.user.name}
                </h4>
                {pulse.user.verified && (
                  <Badge variant="secondary" className="bg-cm-yellow text-cm-yellow-foreground px-2 py-0 text-xs">
                    ✓
                  </Badge>
                )}
                {pulse.user.isDiaspora && (
                  <Badge variant="outline" className="border-primary text-primary px-2 py-0 text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    Diaspora
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{pulse.user.username}</span>
                <span>•</span>
                <span>{pulse.timestamp}</span>
                {pulse.user.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{pulse.user.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getSentimentColor()} px-2 py-1 text-xs`}>
              {getSentimentIcon()}
              {pulse.sentiment}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {pulse.content}
          </p>
          
          {/* Hashtags */}
          {pulse.hashtags && pulse.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pulse.hashtags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${pulse.isLiked ? 'text-cm-red' : 'text-muted-foreground'} hover:text-cm-red transition-colors`}
            >
              <Heart className={`w-4 h-4 ${pulse.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{pulse.likes}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{pulse.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-cm-yellow transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{pulse.shares}</span>
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            PulseShare
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};