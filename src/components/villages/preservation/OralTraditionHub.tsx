import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic, Video, Play, Pause, Clock, User, Eye, Heart, Plus } from 'lucide-react';
import { useOralTraditions, type OralTradition } from '@/hooks/useOralTraditions';
import { useToast } from '@/hooks/use-toast';

interface OralTraditionHubProps {
  villageId: string;
}

export const OralTraditionHub: React.FC<OralTraditionHubProps> = ({ villageId }) => {
  const { traditions, loading, submitTradition } = useOralTraditions(villageId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tradition_type: 'story' as const,
    language: 'French',
    elder_name: '',
    elder_age: '',
    cultural_significance: '',
    preservation_priority: 'medium' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTradition({
        ...formData,
        elder_age: formData.elder_age ? parseInt(formData.elder_age) : undefined,
        is_public: true,
        verification_status: "pending"
      });
      setShowAddDialog(false);
      setFormData({
        title: '',
        description: '',
        tradition_type: 'story',
        language: 'French',
        elder_name: '',
        elder_age: '',
        cultural_significance: '',
        preservation_priority: 'medium',
      });
    } catch (error) {
      console.error('Error submitting tradition:', error);
    }
  };

  const getTraditionIcon = (type: string) => {
    switch (type) {
      case 'song': return '🎵';
      case 'prayer': return '🙏';
      case 'proverb': return '💭';
      case 'history': return '📜';
      default: return '📖';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredTraditions = traditions.filter(tradition => {
    if (activeTab === 'all') return true;
    return tradition.tradition_type === activeTab;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cm-green">Oral Traditions</h2>
          <p className="text-muted-foreground">
            Preserve and share the village's oral heritage through audio and video recordings
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cm-green hover:bg-cm-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Record Tradition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Oral Tradition</DialogTitle>
              <DialogDescription>
                Capture and preserve a piece of your village's oral heritage
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter tradition title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradition_type">Type *</Label>
                  <Select
                    value={formData.tradition_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, tradition_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="song">Song</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="proverb">Proverb</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this oral tradition..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="e.g., Bamileke, Ewondo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preservation_priority">Priority</Label>
                  <Select
                    value={formData.preservation_priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, preservation_priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="elder_name">Elder's Name</Label>
                  <Input
                    id="elder_name"
                    value={formData.elder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, elder_name: e.target.value }))}
                    placeholder="Name of the elder sharing this tradition"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elder_age">Elder's Age</Label>
                  <Input
                    id="elder_age"
                    type="number"
                    value={formData.elder_age}
                    onChange={(e) => setFormData(prev => ({ ...prev, elder_age: e.target.value }))}
                    placeholder="Age of the elder"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={formData.cultural_significance}
                  onChange={(e) => setFormData(prev => ({ ...prev, cultural_significance: e.target.value }))}
                  placeholder="Explain the cultural importance of this tradition..."
                  rows={3}
                />
              </div>

              {/* Recording Controls */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold">Recording</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? 'Stop Recording' : 'Start Audio Recording'}
                  </Button>
                  <Button type="button" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Video Recording
                  </Button>
                </div>
                {isRecording && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Recording in progress...
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cm-green hover:bg-cm-green/90">
                  Save Tradition
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="story">Stories</TabsTrigger>
          <TabsTrigger value="song">Songs</TabsTrigger>
          <TabsTrigger value="prayer">Prayers</TabsTrigger>
          <TabsTrigger value="proverb">Proverbs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredTraditions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-muted-foreground">
                  No oral traditions recorded yet. Be the first to preserve your village's heritage!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTraditions.map((tradition) => (
                <Card key={tradition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTraditionIcon(tradition.tradition_type)}</span>
                        <div>
                          <CardTitle className="text-lg">{tradition.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {tradition.language} • {tradition.tradition_type}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={tradition.preservation_priority === 'critical' ? 'destructive' : 'secondary'}>
                        {tradition.preservation_priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tradition.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tradition.description}
                      </p>
                    )}

                    {tradition.elder_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        <span>{tradition.elder_name}</span>
                        {tradition.elder_age && <span>({tradition.elder_age} years)</span>}
                      </div>
                    )}

                    {/* Audio/Video Controls */}
                    <div className="space-y-2">
                      {tradition.audio_url && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Audio
                          </Button>
                          {tradition.duration_seconds && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(tradition.duration_seconds)}
                            </span>
                          )}
                        </div>
                      )}
                      {tradition.video_url && (
                        <Button size="sm" variant="outline">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Button>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {tradition.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {tradition.likes_count}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tradition.verification_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};