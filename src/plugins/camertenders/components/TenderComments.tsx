import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag, 
  MessageSquare,
  Send,
  Shield,
  User
} from 'lucide-react';

interface Comment {
  id: string;
  tender_id: string;
  user_id: string;
  comment_text: string;
  comment_type: string;
  parent_comment_id?: string;
  is_public: boolean;
  is_verified_bidder: boolean;
  upvotes: number;
  downvotes: number;
  flagged_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
    verified: boolean;
  };
  replies?: Comment[];
  user_vote?: 'upvote' | 'downvote' | null;
}

interface TenderCommentsProps {
  tenderId: string;
  readonly?: boolean;
}

export const TenderComments: React.FC<TenderCommentsProps> = ({ tenderId, readonly = false }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['tender_comments', tenderId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('tender_comments')
        .select(`
          *,
          profiles!inner(username, avatar_url, verified)
        `)
        .eq('tender_id', tenderId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('tender_comments')
            .select(`
              *,
              profiles!inner(username, avatar_url, verified)
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      return commentsWithReplies;
    },
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tender_comments')
        .insert({
          tender_id: tenderId,
          user_id: user.id,
          comment_text: text,
          comment_type: 'general',
          parent_comment_id: parentId || null,
          is_public: true,
          is_verified_bidder: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Comment posted successfully" });
      setNewComment('');
      setReplyText('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['tender_comments', tenderId] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to post comment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ commentId, voteType }: { commentId: string; voteType: 'upvote' | 'downvote' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('tender_comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          const { error } = await supabase
            .from('tender_comment_votes')
            .delete()
            .eq('id', existingVote.id);
          if (error) throw error;
        } else {
          // Update vote type
          const { error } = await supabase
            .from('tender_comment_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          if (error) throw error;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('tender_comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender_comments', tenderId] });
    }
  });

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      postCommentMutation.mutate({ text: newComment });
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyText.trim()) {
      postCommentMutation.mutate({ text: replyText, parentId });
    }
  };

  const handleVote = (commentId: string, voteType: 'upvote' | 'downvote') => {
    voteMutation.mutate({ commentId, voteType });
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">
                {comment.profiles?.username || 'Anonymous User'}
              </span>
              
              {comment.profiles?.verified && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              
              {comment.is_verified_bidder && (
                <Badge variant="outline" className="text-xs">
                  Bidder
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{comment.comment_text}</p>
            
            {!readonly && (
              <div className="flex items-center space-x-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(comment.id, 'upvote')}
                  className="p-1 h-6"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {comment.upvotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(comment.id, 'downvote')}
                  className="p-1 h-6"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  {comment.downvotes}
                </Button>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="p-1 h-6"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="p-1 h-6">
                  <Flag className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {replyTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyText.trim() || postCommentMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments?.length || 0})
        </h3>
      </div>

      {!readonly && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this tender..."
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Your comment will be visible to all users
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || postCommentMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet</p>
              {!readonly && (
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to share your thoughts about this tender
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};