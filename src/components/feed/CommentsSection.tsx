import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Reply, 
  Edit3, 
  Trash2, 
  Flag,
  Send,
  Loader2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments';
import type { Comment } from '@/hooks/useComments';

interface CommentsSectionProps {
  postId: string;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, level = 0 }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const isOwnComment = user?.id === comment.user_id;
  const maxNestingLevel = 3; // Limit nesting depth

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    await createComment.mutateAsync({
      post_id: postId,
      content: replyContent,
      parent_comment_id: comment.id,
    });

    setReplyContent('');
    setIsReplying(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    await updateComment.mutateAsync({
      commentId: comment.id,
      content: editContent,
      postId,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate({ commentId: comment.id, postId });
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-6 pt-3 border-l border-border pl-3' : ''}`}>
      <div className="flex gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.display_name?.[0] || comment.profiles?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {comment.profiles?.display_name || comment.profiles?.username || 'Anonymous'}
            </span>
            {comment.profiles?.verified && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                ✓
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnComment && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Flag className="h-3 w-3 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEdit}
                  disabled={updateComment.isPending || !editContent.trim()}
                >
                  {updateComment.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground mb-2 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
              
              {user && level < maxNestingLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </>
          )}
          
          {isReplying && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={createComment.isPending || !replyContent.trim()}
                >
                  {createComment.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Render nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading, error } = useComments(postId);
  const createComment = useCreateComment();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    await createComment.mutateAsync({
      post_id: postId,
      content: newComment,
    });

    setNewComment('');
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-destructive">Failed to load comments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment composer */}
      {user && (
        <div className="flex gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] text-sm"
              placeholder="Write a comment..."
            />
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={createComment.isPending || !newComment.trim()}
              className="ml-auto block"
            >
              {createComment.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              <Send className="h-3 w-3 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      )}
      
      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {user ? 'Be the first to comment!' : 'No comments yet.'}
        </p>
      )}
    </div>
  );
};