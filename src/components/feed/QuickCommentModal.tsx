import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send } from 'lucide-react';

interface QuickCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postAuthor?: string;
  postPreview?: string;
}

export const QuickCommentModal: React.FC<QuickCommentModalProps> = ({
  open,
  onOpenChange,
  postId,
  postAuthor,
  postPreview,
}) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const { data: comments, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment();

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    createCommentMutation.mutate({
      post_id: postId,
      content: newComment.trim(),
    }, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          {postPreview && (
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <p className="font-medium">{postAuthor}</p>
              <p className="line-clamp-2">{postPreview}</p>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Comments List */}
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-8 w-8 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback>
                        {comment.user?.display_name?.charAt(0) || 
                         comment.user?.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user?.display_name || comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at))} ago
                        </span>
                      </div>
                      
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </ScrollArea>
          
          {/* Comment Input */}
          {user ? (
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.display_name?.charAt(0) || 
                     profile?.username?.charAt(0) || 
                     user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${
                      newComment.length > 450 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {newComment.length}/500
                    </span>
                    
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                      size="sm"
                    >
                      {createCommentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to post
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to join the conversation
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'} 
                variant="outline" 
                size="sm"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};