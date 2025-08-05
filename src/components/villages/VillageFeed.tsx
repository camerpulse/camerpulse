import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVillageActivity } from '@/hooks/useVillages';
import { MapPin, Clock, TrendingUp, FileText, Users, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const VillageFeed: React.FC = () => {
  const { data: recentActivity, isLoading } = useVillageActivity();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Mock activity types for demonstration
  const activityTypes = [
    'village_added', 'project_updated', 'new_citizen', 'petition_launched', 
    'leadership_update', 'rating_added'
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'village_added': return MapPin;
      case 'project_updated': return TrendingUp;
      case 'new_citizen': return Users;
      case 'petition_launched': return FileText;
      case 'leadership_update': return Star;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'village_added': return 'text-green-600';
      case 'project_updated': return 'text-blue-600';
      case 'new_citizen': return 'text-purple-600';
      case 'petition_launched': return 'text-orange-600';
      case 'leadership_update': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const generateActivityMessage = (village: any, type: string) => {
    switch (type) {
      case 'village_added':
        return `New village ${village.village_name} was added to ${village.region} region`;
      case 'project_updated':
        return `${village.village_name} updated their development projects`;
      case 'new_citizen':
        return `3 new citizens joined ${village.village_name}`;
      case 'petition_launched':
        return `New petition launched for ${village.village_name}`;
      case 'leadership_update':
        return `Leadership information updated for ${village.village_name}`;
      default:
        return `Activity in ${village.village_name}`;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">🔥 Village Feed - Live Civic Activity</h2>
          <p className="text-muted-foreground">
            Real-time updates from villages across Cameroon
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All Activity
        </Button>
      </div>

      <div className="space-y-4">
        {recentActivity?.map((village, index) => {
          const activityType = activityTypes[index % activityTypes.length];
          const ActivityIcon = getActivityIcon(activityType);
          const iconColor = getActivityColor(activityType);
          
          return (
            <div
              key={village.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full bg-muted`}>
                <ActivityIcon className={`w-4 h-4 ${iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">
                    {generateActivityMessage(village, activityType)}
                  </p>
                  {village.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{village.division}, {village.region}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(village.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  {village.overall_rating.toFixed(1)}★
                </div>
                <div className="text-xs text-muted-foreground">
                  {village.total_ratings_count} ratings
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Options */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">All Regions</Button>
          <Button variant="outline" size="sm">New Villages</Button>
          <Button variant="outline" size="sm">Projects</Button>
          <Button variant="outline" size="sm">Petitions</Button>
          <Button variant="outline" size="sm">Leadership</Button>
        </div>
      </div>
    </Card>
  );
};