import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  MapPin,
  Clock,
  Users,
  Plus,
  Star,
  Award,
  Building,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EventCard } from './EventCard';
import { CreateEventDialog } from './CreateEventDialog';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek as getWeekStart,
  endOfWeek as getWeekEnd,
  parseISO,
  isAfter,
  isBefore
} from 'date-fns';
import { toast } from 'sonner';

interface CivicEvent {
  id: string;
  name: string;
  description: string;
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
  created_by?: string;
  rsvp_count?: number;
}

interface EventFilters {
  region?: string;
  event_type?: string;
  organizer_type?: string;
  civic_tags?: string[];
  verified_only?: boolean;
  official_only?: boolean;
}

type CalendarView = 'month' | 'week' | 'agenda';

const EVENT_TYPE_COLORS = {
  civic: 'bg-emerald-500',
  political: 'bg-blue-500',
  education: 'bg-purple-500',
  protest: 'bg-red-500',
  music: 'bg-pink-500',
  business: 'bg-orange-500',
  youth: 'bg-cyan-500',
  community: 'bg-green-500',
  government: 'bg-indigo-500',
  religious: 'bg-yellow-500'
};

const CIVIC_HOLIDAYS = [
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'national' },
  { date: '2024-02-11', name: 'Youth Day', type: 'national' },
  { date: '2024-05-01', name: 'Labour Day', type: 'national' },
  { date: '2024-05-20', name: 'National Day', type: 'national' },
  { date: '2024-08-15', name: 'Assumption', type: 'national' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'national' }
];

export const EventCalendar: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMobileEventList, setShowMobileEventList] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on view
      let startDate: Date, endDate: Date;
      
      if (view === 'month') {
        startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      } else if (view === 'week') {
        startDate = getWeekStart(currentDate, { weekStartsOn: 1 });
        endDate = getWeekEnd(currentDate, { weekStartsOn: 1 });
      } else {
        // Agenda view - next 30 days
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }

      let query = supabase
        .from('civic_events')
        .select(`
          *,
          event_rsvps(count)
        `)
        .eq('status', 'published')
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString());

      // Apply filters
      if (filters.region) {
        query = query.eq('region', filters.region);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type as any);
      }
      if (filters.organizer_type) {
        query = query.eq('organizer_type', filters.organizer_type as any);
      }
      if (filters.verified_only) {
        query = query.eq('organizer_verified', true);
      }
      if (filters.official_only) {
        query = query.eq('is_civic_official', true);
      }

      const { data, error } = await query.order('start_date', { ascending: true });

      if (error) throw error;

      const eventsWithRsvpCount = data?.map(event => ({
        ...event,
        rsvp_count: event.event_rsvps?.[0]?.count || 0
      })) || [];

      setEvents(eventsWithRsvpCount);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_date), date)
    );
  };

  const getHolidayForDate = (date: Date) => {
    return CIVIC_HOLIDAYS.find(holiday => 
      isSameDay(parseISO(holiday.date), date)
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const holiday = getHolidayForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] p-1 border border-border cursor-pointer transition-all hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isDayToday && "bg-primary/10 border-primary",
                dayEvents.length > 0 && "bg-accent/30"
              )}
              onClick={() => {
                setSelectedDate(day);
                if (window.innerWidth < 768) {
                  setShowMobileEventList(true);
                }
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isDayToday && "text-primary font-bold",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {holiday && (
                  <Flag className="w-3 h-3 text-red-500" />
                )}
              </div>
              
              {holiday && (
                <div className="text-xs text-red-600 font-medium mb-1 truncate">
                  {holiday.name}
                </div>
              )}
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded text-white truncate",
                      EVENT_TYPE_COLORS[event.event_type as keyof typeof EVENT_TYPE_COLORS] || "bg-gray-500"
                    )}
                    title={event.name}
                  >
                    {event.is_civic_official && <Star className="w-2 h-2 inline mr-1" />}
                    {event.name}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate, { weekStartsOn: 1 });
    const weekEnd = getWeekEnd(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const holiday = getHolidayForDate(day);
          const isDayToday = isToday(day);
          
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={cn(
                "text-center p-2 rounded-lg",
                isDayToday && "bg-primary text-primary-foreground"
              )}>
                <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
                {holiday && (
                  <div className="text-xs text-red-600 font-medium">
                    {holiday.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <Card 
                    key={event.id} 
                    className="p-2 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full inline-block mr-2",
                      EVENT_TYPE_COLORS[event.event_type as keyof typeof EVENT_TYPE_COLORS] || "bg-gray-500"
                    )}></div>
                    <span className="text-sm font-medium">{event.name}</span>
                    {event.is_civic_official && <Star className="w-3 h-3 inline ml-1 text-yellow-500" />}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(event.start_date), 'HH:mm')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAgendaView = () => {
    const groupedEvents = events.reduce((acc, event) => {
      const dateKey = format(parseISO(event.start_date), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CivicEvent[]>);

    return (
      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
          const date = parseISO(dateKey);
          const holiday = getHolidayForDate(date);
          
          return (
            <Card key={dateKey}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                    {isToday(date) && <Badge className="ml-2">Today</Badge>}
                  </CardTitle>
                  {holiday && (
                    <Badge variant="destructive" className="text-xs">
                      <Flag className="w-3 h-3 mr-1" />
                      {holiday.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvpUpdate={fetchEvents}
                    variant="list"
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateHoliday = selectedDate ? getHolidayForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              disabled={view === 'agenda'}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold min-w-[200px] text-center">
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
              {view === 'week' && `Week of ${format(getWeekStart(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
              {view === 'agenda' && 'Upcoming Events'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              disabled={view === 'agenda'}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            disabled={view === 'agenda'}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="w-fit">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {user && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'agenda' && renderAgendaView()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Desktop Event Details Sidebar */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Events for {format(selectedDate, 'MMMM d, yyyy')}
                {selectedDateHoliday && (
                  <Badge variant="destructive">
                    <Flag className="w-3 h-3 mr-1" />
                    {selectedDateHoliday.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvpUpdate={fetchEvents}
                    variant="list"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Event List Dialog */}
      <Dialog open={showMobileEventList} onOpenChange={setShowMobileEventList}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              {selectedDateHoliday && (
                <Badge variant="destructive" className="ml-2">
                  <Flag className="w-3 h-3 mr-1" />
                  {selectedDateHoliday.name}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvpUpdate={fetchEvents}
                    variant="list"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No events on this date
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};