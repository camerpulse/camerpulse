import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  Video, 
  MapPin, 
  Clock,
  ExternalLink,
  Mic,
  MessageSquare,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TownhallEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'town_hall' | 'summit' | 'roundtable';
  scheduled_date: string;
  duration_minutes: number;
  platform: string;
  meeting_link?: string;
  organizer_name: string;
  max_participants: number;
  current_participants: number;
  registration_required: boolean;
  agenda: string[];
  regions_focus: string[];
  topics: string[];
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface VirtualTownHallsProps {
  profile?: any;
}

export const VirtualTownHalls = ({ profile }: VirtualTownHallsProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'my-events' | 'create'>('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'town_hall' as const,
    scheduled_date: '',
    duration_minutes: 120,
    platform: 'zoom',
    regions_focus: [] as string[],
    topics: [] as string[]
  });

  // Mock data - replace with actual API calls
  const mockTownhalls: TownhallEvent[] = [
    {
      id: '1',
      title: 'Diaspora Investment Opportunities 2024',
      description: 'Join us to discuss new investment opportunities in education and infrastructure sectors across Cameroon.',
      event_type: 'summit',
      scheduled_date: '2024-02-15T19:00:00Z',
      duration_minutes: 180,
      platform: 'zoom',
      meeting_link: 'https://zoom.us/j/123456789',
      organizer_name: 'CamerPulse Investment Team',
      max_participants: 1000,
      current_participants: 247,
      registration_required: true,
      agenda: ['Opening Remarks', 'Investment Portfolio Review', 'New Project Presentations', 'Q&A Session'],
      regions_focus: ['All Regions'],
      topics: ['Education', 'Infrastructure', 'Technology'],
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Northwest Region Development Update',
      description: 'Quarterly update on development projects in the Northwest region with opportunity for diaspora Q&A.',
      event_type: 'town_hall',
      scheduled_date: '2024-02-20T15:00:00Z',
      duration_minutes: 120,
      platform: 'teams',
      organizer_name: 'Northwest Regional Council',
      max_participants: 500,
      current_participants: 89,
      registration_required: true,
      agenda: ['Regional Progress Report', 'Diaspora Contributions Update', 'Community Questions'],
      regions_focus: ['Northwest'],
      topics: ['Regional Development', 'Community Projects'],
      status: 'scheduled'
    }
  ];

  const handleRegister = (eventId: string) => {
    setRegisteredEvents([...registeredEvents, eventId]);
    toast({
      title: "Registration Successful",
      description: "You've been registered for the event. You'll receive joining details via email.",
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.scheduled_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and date for your event.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Event Created",
      description: "Your virtual town hall has been submitted for approval.",
    });

    // Reset form
    setNewEvent({
      title: '',
      description: '',
      event_type: 'town_hall',
      scheduled_date: '',
      duration_minutes: 120,
      platform: 'zoom',
      regions_focus: [],
      topics: []
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'summit': return 'bg-purple-100 text-purple-800';
      case 'roundtable': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Virtual Town Halls</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow Cameroonians worldwide through virtual events, summits, and community discussions
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedTab === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('upcoming')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Upcoming Events
        </Button>
        <Button
          variant={selectedTab === 'my-events' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('my-events')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          My Events
        </Button>
        {profile && (
          <Button
            variant={selectedTab === 'create' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('create')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockTownhalls.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.scheduled_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{event.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.current_participants}/{event.max_participants}</span>
                  </div>
                </div>

                {event.regions_focus.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Focus Regions: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.regions_focus.map((region, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {event.topics.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Topics: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {event.agenda.length > 0 && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">Agenda:</span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {event.agenda.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  {event.status === 'scheduled' && !registeredEvents.includes(event.id) && (
                    <Button 
                      onClick={() => handleRegister(event.id)}
                      className="flex items-center gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Register
                    </Button>
                  )}
                  {registeredEvents.includes(event.id) && (
                    <Button disabled className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Registered
                    </Button>
                  )}
                  {event.meeting_link && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Join Meeting
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'my-events' && (
        <Card>
          <CardHeader>
            <CardTitle>My Registered Events</CardTitle>
            <CardDescription>
              Events you've registered for and your participation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registeredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No registered events yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTab('upcoming')}
                  className="mt-4"
                >
                  Browse Upcoming Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mockTownhalls
                  .filter(event => registeredEvents.includes(event.id))
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(event.scheduled_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        {event.meeting_link && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'create' && profile && (
        <Card>
          <CardHeader>
            <CardTitle>Create Virtual Event</CardTitle>
            <CardDescription>
              Organize a town hall, summit, or roundtable for the diaspora community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select 
                  value={newEvent.event_type} 
                  onValueChange={(value: any) => setNewEvent({...newEvent, event_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="town_hall">Town Hall</SelectItem>
                    <SelectItem value="summit">Summit</SelectItem>
                    <SelectItem value="roundtable">Roundtable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your event and its objectives"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.scheduled_date}
                  onChange={(e) => setNewEvent({...newEvent, scheduled_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newEvent.duration_minutes}
                  onChange={(e) => setNewEvent({...newEvent, duration_minutes: parseInt(e.target.value) || 120})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select 
                  value={newEvent.platform} 
                  onValueChange={(value) => setNewEvent({...newEvent, platform: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateEvent} className="w-full">
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};