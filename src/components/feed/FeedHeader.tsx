import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Users, 
  Globe,
  Sparkles
} from 'lucide-react';

interface FeedHeaderProps {
  civicEventsActive: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  civicEventsActive,
  onRefresh,
  loading
}) => {
  return (
    <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-background to-background/95">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold font-inter bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center gap-3">
              <Globe className="h-7 w-7 text-primary" />
              CamerPulse Feed
              <Sparkles className="h-5 w-5 text-amber-500" />
            </CardTitle>
            <p className="text-muted-foreground font-inter text-base">
              Your personalized civic engagement hub - all platform features in one feed
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-inter font-medium">Live Updates</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-inter font-medium">Community Driven</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-inter font-medium">AI Powered</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {civicEventsActive && (
              <Badge 
                variant="destructive" 
                className="font-inter animate-pulse shadow-lg"
              >
                <Zap className="h-3 w-3 mr-1" />
                Civic Events Active
              </Badge>
            )}
            
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="font-inter font-medium shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};