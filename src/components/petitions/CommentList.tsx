import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

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

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading
}) => {
  if (loading) {
    return (
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
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
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
  );
};