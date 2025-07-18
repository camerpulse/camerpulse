import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquareText, Plus, Eye, MessageCircle, Pin, Lock, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Discussion {
  id: string;
  title: string;
  description: string;
  category: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  last_activity_at: string;
  created_at: string;
  user_id: string;
}

interface VillageDiscussionsProps {
  villageId: string;
}

const categories = [
  { value: 'general', label: 'General Discussion' },
  { value: 'development', label: 'Development' },
  { value: 'events', label: 'Events' },
  { value: 'issues', label: 'Community Issues' },
  { value: 'suggestions', label: 'Suggestions' },
  { value: 'announcements', label: 'Announcements' },
];

export const VillageDiscussions: React.FC<VillageDiscussionsProps> = ({ villageId }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    category: 'general',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
  }, [villageId, selectedCategory]);

  const fetchDiscussions = async () => {
    try {
      let query = supabase
        .from('village_discussions')
        .select('*')
        .eq('village_id', villageId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a discussion",
        variant: "destructive",
      });
      return;
    }

    if (!newDiscussion.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your discussion",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('village_discussions')
        .insert([{
          village_id: villageId,
          user_id: user.id,
          title: newDiscussion.title.trim(),
          description: newDiscussion.description.trim(),
          category: newDiscussion.category,
        }]);

      if (error) throw error;

      setNewDiscussion({ title: '', description: '', category: 'general' });
      setIsCreateOpen(false);
      fetchDiscussions();
      toast({
        title: "Success",
        description: "Discussion created successfully",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
    }
  };

  const updateViews = async (discussionId: string) => {
    try {
      await supabase
        .from('village_discussions')
        .update({ views_count: discussions.find(d => d.id === discussionId)?.views_count + 1 || 1 })
        .eq('id', discussionId);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      development: 'bg-green-100 text-green-800',
      events: 'bg-purple-100 text-purple-800',
      issues: 'bg-red-100 text-red-800',
      suggestions: 'bg-yellow-100 text-yellow-800',
      announcements: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || colors.general;
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
            <MessageSquareText className="h-5 w-5" />
            <span>Discussions ({discussions.length})</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Discussion title..."
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={newDiscussion.category} 
                    onValueChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}
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
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Describe what you'd like to discuss..."
                    value={newDiscussion.description}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createDiscussion} className="flex-1">
                    Create Discussion
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquareText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No discussions yet. Start the conversation!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4" onClick={() => updateViews(discussion.id)}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {discussion.is_pinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        {discussion.is_locked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className="font-medium text-sm">{discussion.title}</h3>
                      </div>
                      {discussion.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {discussion.description}
                        </p>
                      )}
                    </div>
                    <Badge className={getCategoryColor(discussion.category)}>
                      {categories.find(c => c.value === discussion.category)?.label || discussion.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{discussion.views_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{discussion.replies_count}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(discussion.last_activity_at), { addSuffix: true })}
                      </span>
                    </div>
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