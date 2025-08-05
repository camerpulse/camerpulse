import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { URLBuilder } from '@/utils/slugUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Share2,
  Ticket,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Building,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description?: string;
    short_description?: string;
    start_date: string;
    end_date?: string;
    venue_name?: string;
    venue_address?: string;
    region: string;
    subregion?: string;
    cover_image_url?: string;
    event_type: string;
    organizer_type: string;
    organizer_verified: boolean;
    is_civic_official: boolean;
    max_attendees?: number;
    allow_rsvp: boolean;
    status: string;
    view_count: number;
    share_count: number;
    civic_tags: string[];
    created_at: string;
    rsvp_count?: number;
  };
  onRsvpUpdate?: () => void;
  variant?: 'list' | 'card' | 'featured';
}

export const EventCard = ({ event, onRsvpUpdate, variant = 'card' }: EventCardProps) => {
  const { user } = useAuth();
  const [rsvpStatus, setRsvpStatus] = useState<'interested' | 'going' | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const eventDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const now = new Date();
  const isOngoing = isBefore(eventDate, now) && endDate && isAfter(endDate, now);
  const isPast = isBefore(eventDate, now) && (!endDate || isBefore(endDate, now));
  const isUpcoming = isAfter(eventDate, now);

  const getEventStatus = () => {
    if (isPast) return { text: 'Past', variant: 'secondary' as const };
    if (isOngoing) return { text: 'Live', variant: 'destructive' as const };
    if (isUpcoming) return { text: 'Upcoming', variant: 'default' as const };
    return { text: 'Draft', variant: 'outline' as const };
  };

  const getOrganizerIcon = () => {
    switch (event.organizer_type) {
      case 'government_institution':
        return <Building className="w-4 h-4" />;
      case 'political_party':
        return <Users className="w-4 h-4" />;
      case 'verified_user':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const handleRsvp = async (status: 'interested' | 'going') => {
    if (!user) {
      toast.error('Please log in to RSVP');
      return;
    }

    setRsvpLoading(true);
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          rsvp_status: status
        });

      if (error) throw error;

      setRsvpStatus(status);
      onRsvpUpdate?.();
      toast.success(`RSVP updated: ${status}`);
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.name,
        text: event.short_description || event.description,
        url: URLBuilder.events.detail({ id: event.id, title: event.name })
      });
    } catch {
      // Fallback to copying to clipboard
      const eventUrl = URLBuilder.events.detail({ id: event.id, title: event.name });
      await navigator.clipboard.writeText(window.location.origin + eventUrl);
      toast.success('Event link copied to clipboard');
    }
  };

  const statusBadge = getEventStatus();

  if (variant === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Event Image */}
            <div className="flex-shrink-0">
              {event.cover_image_url ? (
                <img 
                  src={event.cover_image_url} 
                  alt={event.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{event.name}</h3>
                    {event.is_civic_official && (
                      <Badge variant="destructive" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Official
                      </Badge>
                    )}
                    {event.organizer_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(eventDate, 'MMM d, yyyy • h:mm a')}
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.venue_name}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.short_description || event.description}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    <Badge variant="outline">{event.event_type}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getOrganizerIcon()}
                      {event.organizer_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-sm font-medium">{event.rsvp_count || 0}</div>
                    <div className="text-xs text-muted-foreground">RSVPs</div>
                  </div>
                  
                  {event.allow_rsvp && !isPast && user && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
                        onClick={() => handleRsvp('interested')}
                        disabled={rsvpLoading}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                        onClick={() => handleRsvp('going')}
                        disabled={rsvpLoading}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button size="sm" variant="ghost" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200",
      variant === 'featured' && "border-primary/20 bg-gradient-to-br from-primary/5 to-background"
    )}>
      {/* Event Image */}
      {event.cover_image_url && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={event.cover_image_url} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
          </div>
          {event.is_civic_official && (
            <div className="absolute top-4 right-4">
              <Badge variant="destructive">
                <CheckCircle className="w-3 h-3 mr-1" />
                Official
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.short_description || event.description}
            </CardDescription>
          </div>
          {event.organizer_verified && (
            <Badge variant="secondary" className="text-xs">
              Verified
            </Badge>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(eventDate, 'MMM d, yyyy • h:mm a')}
          </div>
          
          {event.venue_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getOrganizerIcon()}
            <span className="capitalize">{event.organizer_type.replace('_', ' ')}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.rsvp_count || 0} RSVPs
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {event.view_count} views
            </div>
          </div>

          <div className="flex items-center gap-2">
            {event.allow_rsvp && !isPast && user && (
              <>
                <Button
                  size="sm"
                  variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
                  onClick={() => handleRsvp('interested')}
                  disabled={rsvpLoading}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                  onClick={() => handleRsvp('going')}
                  disabled={rsvpLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <Button size="sm" variant="ghost" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {(event.civic_tags.length > 0 || event.event_type) && (
          <div className="flex flex-wrap gap-1 mt-4">
            <Badge variant="outline">{event.event_type}</Badge>
            {event.civic_tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.civic_tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{event.civic_tags.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};