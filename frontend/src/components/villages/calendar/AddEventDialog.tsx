import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTraditionalEvent } from '@/hooks/useTraditionalCalendar';
import { supabase } from '@/integrations/supabase/client';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageId: string;
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({ 
  open, 
  onOpenChange, 
  villageId 
}) => {
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: '',
    event_category: 'cultural',
    calendar_type: 'lunar',
    event_description: '',
    historical_significance: '',
    next_occurrence: '',
    duration_days: '1',
    community_involvement_level: 'high',
    visitor_policy: 'welcome',
    preservation_status: 'active',
    location_details: '',
    dress_code: '',
    organizer_contact: ''
  });

  const createEvent = useCreateTraditionalEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_name || !formData.event_type) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const eventData = {
      village_id: villageId,
      event_name: formData.event_name,
      event_type: formData.event_type,
      event_category: formData.event_category,
      calendar_type: formData.calendar_type,
      event_description: formData.event_description,
      historical_significance: formData.historical_significance || undefined,
      next_occurrence: formData.next_occurrence || undefined,
      duration_days: parseInt(formData.duration_days),
      community_involvement_level: formData.community_involvement_level,
      is_public_event: true,
      visitor_policy: formData.visitor_policy,
      preservation_status: formData.preservation_status,
      location_details: formData.location_details || undefined,
      dress_code: formData.dress_code || undefined,
      organizer_contact: formData.organizer_contact || undefined,
      occurs_annually: true,
      is_unesco_recognized: false,
      traditional_practices: [],
      required_preparations: [],
      participant_roles: {},
      ceremonial_items: [],
      traditional_foods: [],
      songs_and_dances: [],
      storytelling_elements: [],
      created_by: user.id,
    };

    createEvent.mutate(eventData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          event_name: '',
          event_type: '',
          event_category: 'cultural',
          calendar_type: 'lunar',
          event_description: '',
          historical_significance: '',
          next_occurrence: '',
          duration_days: '1',
          community_involvement_level: 'high',
          visitor_policy: 'welcome',
          preservation_status: 'active',
          location_details: '',
          dress_code: '',
          organizer_contact: ''
        });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Traditional Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name *</Label>
                <Input
                  id="event_name"
                  value={formData.event_name}
                  onChange={(e) => handleInputChange('event_name', e.target.value)}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harvest_festival">Harvest Festival</SelectItem>
                    <SelectItem value="planting_ceremony">Planting Ceremony</SelectItem>
                    <SelectItem value="cultural_festival">Cultural Festival</SelectItem>
                    <SelectItem value="religious_ceremony">Religious Ceremony</SelectItem>
                    <SelectItem value="ancestor_celebration">Ancestor Celebration</SelectItem>
                    <SelectItem value="market_day">Market Day</SelectItem>
                    <SelectItem value="seasonal_celebration">Seasonal Celebration</SelectItem>
                    <SelectItem value="coming_of_age">Coming of Age</SelectItem>
                    <SelectItem value="marriage_season">Marriage Season</SelectItem>
                    <SelectItem value="rain_ceremony">Rain Ceremony</SelectItem>
                    <SelectItem value="new_year">New Year</SelectItem>
                    <SelectItem value="traditional_sport">Traditional Sport</SelectItem>
                    <SelectItem value="storytelling_night">Storytelling Night</SelectItem>
                    <SelectItem value="craft_exhibition">Craft Exhibition</SelectItem>
                    <SelectItem value="healing_ceremony">Healing Ceremony</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_category">Category</Label>
                <Select value={formData.event_category} onValueChange={(value) => handleInputChange('event_category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="religious">Religious</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="economic">Economic</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar_type">Calendar Type</Label>
                <Select value={formData.calendar_type} onValueChange={(value) => handleInputChange('calendar_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunar">Lunar</SelectItem>
                    <SelectItem value="solar">Solar</SelectItem>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="islamic">Islamic</SelectItem>
                    <SelectItem value="traditional_local">Traditional Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', e.target.value)}
                  min="1"
                  max="30"
                />
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Description</h3>
            
            <div className="space-y-2">
              <Label htmlFor="event_description">Description *</Label>
              <Textarea
                id="event_description"
                value={formData.event_description}
                onChange={(e) => handleInputChange('event_description', e.target.value)}
                placeholder="Describe the traditional event, its purpose, and significance..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historical_significance">Historical Significance</Label>
              <Textarea
                id="historical_significance"
                value={formData.historical_significance}
                onChange={(e) => handleInputChange('historical_significance', e.target.value)}
                placeholder="Share the historical background and cultural importance..."
                rows={3}
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="next_occurrence">Next Occurrence</Label>
                <Input
                  id="next_occurrence"
                  type="date"
                  value={formData.next_occurrence}
                  onChange={(e) => handleInputChange('next_occurrence', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_details">Location Details</Label>
                <Input
                  id="location_details"
                  value={formData.location_details}
                  onChange={(e) => handleInputChange('location_details', e.target.value)}
                  placeholder="Where does the event take place?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="community_involvement_level">Community Involvement</Label>
                <Select value={formData.community_involvement_level} onValueChange={(value) => handleInputChange('community_involvement_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="entire_community">Entire Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitor_policy">Visitor Policy</Label>
                <Select value={formData.visitor_policy} onValueChange={(value) => handleInputChange('visitor_policy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="by_invitation">By Invitation</SelectItem>
                    <SelectItem value="elders_permission">Elders Permission</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dress_code">Dress Code</Label>
                <Input
                  id="dress_code"
                  value={formData.dress_code}
                  onChange={(e) => handleInputChange('dress_code', e.target.value)}
                  placeholder="Traditional attire requirements"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preservation_status">Preservation Status</Label>
                <Select value={formData.preservation_status} onValueChange={(value) => handleInputChange('preservation_status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="declining">Declining</SelectItem>
                    <SelectItem value="revived">Revived</SelectItem>
                    <SelectItem value="modernized">Modernized</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_contact">Organizer Contact</Label>
              <Input
                id="organizer_contact"
                value={formData.organizer_contact}
                onChange={(e) => handleInputChange('organizer_contact', e.target.value)}
                placeholder="Contact person for this event"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Adding...' : 'Add Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};