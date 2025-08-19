import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Flag,
  MessageSquare,
  FileText,
  User
} from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'post' | 'comment' | 'user' | 'poll';
  content: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_at: string;
  flags_count: number;
  ai_confidence: number;
}

export const ContentModerationQueue: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadModerationQueue();
  }, [filter]);

  const loadModerationQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('*')
        .eq('status', filter)
        .order('priority', { ascending: false })
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load moderation queue"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: `Item ${action}d successfully`
      });
    } catch (error) {
      console.error('Error moderating item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to moderate item"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'comment': return MessageSquare;
      case 'user': return User;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Content Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              <div className="space-y-4">
                {items.map(item => {
                  const TypeIcon = getTypeIcon(item.type);
                  
                  return (
                    <Card key={item.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <TypeIcon className="h-4 w-4" />
                              <Badge variant={getPriorityColor(item.priority) as any}>
                                {item.priority} priority
                              </Badge>
                              <Badge variant="outline">
                                {item.type}
                              </Badge>
                              {item.flags_count > 0 && (
                                <Badge variant="destructive">
                                  {item.flags_count} flags
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm mb-2 line-clamp-3">
                              {item.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Author: {item.author}</span>
                              <span>Submitted: {new Date(item.submitted_at).toLocaleDateString()}</span>
                              <span>AI Confidence: {Math.round(item.ai_confidence * 100)}%</span>
                            </div>
                          </div>

                          {filter === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModeration(item.id, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleModeration(item.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {items.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No items in {filter} queue</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};