import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Loader2,
  Send 
} from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  className?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  postId, 
  className = '' 
}) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: comments = [], isLoading, error } = useComments(postId);
  const createCommentMutation = useCreateComment();

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    createCommentMutation.mutate(
      {
        post_id: postId,
        content: newComment.trim(),
      },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !user) return;

    createCommentMutation.mutate(
      {
        post_id: postId,
        content: replyContent.trim(),
        parent_comment_id: parentCommentId,
      },
      {
        onSuccess: () => {
          setReplyContent('');
          setReplyingTo(null);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'comment' | 'reply', parentId?: string) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (action === 'comment') {
        handleSubmitComment();
      } else if (parentId) {
        handleSubmitReply(parentId);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-muted-foreground text-sm">Failed to load comments</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comments List */}
      <ScrollArea className="max-h-96">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="border-l-2 border-l-primary/20">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.display_name?.charAt(0) || 
                         comment.user?.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {comment.user?.display_name || comment.user?.username || 'Anonymous'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at))} ago
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-muted-foreground hover:text-red-500"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-muted-foreground hover:text-blue-500"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          <span className="text-xs">Reply</span>
                        </Button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && user && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'reply', comment.id)}
                            placeholder={`Reply to ${comment.user?.display_name || comment.user?.username}...`}
                            className="min-h-[60px] text-sm"
                            maxLength={500}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {replyContent.length}/500
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                disabled={!replyContent.trim() || createCommentMutation.isPending}
                                onClick={() => handleSubmitReply(comment.id)}
                              >
                                {createCommentMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 mt-3 space-y-3 border-l border-muted pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {reply.user?.display_name?.charAt(0) || 
                                   reply.user?.username?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-medium">
                                    {reply.user?.display_name || reply.user?.username || 'Anonymous'}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.created_at))} ago
                                  </span>
                                </div>
                                <p className="text-xs text-foreground whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* New Comment Input */}
      {user ? (
        <div className="space-y-3 border-t pt-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xs">
                {profile?.display_name?.charAt(0) || 
                 profile?.username?.charAt(0) || 
                 user?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'comment')}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/500 • Press Cmd/Ctrl + Enter to submit
                </span>
                <Button
                  size="sm"
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  onClick={handleSubmitComment}
                >
                  {createCommentMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 border-t">
          <p className="text-muted-foreground text-sm mb-2">Sign in to join the conversation</p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};