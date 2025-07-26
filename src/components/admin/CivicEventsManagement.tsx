import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Vote,
  AlertTriangle,
  Bell,
  Users,
  MapPin,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface CivicEvent {
  id: string;
  event_type: string;
  event_name: string;
  event_date: string;
  deadline_date?: string;
  priority_level: string;
  regions_affected: string[];
  boost_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const eventTypes = [
  { value: 'election', label: 'Election', icon: Vote },
  { value: 'voting_deadline', label: 'Voting Deadline', icon: Calendar },
  { value: 'public_hearing', label: 'Public Hearing', icon: Users },
  { value: 'emergency', label: 'Emergency Alert', icon: AlertTriangle }
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const CivicEventsManagement: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CivicEvent | null>(null);
  const [formData, setFormData] = useState({
    event_type: '',
    event_name: '',
    event_date: '',
    deadline_date: '',
    priority_level: 'medium',
    regions_affected: [] as string[],
    boost_multiplier: 1.0,
    is_active: true
  });

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    checkAdminRole();
    fetchEvents();
  }, []);

  const checkAdminRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_events_calendar')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load civic events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_name || !formData.event_date || !formData.event_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('civic_events_calendar')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { error } = await supabase
          .from('civic_events_calendar')
          .insert([formData]);

        if (error) throw error;
        toast.success('Event created successfully');
      }

      setShowCreateModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('civic_events_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('civic_events_calendar')
        .update({ is_active: !isActive })
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success(`Event ${!isActive ? 'activated' : 'deactivated'}`);
      fetchEvents();
    } catch (error) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleEdit = (event: CivicEvent) => {
    setEditingEvent(event);
    setFormData({
      event_type: event.event_type,
      event_name: event.event_name,
      event_date: event.event_date.split('T')[0],
      deadline_date: event.deadline_date ? event.deadline_date.split('T')[0] : '',
      priority_level: event.priority_level,
      regions_affected: event.regions_affected,
      boost_multiplier: event.boost_multiplier,
      is_active: event.is_active
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      event_type: '',
      event_name: '',
      event_date: '',
      deadline_date: '',
      priority_level: 'medium',
      regions_affected: [],
      boost_multiplier: 1.0,
      is_active: true
    });
    setEditingEvent(null);
  };

  const handleRegionToggle = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions_affected: prev.regions_affected.includes(region)
        ? prev.regions_affected.filter(r => r !== region)
        : [...prev.regions_affected, region]
    }));
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access civic events management. This feature is restricted to administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-sans text-xl font-semibold">
                <Calendar className="w-5 h-5" />
                Civic Events Management
              </CardTitle>
              <p className="text-sm text-muted-foreground font-sans mt-1">
                Manage civic events that boost content visibility and engagement
              </p>
            </div>
            
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="font-sans">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-sans">
                    {editingEvent ? 'Edit Civic Event' : 'Create New Civic Event'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_name" className="font-sans">Event Name *</Label>
                      <Input
                        id="event_name"
                        value={formData.event_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                        placeholder="Enter event name"
                        className="font-sans"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event_type" className="font-sans">Event Type *</Label>
                      <Select 
                        value={formData.event_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                <span className="font-sans">{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date" className="font-sans">Event Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                        className="font-sans"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="deadline_date" className="font-sans">Deadline Date</Label>
                      <Input
                        id="deadline_date"
                        type="date"
                        value={formData.deadline_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline_date: e.target.value }))}
                        className="font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority_level" className="font-sans">Priority Level</Label>
                      <Select 
                        value={formData.priority_level}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <span className="font-sans">{level.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="boost_multiplier" className="font-sans">Content Boost Multiplier</Label>
                      <Input
                        id="boost_multiplier"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.boost_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, boost_multiplier: parseFloat(e.target.value) }))}
                        className="font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-sans font-medium mb-3 block">Affected Regions</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                      {cameroonRegions.map((region) => (
                        <div key={region} className="flex items-center space-x-2">
                          <Switch
                            id={`region-${region}`}
                            checked={formData.regions_affected.includes(region)}
                            onCheckedChange={() => handleRegionToggle(region)}
                          />
                          <Label htmlFor={`region-${region}`} className="font-sans text-sm cursor-pointer">
                            {region}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active" className="font-sans">
                      Event is active (affects feed algorithm)
                    </Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateModal(false)}
                      className="font-sans"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" className="font-sans">
                      <Save className="w-4 h-4 mr-2" />
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="font-sans text-muted-foreground">Loading civic events...</p>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-sans font-semibold text-lg mb-2">No Civic Events</h3>
              <p className="font-sans text-muted-foreground mb-4">
                Create your first civic event to boost relevant content visibility.
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="font-sans">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const eventType = eventTypes.find(t => t.value === event.event_type);
            const priority = priorityLevels.find(p => p.value === event.priority_level);
            const EventIcon = eventType?.icon || Calendar;

            return (
              <Card key={event.id} className={`transition-all duration-200 ${event.is_active ? 'border-primary/20' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <EventIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-sans font-semibold text-lg">{event.event_name}</h3>
                        <Badge className={priority?.color}>
                          {priority?.label}
                        </Badge>
                        {event.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-sans">
                            <strong>Type:</strong> {eventType?.label}
                          </p>
                          <p className="font-sans">
                            <strong>Event Date:</strong> {format(new Date(event.event_date), 'PPP')}
                          </p>
                          {event.deadline_date && (
                            <p className="font-sans">
                              <strong>Deadline:</strong> {format(new Date(event.deadline_date), 'PPP')}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="font-sans">
                            <strong>Content Boost:</strong> {event.boost_multiplier}x
                          </p>
                          <p className="font-sans">
                            <strong>Regions:</strong> {event.regions_affected.length > 0 ? event.regions_affected.join(', ') : 'All regions'}
                          </p>
                          <p className="font-sans text-muted-foreground">
                            Created {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEventStatus(event.id, event.is_active)}
                        className="font-sans"
                      >
                        {event.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        className="font-sans"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-destructive hover:text-destructive font-sans"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};