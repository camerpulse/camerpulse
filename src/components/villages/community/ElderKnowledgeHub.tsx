import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Eye, Users, Mic, Video, Image, CheckCircle, Clock, Star } from 'lucide-react';
import { useElderKnowledge } from '@/hooks/useElderKnowledge';
import { formatDistanceToNow } from 'date-fns';

interface ElderKnowledgeHubProps {
  villageId: string;
}

const knowledgeTypes = [
  { value: 'oral_tradition', label: 'Oral Tradition', icon: Mic },
  { value: 'historical_account', label: 'Historical Account', icon: BookOpen },
  { value: 'cultural_practice', label: 'Cultural Practice', icon: Users },
  { value: 'folklore', label: 'Folklore', icon: Star },
  { value: 'practical_wisdom', label: 'Practical Wisdom', icon: BookOpen },
];

const categories = [
  { value: 'general', label: 'General Knowledge' },
  { value: 'medicine', label: 'Traditional Medicine' },
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'crafts', label: 'Traditional Crafts' },
  { value: 'ceremonies', label: 'Ceremonies & Rituals' },
  { value: 'stories', label: 'Stories & Legends' },
  { value: 'proverbs', label: 'Proverbs & Sayings' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-green-100 text-green-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const verificationStatus = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
  { value: 'needs_review', label: 'Needs Review', color: 'bg-orange-100 text-orange-800' },
];

export const ElderKnowledgeHub: React.FC<ElderKnowledgeHubProps> = ({ villageId }) => {
  const { knowledge, loading, submitKnowledge, incrementViews } = useElderKnowledge(villageId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({
    title: '',
    content: '',
    knowledge_type: 'oral_tradition',
    category: 'general',
    preservation_priority: 'medium',
    tags: '',
  });

  const handleSubmitKnowledge = async () => {
    if (!newKnowledge.title.trim() || !newKnowledge.content.trim()) {
      return;
    }

    const success = await submitKnowledge({
      ...newKnowledge,
      tags: newKnowledge.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });

    if (success) {
      setNewKnowledge({
        title: '',
        content: '',
        knowledge_type: 'oral_tradition',
        category: 'general',
        preservation_priority: 'medium',
        tags: '',
      });
      setIsCreateOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return verificationStatus.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const TypeIcon = knowledgeTypes.find(t => t.value === type)?.icon || BookOpen;
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
            <BookOpen className="h-5 w-5" />
            <span>Elder Knowledge ({knowledge.length})</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Share Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Elder Knowledge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Knowledge title..."
                    value={newKnowledge.title}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={newKnowledge.knowledge_type} 
                      onValueChange={(value) => setNewKnowledge({ ...newKnowledge, knowledge_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {knowledgeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={newKnowledge.category} 
                      onValueChange={(value) => setNewKnowledge({ ...newKnowledge, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Preservation Priority</label>
                  <Select 
                    value={newKnowledge.preservation_priority} 
                    onValueChange={(value) => setNewKnowledge({ ...newKnowledge, preservation_priority: value })}
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
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    placeholder="wisdom, tradition, medicine..."
                    value={newKnowledge.tags}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, tags: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Knowledge Content</label>
                  <Textarea
                    placeholder="Share the knowledge, story, or wisdom..."
                    value={newKnowledge.content}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSubmitKnowledge} className="flex-1">
                    Share Knowledge
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
        {knowledge.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No knowledge shared yet. Help preserve elder wisdom!</p>
          </div>
        ) : (
          knowledge.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => incrementViews(item.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.knowledge_type)}
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        {item.verification_status === 'verified' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(item.verification_status)}>
                        {verificationStatus.find(s => s.value === item.verification_status)?.label}
                      </Badge>
                      <Badge className={getPriorityColor(item.preservation_priority)}>
                        {priorities.find(p => p.value === item.preservation_priority)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views_count}</span>
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.value === item.category)?.label}
                      </Badge>
                      {item.audio_url && <Mic className="h-3 w-3" />}
                      {item.video_url && <Video className="h-3 w-3" />}
                      {item.images.length > 0 && <Image className="h-3 w-3" />}
                    </div>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
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