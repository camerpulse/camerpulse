import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
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
  Mountain,
  Waves,
  TreePine,
  Zap
} from 'lucide-react';

interface CeremonialEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  event_type: string;
  cultural_group: string;
  location: string;
  region: string;
  significance: string;
  preparations_needed: string[];
  traditional_items: string[];
  participation_requirements: string;
  is_annual: boolean;
  is_lunar_based: boolean;
  contact_person: string;
  contact_info: string;
  created_at: string;
  status: string;
}

export const CeremonialCalendar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    event_type: '',
    cultural_group: '',
    location: '',
    region: '',
    significance: '',
    preparations_needed: [''],
    traditional_items: [''],
    participation_requirements: '',
    is_annual: true,
    is_lunar_based: false,
    contact_person: '',
    contact_info: '',
    status: 'confirmed'
  });

  // Fetch ceremonial events
  const { data: events, isLoading } = useQuery({
    queryKey: ['ceremonial_events', currentMonth],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('ceremonial_events')
        .select('*')
        .gte('event_date', start.toISOString())
        .lte('event_date', end.toISOString())
        .order('event_date');
      
      if (error) throw error;
      return data as CeremonialEvent[];
    },
  });

  // Save event mutation
  const saveEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { error } = await supabase
        .from('ceremonial_events')
        .insert({
          ...eventData,
          preparations_needed: eventData.preparations_needed.filter((p: string) => p.trim()),
          traditional_items: eventData.traditional_items.filter((i: string) => i.trim()),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceremonial_events'] });
      toast({
        title: "Event added",
        description: "Ceremonial event has been added to the calendar.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      event_type: '',
      cultural_group: '',
      location: '',
      region: '',
      significance: '',
      preparations_needed: [''],
      traditional_items: [''],
      participation_requirements: '',
      is_annual: true,
      is_lunar_based: false,
      contact_person: '',
      contact_info: '',
      status: 'confirmed'
    });
  };

  const addPreparation = () => {
    setNewEvent(prev => ({
      ...prev,
      preparations_needed: [...prev.preparations_needed, '']
    }));
  };

  const removePreparation = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      preparations_needed: prev.preparations_needed.filter((_, i) => i !== index)
    }));
  };

  const updatePreparation = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      preparations_needed: prev.preparations_needed.map((prep, i) => i === index ? value : prep)
    }));
  };

  const addTraditionalItem = () => {
    setNewEvent(prev => ({
      ...prev,
      traditional_items: [...prev.traditional_items, '']
    }));
  };

  const removeTraditionalItem = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      traditional_items: prev.traditional_items.filter((_, i) => i !== index)
    }));
  };

  const updateTraditionalItem = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      traditional_items: prev.traditional_items.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.event_date || !newEvent.event_type) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title, date, and event type.",
        variant: "destructive",
      });
      return;
    }

    saveEventMutation.mutate(newEvent);
  };

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

  const culturalGroups = [
    'Bamileke', 'Duala', 'Ewondo', 'Bassa', 'Fulani', 'Bamoun', 
    'Bakweri', 'Gbaya', 'Sara', 'Kotoko', 'Tikar', 'Maka',
    'Bulu', 'Fang', 'Hausa', 'Kanuri', 'Massa', 'Tupuri',
    'Multi-ethnic', 'Other'
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const getEventsForDate = (date: Date) => {
    return events?.filter(event => 
      isSameDay(parseISO(event.event_date), date)
    ) || [];
  };

  const filteredEvents = events?.filter(event => 
    filterType === 'all' || event.event_type === filterType
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
        
        <div className="flex items-center gap-2">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Ceremonial Event</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Annual Ngondo Festival"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select
                      value={newEvent.event_type}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}
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

                {/* Date and Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="end_date">End Date (if multi-day)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
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

                {/* Cultural Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cultural_group">Cultural Group</Label>
                    <Select
                      value={newEvent.cultural_group}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, cultural_group: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cultural group" />
                      </SelectTrigger>
                      <SelectContent>
                        {culturalGroups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={newEvent.region}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {cameroonRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Significance */}
                <div className="space-y-2">
                  <Label htmlFor="significance">Cultural Significance</Label>
                  <Textarea
                    id="significance"
                    value={newEvent.significance}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, significance: e.target.value }))}
                    placeholder="Explain the cultural, spiritual, or historical significance of this ceremony..."
                    rows={3}
                  />
                </div>

                {/* Preparations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Preparations Needed</Label>
                    <Button onClick={addPreparation} variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newEvent.preparations_needed.map((prep, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={prep}
                          onChange={(e) => updatePreparation(index, e.target.value)}
                          placeholder={`Preparation ${index + 1}`}
                        />
                        {newEvent.preparations_needed.length > 1 && (
                          <Button
                            onClick={() => removePreparation(index)}
                            variant="outline"
                            size="sm"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traditional Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Traditional Items Required</Label>
                    <Button onClick={addTraditionalItem} variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newEvent.traditional_items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateTraditionalItem(index, e.target.value)}
                          placeholder={`Traditional item ${index + 1}`}
                        />
                        {newEvent.traditional_items.length > 1 && (
                          <Button
                            onClick={() => removeTraditionalItem(index)}
                            variant="outline"
                            size="sm"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="participation_requirements">Participation Requirements</Label>
                    <Textarea
                      id="participation_requirements"
                      value={newEvent.participation_requirements}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, participation_requirements: e.target.value }))}
                      placeholder="Who can participate, any age restrictions, dress code, etc..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={newEvent.contact_person}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, contact_person: e.target.value }))}
                        placeholder="Event organizer or contact"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_info">Contact Information</Label>
                      <Input
                        id="contact_info"
                        value={newEvent.contact_info}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, contact_info: e.target.value }))}
                        placeholder="Phone number or email"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEvent}
                    disabled={saveEventMutation.isPending}
                  >
                    {saveEventMutation.isPending ? 'Saving...' : 'Add Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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

      {/* Calendar or List View */}
      {viewType === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  Events on {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No events scheduled for this date
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {eventTypeIcons[event.event_type as keyof typeof eventTypeIcons]}
                          <h4 className="font-semibold">{event.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{event.cultural_group}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {event.event_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ceremonial Events</CardTitle>
            <CardDescription>
              Chronological list of upcoming ceremonies and cultural events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                        {eventTypeIcons[event.event_type as keyof typeof eventTypeIcons]}
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(event.event_date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{event.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{event.cultural_group}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Region:</span> {event.region}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span> {event.contact_person}
                      </div>
                    </div>

                    {event.significance && (
                      <div className="mt-3 p-3 bg-muted/20 rounded">
                        <p className="text-sm">
                          <span className="font-medium">Cultural Significance:</span> {event.significance}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};