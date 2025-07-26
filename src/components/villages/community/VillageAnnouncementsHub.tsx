import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, Pin, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { useVillageAnnouncements } from '@/hooks/useVillageAnnouncements';
import { formatDistanceToNow } from 'date-fns';

interface VillageAnnouncementsHubProps {
  villageId: string;
}

const announcementTypes = [
  { value: 'general', label: 'General', icon: Megaphone },
  { value: 'urgent', label: 'Urgent', icon: AlertTriangle },
  { value: 'event', label: 'Event', icon: Calendar },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const VillageAnnouncementsHub: React.FC<VillageAnnouncementsHubProps> = ({ villageId }) => {
  const { announcements, loading, createAnnouncement, incrementViews } = useVillageAnnouncements(villageId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'normal',
    expires_at: '',
  });

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      return;
    }

    const success = await createAnnouncement({
      ...newAnnouncement,
      expires_at: newAnnouncement.expires_at || null,
    });

    if (success) {
      setNewAnnouncement({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        expires_at: '',
      });
      setIsCreateOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const TypeIcon = announcementTypes.find(t => t.value === type)?.icon || Megaphone;
    return <TypeIcon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Village Announcements ({announcements.length})</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Announcement title..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={newAnnouncement.announcement_type} 
                      onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, announcement_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {announcementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newAnnouncement.priority} 
                      onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Expiry Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={newAnnouncement.expires_at}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expires_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="What would you like to announce?"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateAnnouncement} className="flex-1">
                    Create Announcement
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet. Be the first to share news!</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                announcement.is_pinned ? 'border-primary' : ''
              }`}
              onClick={() => incrementViews(announcement.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {announcement.is_pinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        {getTypeIcon(announcement.announcement_type)}
                        <h3 className="font-semibold text-sm">{announcement.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    </div>
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {priorities.find(p => p.value === announcement.priority)?.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{announcement.views_count}</span>
                      </span>
                      {announcement.expires_at && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {formatDistanceToNow(new Date(announcement.expires_at), { addSuffix: true })}</span>
                        </span>
                      )}
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};