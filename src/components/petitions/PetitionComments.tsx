import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: string;
  petition_id: string;
  user_id: string;
  commenter_name: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
  avatar_url?: string;
}

interface PetitionCommentsProps {
  petitionId: string;
}

export function PetitionComments({ petitionId }: PetitionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetchComments();
  }, [petitionId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('petition_comments')
        .select(`
          id,
          petition_id,
          user_id,
          comment_text,
          is_approved,
          created_at,
          profiles!petition_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('petition_id', petitionId)
        .eq('is_approved', true)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        petition_id: comment.petition_id,
        user_id: comment.user_id,
        commenter_name: comment.profiles?.display_name || 'Anonymous User',
        comment_text: comment.comment_text,
        is_approved: comment.is_approved,
        created_at: comment.created_at,
        avatar_url: comment.profiles?.avatar_url
      })) || [];
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('petition_comments')
        .insert({
          petition_id: petitionId,
          user_id: user.id,
          comment_text: newComment.trim()
        })
        .select(`
          id,
          petition_id,
          user_id,
          comment_text,
          is_approved,
          created_at,
          profiles!petition_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newCommentObj = {
        id: data.id,
        petition_id: data.petition_id,
        user_id: data.user_id,
        commenter_name: data.profiles?.display_name || 'Anonymous User',
        comment_text: data.comment_text,
        is_approved: data.is_approved,
        created_at: data.created_at,
        avatar_url: data.profiles?.avatar_url
      };

      setComments(prev => [newCommentObj, ...prev]);

      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully.",
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this petition..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Please log in to leave a comment
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  {comment.avatar_url && (
                    <AvatarImage src={comment.avatar_url} alt={comment.commenter_name} />
                  )}
                  <AvatarFallback>
                    {comment.commenter_name?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.commenter_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}