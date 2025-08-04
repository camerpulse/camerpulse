import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOralTraditions } from '@/hooks/useOralTraditions';
import { 
  FileAudio, 
  Plus, 
  User,
  MapPin,
  Tag,
  Eye,
  Clock
} from 'lucide-react';

export const OralTraditionRecorder = () => {
  const villageId = 'default-village-id'; // This would come from context or props
  const { traditions, loading, submitTradition } = useOralTraditions(villageId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTradition, setNewTradition] = useState({
    title: '',
    description: '',
    category: '',
    language: 'French',
    narrator_name: '',
    village_location: '',
    cultural_significance: '',
    recording_type: 'story'
  });

  const categories = [
    'Folktales & Legends',
    'Historical Accounts',
    'Proverbs & Sayings',
    'Songs & Music',
    'Ceremonial Traditions',
    'Family Stories',
    'Agricultural Knowledge',
    'Healing Traditions',
    'Cultural Practices',
    'Language Lessons'
  ];

  const languages = [
    'French', 'English', 'Duala', 'Ewondo', 'Bulu', 'Bamoun', 'Fulfulde', 
    'Gbaya', 'Bassa', 'Bakweri', 'Limbum', 'Kom', 'Other'
  ];

  const resetForm = () => {
    setNewTradition({
      title: '',
      description: '',
      category: '',
      language: 'French',
      narrator_name: '',
      village_location: '',
      cultural_significance: '',
      recording_type: 'story'
    });
  };

  const handleSaveTradition = async () => {
    if (!newTradition.title || !newTradition.narrator_name) {
      return;
    }

    try {
      await submitTradition(newTradition);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileAudio className="h-6 w-6 mr-2 text-primary" />
            Oral Tradition Recorder
          </h2>
          <p className="text-muted-foreground">
            Preserve and share traditional stories, songs, and cultural knowledge
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tradition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Oral Tradition</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newTradition.title}
                    onChange={(e) => setNewTradition(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="e.g., The Legend of Lake Nyos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="narrator">Narrator Name *</Label>
                  <Input
                    id="narrator"
                    value={newTradition.narrator_name}
                    onChange={(e) => setNewTradition(prev => ({
                      ...prev,
                      narrator_name: e.target.value
                    }))}
                    placeholder="e.g., Elder Marie Ngozi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTradition.category}
                    onValueChange={(value) => setNewTradition(prev => ({
                      ...prev,
                      category: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={newTradition.language}
                    onValueChange={(value) => setNewTradition(prev => ({
                      ...prev,
                      language: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Village/Location</Label>
                <Input
                  id="location"
                  value={newTradition.village_location}
                  onChange={(e) => setNewTradition(prev => ({
                    ...prev,
                    village_location: e.target.value
                  }))}
                  placeholder="e.g., Bamenda, North West Region"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTradition.description}
                  onChange={(e) => setNewTradition(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Describe the story, its significance, and any cultural context..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={newTradition.cultural_significance}
                  onChange={(e) => setNewTradition(prev => ({
                    ...prev,
                    cultural_significance: e.target.value
                  }))}
                  placeholder="Explain the cultural meaning and importance of this tradition..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTradition}>
                  Add Tradition
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Traditions List */}
      <Card>
        <CardHeader>
          <CardTitle>Oral Traditions</CardTitle>
          <CardDescription>
            Preserved stories, songs, and cultural knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading traditions...</div>
          ) : !traditions?.length ? (
            <div className="text-center py-8">
              <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No traditions yet</h3>
              <p className="text-muted-foreground">
                Start preserving oral traditions by adding stories and cultural knowledge
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {traditions.map((tradition) => (
                <div key={tradition.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{tradition.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{tradition.elder_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Village Recording</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{tradition.views_count || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tradition.tradition_type && (
                        <Badge variant="outline">{tradition.tradition_type}</Badge>
                      )}
                      {tradition.language && (
                        <Badge variant="secondary">{tradition.language}</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm mb-3">{tradition.description}</p>

                  {tradition.cultural_significance && (
                    <div className="mt-3 p-3 bg-muted/20 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Cultural Significance:</span> {tradition.cultural_significance}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-muted-foreground">
                    Added {new Date(tradition.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};