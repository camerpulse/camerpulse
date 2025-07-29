import React from 'react';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TraditionalEventCardProps {
  event: any;
  showCountdown?: boolean;
}

export const TraditionalEventCard: React.FC<TraditionalEventCardProps> = ({ event, showCountdown }) => {
  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{event.event_name}</h4>
              <p className="text-sm text-muted-foreground">{formatEventType(event.event_type)}</p>
            </div>
            <Badge variant="outline">{formatEventType(event.event_category)}</Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.event_description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            {event.next_occurrence && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{new Date(event.next_occurrence).toLocaleDateString()}</span>
              </div>
            )}
            
            {event.duration_days && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{event.duration_days} day{event.duration_days !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{formatEventType(event.community_involvement_level)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};