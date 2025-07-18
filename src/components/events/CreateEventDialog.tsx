import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MapPin, Users, Upload, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const EVENT_TYPES = [
  { value: 'civic', label: 'Civic Event' },
  { value: 'campaign', label: 'Campaign Event' },
  { value: 'education', label: 'Educational Event' },
  { value: 'protest', label: 'Protest/Rally' },
  { value: 'music', label: 'Music Event' },
  { value: 'business', label: 'Business Event' },
  { value: 'youth', label: 'Youth Event' },
  { value: 'community', label: 'Community Event' },
  { value: 'government', label: 'Government Event' },
  { value: 'religious', label: 'Religious Event' }
];

const ORGANIZER_TYPES = [
  { value: 'verified_user', label: 'Individual' },
  { value: 'government_institution', label: 'Government Institution' },
  { value: 'political_party', label: 'Political Party' },
  { value: 'company', label: 'Company' },
  { value: 'school', label: 'School/University' },
  { value: 'ngo', label: 'NGO' },
  { value: 'artist', label: 'Artist' },
  { value: 'event_organizer', label: 'Event Organizer' }
];

const CIVIC_TAGS = [
  'democracy', 'human_rights', 'education', 'healthcare', 'environment',
  'youth_development', 'womens_rights', 'transparency', 'accountability',
  'peace_building', 'economic_development', 'digital_inclusion'
];

export const CreateEventDialog = ({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    event_type: '',
    organizer_type: '',
    region: '',
    subregion: '',
    venue_name: '',
    venue_address: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    max_attendees: '',
    allow_rsvp: true,
    requires_approval: false,
    is_civic_official: false,
    cover_image_url: '',
    civic_tags: [] as string[],
    external_links: {} as Record<string, string>
  });

  const [newTag, setNewTag] = useState('');
  const [newLinkKey, setNewLinkKey] = useState('');
  const [newLinkValue, setNewLinkValue] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      event_type: '',
      organizer_type: '',
      region: '',
      subregion: '',
      venue_name: '',
      venue_address: '',
      start_date: null,
      end_date: null,
      max_attendees: '',
      allow_rsvp: true,
      requires_approval: false,
      is_civic_official: false,
      cover_image_url: '',
      civic_tags: [],
      external_links: {}
    });
  };

  const addCivicTag = (tag: string) => {
    if (tag && !formData.civic_tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        civic_tags: [...prev.civic_tags, tag]
      }));
    }
  };

  const removeCivicTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      civic_tags: prev.civic_tags.filter(t => t !== tag)
    }));
  };

  const addExternalLink = () => {
    if (newLinkKey && newLinkValue) {
      setFormData(prev => ({
        ...prev,
        external_links: {
          ...prev.external_links,
          [newLinkKey]: newLinkValue
        }
      }));
      setNewLinkKey('');
      setNewLinkValue('');
    }
  };

  const removeExternalLink = (key: string) => {
    setFormData(prev => {
      const { [key]: removed, ...rest } = prev.external_links;
      return { ...prev, external_links: rest };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an event');
      return;
    }

    if (!formData.name || !formData.event_type || !formData.organizer_type || 
        !formData.region || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        event_type: formData.event_type,
        organizer_type: formData.organizer_type,
        region: formData.region,
        subregion: formData.subregion || null,
        venue_name: formData.venue_name || null,
        venue_address: formData.venue_address || null,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date?.toISOString() || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        allow_rsvp: formData.allow_rsvp,
        requires_approval: formData.requires_approval,
        is_civic_official: formData.is_civic_official,
        cover_image_url: formData.cover_image_url || null,
        civic_tags: formData.civic_tags,
        external_links: formData.external_links,
        organizer_id: user.id,
        created_by: user.id,
        status: 'published'
      };

      const { error } = await supabase
        .from('civic_events')
        .insert([eventData]);

      if (error) throw error;

      toast.success('Event created successfully!');
      onEventCreated();
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Organize a civic event and engage your community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type *</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer_type">Organizer Type *</Label>
                  <Select
                    value={formData.organizer_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, organizer_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organizer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Brief description for event cards"
                    maxLength={120}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed event description"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subregion">Subregion/City</Label>
                  <Input
                    id="subregion"
                    value={formData.subregion}
                    onChange={(e) => setFormData(prev => ({ ...prev, subregion: e.target.value }))}
                    placeholder="Enter city or subregion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                    placeholder="Enter venue name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_address">Venue Address</Label>
                  <Input
                    id="venue_address"
                    value={formData.venue_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                    placeholder="Enter venue address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Maximum Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input
                    id="cover_image_url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow RSVPs</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow people to RSVP to your event
                    </div>
                  </div>
                  <Switch
                    checked={formData.allow_rsvp}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_rsvp: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <div className="text-sm text-muted-foreground">
                      Manually approve RSVPs before confirming
                    </div>
                  </div>
                  <Switch
                    checked={formData.requires_approval}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Official Civic Event</Label>
                    <div className="text-sm text-muted-foreground">
                      Mark as official government/institutional event
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_civic_official}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_civic_official: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Civic Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Civic Tags</CardTitle>
              <CardDescription>
                Add relevant civic tags to help categorize your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {CIVIC_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.civic_tags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => formData.civic_tags.includes(tag) ? removeCivicTag(tag) : addCivicTag(tag)}
                  >
                    {tag.replace('_', ' ')}
                  </Button>
                ))}
              </div>

              {formData.civic_tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Tags:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.civic_tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag.replace('_', ' ')}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeCivicTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};