import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCeremonialEvents } from '@/hooks/useCeremonialEvents';
import { format, parseISO } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Moon,
  Sun,
  Drum,
  Crown,
  Heart,
  Flower,
  TreePine,
  Zap
} from 'lucide-react';

export const CeremonialCalendar = () => {
  const villageId = 'default-village-id'; // This would come from context or props
  const { events, loading, submitEvent } = useCeremonialEvents(villageId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [newEvent, setNewEvent] = useState({
    ceremony_name: '',
    description: '',
    event_date: '',
    ceremony_type: '',
    location: '',
    cultural_significance: '',
    is_public: true
  });

  const eventTypeIcons = {
    'Festival': <Star className="h-4 w-4" />,
    'Initiation': <Crown className="h-4 w-4" />,
    'Harvest': <TreePine className="h-4 w-4" />,
    'Wedding': <Heart className="h-4 w-4" />,
    'Funeral': <Moon className="h-4 w-4" />,
    'Religious': <Sun className="h-4 w-4" />,
    'Traditional Dance': <Drum className="h-4 w-4" />,
    'Seasonal': <Flower className="h-4 w-4" />,
    'Healing': <Zap className="h-4 w-4" />,
    'Other': <CalendarIcon className="h-4 w-4" />
  };

  const eventTypes = Object.keys(eventTypeIcons);

  const resetForm = () => {
    setNewEvent({
      ceremony_name: '',
      description: '',
      event_date: '',
      ceremony_type: '',
      location: '',
      cultural_significance: '',
      is_public: true
    });
  };

  const handleSaveEvent = async () => {
    if (!newEvent.ceremony_name || !newEvent.event_date || !newEvent.ceremony_type) {
      return;
    }

    try {
      await submitEvent(newEvent);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const filteredEvents = events?.filter(event => 
    filterType === 'all' || event.ceremony_type === filterType
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-primary" />
            Ceremonial Calendar
          </h2>
          <p className="text-muted-foreground">
            Track and plan traditional ceremonies and cultural events
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Ceremonial Event</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceremony_name">Event Name *</Label>
                  <Input
                    id="ceremony_name"
                    value={newEvent.ceremony_name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, ceremony_name: e.target.value }))}
                    placeholder="e.g., Annual Ngondo Festival"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ceremony_type">Event Type *</Label>
                  <Select
                    value={newEvent.ceremony_type}
                    onValueChange={(value) => setNewEvent(prev => ({ ...prev, ceremony_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {eventTypeIcons[type as keyof typeof eventTypeIcons]}
                            {type}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the ceremony, its purpose, and what participants can expect..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Chief's Palace, Douala"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={newEvent.cultural_significance}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, cultural_significance: e.target.value }))}
                  placeholder="Explain the cultural, spiritual, or historical significance of this ceremony..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent}>
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All Events
        </Button>
        {eventTypes.slice(0, 6).map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {eventTypeIcons[type as keyof typeof eventTypeIcons]}
            <span className="ml-1">{type}</span>
          </Button>
        ))}
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Ceremonial Events</CardTitle>
          <CardDescription>
            Upcoming ceremonies and cultural events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : !filteredEvents.length ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                Add ceremonial events to build your cultural calendar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {eventTypeIcons[event.ceremony_type as keyof typeof eventTypeIcons]}
                      <div>
                        <h3 className="font-semibold">{event.ceremony_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.event_date ? format(parseISO(event.event_date), 'MMMM d, yyyy') : 'Date TBD'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{event.ceremony_type}</Badge>
                  </div>
                  
                  <p className="text-sm mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.cultural_significance && (
                    <div className="mt-3 p-3 bg-muted/20 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Cultural Significance:</span> {event.cultural_significance}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};