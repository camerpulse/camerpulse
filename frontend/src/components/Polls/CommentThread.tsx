import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Heart, 
  ArrowUpDown, 
  Clock, 
  TrendingUp, 
  Shield,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  likes_count: number;
  user_id: string;
  is_moderated: boolean;
  moderation_reason?: string;
  user_liked?: boolean;
  profiles?: {
    display_name?: string;
  };
}

interface CommentThreadProps {
  pollId: string;
}

type SortOption = 'recent' | 'popular';

export function CommentThread({ pollId }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isAdmin, setIsAdmin] = useState(false);
  const [moderateComment, setModerateComment] = useState<Comment | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    fetchComments();
    checkAdminRole();
  }, [pollId, sortBy]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const fetchComments = async () => {
    const orderBy = sortBy === 'recent' ? 'created_at' : 'likes_count';
    const ascending = sortBy === 'recent' ? false : false;
    
    const { data, error } = await supabase
      .from('poll_comments')
      .select(`
        *,
        profiles!inner (display_name)
      `)
      .eq('poll_id', pollId)
      .order(orderBy, { ascending })
      .limit(50);

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    // Process comments and check if user liked them
    const processedComments = await Promise.all(
      (data || []).map(async (comment) => {
        let userLiked = false;
        
        if (user) {
          const { data: likeData } = await supabase
            .from('poll_comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id)
            .single();
          
          userLiked = !!likeData;
        }

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          is_edited: comment.is_edited || false,
          likes_count: comment.likes_count || 0,
          user_id: comment.user_id,
          is_moderated: comment.is_moderated || false,
          moderation_reason: comment.moderation_reason,
          user_liked: userLiked,
          profiles: comment.profiles
        } as Comment;
      })
    );

    setComments(processedComments);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment on polls.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('poll_comments')
      .insert({
        poll_id: pollId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewComment('');
      fetchComments();
      toast({
        title: "Comment Posted",
        description: "Your comment has been added successfully.",
      });
    }
    
    setLoading(false);
  };

  const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }

    if (currentlyLiked) {
      const { error } = await supabase
        .from('poll_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (!error) {
        fetchComments();
      }
    } else {
      const { error } = await supabase
        .from('poll_comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        });

      if (!error) {
        fetchComments();
      }
    }
  };

  const handleModerateComment = async () => {
    if (!moderateComment || !isAdmin) return;

    const { error } = await supabase
      .from('poll_comments')
      .update({
        is_moderated: true,
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
        moderation_reason: moderationReason || 'Content moderated by admin'
      })
      .eq('id', moderateComment.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to moderate comment.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Comment Moderated",
        description: "The comment has been hidden from view.",
      });
      fetchComments();
    }

    setModerateComment(null);
    setModerationReason('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('poll_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error", 
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Comment Deleted",
        description: "Your comment has been removed.",
      });
      fetchComments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by {sortBy === 'recent' ? 'Recent' : 'Popular'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('recent')}>
              <Clock className="h-4 w-4 mr-2" />
              Most Recent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('popular')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Most Liked
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comment Input */}
      {user ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts on this poll..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || loading}
                >
                  {loading ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Please log in to join the discussion.
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.profiles?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">
                        {comment.profiles?.display_name || 'Anonymous User'}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      {comment.is_edited && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">Edited</Badge>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
                        className="h-8 px-2"
                      >
                        <Heart 
                          className={`h-4 w-4 mr-1 ${
                            comment.user_liked ? 'fill-red-500 text-red-500' : ''
                          }`} 
                        />
                        {comment.likes_count}
                      </Button>
                      
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModerateComment(comment)}
                          className="h-8 px-2 text-orange-600 hover:text-orange-700"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Moderate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Moderation Dialog */}
      <AlertDialog open={!!moderateComment} onOpenChange={() => setModerateComment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Moderate Comment
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will hide the comment from public view. Please provide a reason for moderation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for moderation (optional)"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleModerateComment}>
              Moderate Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}