import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface CivicEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  deadline_date: string | null;
  regions_affected: string[] | null;
  boost_multiplier: number | null;
  priority_level: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function CivicEventsManager() {
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CivicEvent | null>(null);

  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'election',
    event_date: '',
    deadline_date: '',
    regions_affected: [] as string[],
    boost_multiplier: 1.0,
    priority_level: 'medium',
    is_active: true
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('civic_events_calendar')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to fetch civic events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        event_name: formData.event_name,
        event_type: formData.event_type,
        event_date: formData.event_date,
        deadline_date: formData.deadline_date || null,
        regions_affected: formData.regions_affected.length > 0 ? formData.regions_affected : null,
        boost_multiplier: formData.boost_multiplier,
        priority_level: formData.priority_level,
        is_active: formData.is_active
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('civic_events_calendar')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('civic_events_calendar')
          .insert([eventData]);
        
        if (error) throw error;
        toast.success('Event created successfully');
      }

      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(`Failed to ${editingEvent ? 'update' : 'create'} event: ${error.message}`);
    }
  };

  const handleEdit = (event: CivicEvent) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.event_name,
      event_type: event.event_type,
      event_date: event.event_date,
      deadline_date: event.deadline_date || '',
      regions_affected: event.regions_affected || [],
      boost_multiplier: event.boost_multiplier || 1.0,
      priority_level: event.priority_level || 'medium',
      is_active: event.is_active ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this civic event?')) return;

    try {
      const { error } = await supabase
        .from('civic_events_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      toast.error(`Failed to delete event: ${error.message}`);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('civic_events_calendar')
        .update({ is_active: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event status updated');
      fetchEvents();
    } catch (error: any) {
      toast.error(`Failed to update event status: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_type: 'election',
      event_date: '',
      deadline_date: '',
      regions_affected: [],
      boost_multiplier: 1.0,
      priority_level: 'medium',
      is_active: true
    });
  };

  const handleRegionsChange = (regions: string) => {
    const regionArray = regions.split(',').map(r => r.trim()).filter(r => r.length > 0);
    setFormData(prev => ({ ...prev, regions_affected: regionArray }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Civic Events Calendar</h2>
          <p className="text-muted-foreground">
            Manage civic events that boost content relevance and engagement
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Event' : 'Create New Civic Event'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Event Name</label>
                  <Input
                    value={formData.event_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                    placeholder="Presidential Election 2024"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="election">Election</option>
                    <option value="referendum">Referendum</option>
                    <option value="policy_announcement">Policy Announcement</option>
                    <option value="public_hearing">Public Hearing</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Event Date</label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Deadline Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Boost Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    value={formData.boost_multiplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, boost_multiplier: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Priority Level</label>
                  <select
                    value={formData.priority_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority_level: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Affected Regions (comma-separated)</label>
                <Input
                  value={formData.regions_affected.join(', ')}
                  onChange={(e) => handleRegionsChange(e.target.value)}
                  placeholder="Centre, Littoral, West"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium">Active</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{event.event_name}</h3>
                    <Badge variant={event.is_active ? 'default' : 'secondary'}>
                      {event.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{event.event_type}</Badge>
                    {event.priority_level && (
                      <Badge variant={
                        event.priority_level === 'critical' ? 'destructive' :
                        event.priority_level === 'high' ? 'default' : 'secondary'
                      }>
                        {event.priority_level}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                    {event.deadline_date && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Deadline: {new Date(event.deadline_date).toLocaleDateString()}
                      </div>
                    )}
                    {event.boost_multiplier && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Boost: {event.boost_multiplier}x
                      </div>
                    )}
                  </div>

                  {event.regions_affected && event.regions_affected.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div className="flex gap-1">
                        {event.regions_affected.map((region, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEventStatus(event.id, event.is_active)}
                  >
                    <Switch checked={event.is_active ?? false} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && !loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No civic events found. Create your first event to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}