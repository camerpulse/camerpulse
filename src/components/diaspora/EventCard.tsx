import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  duration_minutes: number;
  max_attendees?: number;
  registration_required: boolean;
  languages: string[];
  target_regions?: string[];
  event_status: string;
}

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();
  
  const eventTypeColors = {
    virtual_town_hall: 'bg-blue-500',
    civic_summit: 'bg-purple-500',
    council_roundtable: 'bg-green-500',
    investment_webinar: 'bg-orange-500',
  };

  if (compact) {
    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
          <Badge 
            variant="secondary" 
            className={`${eventTypeColors[event.event_type as keyof typeof eventTypeColors]} text-white border-0 text-xs`}
          >
            {event.event_type.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(eventDate, 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(eventDate, 'HH:mm')} ({event.duration_minutes}min)
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
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${eventTypeColors[event.event_type as keyof typeof eventTypeColors]} text-white border-0`}
              >
                {event.event_type.replace('_', ' ')}
              </Badge>
              {isUpcoming ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Upcoming
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Past
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <div>
              <div>{format(eventDate, 'EEEE, MMMM dd')}</div>
              <div className="text-xs">{format(eventDate, 'yyyy')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <div>
              <div>{format(eventDate, 'HH:mm')}</div>
              <div className="text-xs">{event.duration_minutes} minutes</div>
            </div>
          </div>
        </div>

        {event.max_attendees && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Max {event.max_attendees} attendees
          </div>
        )}

        {event.languages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Languages: {event.languages.join(', ')}
          </div>
        )}

        {event.target_regions && event.target_regions.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Target Regions:</p>
            <div className="flex flex-wrap gap-1">
              {event.target_regions.map((region) => (
                <Badge key={region} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isUpcoming && event.registration_required ? (
            <Button className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Register
            </Button>
          ) : isUpcoming ? (
            <Button className="flex-1">
              <Video className="h-4 w-4 mr-2" />
              Join Event
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Event Ended
            </Button>
          )}
          <Button variant="outline" className="flex-1">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};