import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  registration_fee?: number;
  max_attendees?: number;
  current_attendees: number;
}

interface EventRegistrationDialogProps {
  event: Event;
  children: React.ReactNode;
  onRegistrationChange?: () => void;
}

export const EventRegistrationDialog: React.FC<EventRegistrationDialogProps> = ({
  event,
  children,
  onRegistrationChange
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going'>('going');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleRegistration = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for this event",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          rsvp_status: rsvpStatus,
          additional_info: additionalInfo
        });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: `You've registered as "${rsvpStatus}" for ${event.title}`,
      });

      onRegistrationChange?.();
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for this event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isEventFull = event.max_attendees && event.current_attendees >= event.max_attendees;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold">{event.title}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{event.start_time} - {event.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              {event.registration_fee && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{event.registration_fee} FCFA</span>
                </div>
              )}
              {event.max_attendees && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{event.current_attendees} / {event.max_attendees} attendees</span>
                </div>
              )}
            </div>
          </div>

          {isEventFull ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">This event is fully booked</p>
            </div>
          ) : (
            <>
              {/* RSVP Status */}
              <div className="space-y-3">
                <Label>RSVP Status</Label>
                <RadioGroup value={rsvpStatus} onValueChange={(value: any) => setRsvpStatus(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="going" id="going" />
                    <Label htmlFor="going">Going</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interested" id="interested" />
                    <Label htmlFor="interested">Interested</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_going" id="not_going" />
                    <Label htmlFor="not_going">Can't Go</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                <Input
                  id="additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any special requirements or notes..."
                />
              </div>

              {/* Registration Fee Notice */}
              {event.registration_fee && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="text-yellow-800">
                    This event requires a registration fee of {event.registration_fee} FCFA. 
                    Payment details will be sent after registration.
                  </p>
                </div>
              )}

              <Button 
                onClick={handleRegistration} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? 'Registering...' : 'Register for Event'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};