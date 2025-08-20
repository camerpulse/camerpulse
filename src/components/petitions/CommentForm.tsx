import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface CommentFormProps {
  petitionId: string;
  onCommentAdded: (comment: any) => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  petitionId,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

      onCommentAdded(newCommentObj);

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

  if (!user) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please log in to leave a comment
      </div>
    );
  }

  return (
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
  );
};