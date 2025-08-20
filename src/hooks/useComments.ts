import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    verified?: boolean;
  };
  
  // Nested replies
  replies?: Comment[];
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

const COMMENTS_QUERY_KEY = 'comments';

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: [COMMENTS_QUERY_KEY, postId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Sanitize comment content
      const sanitizedComments = comments?.map(comment => ({
        ...comment,
        content: DOMPurify.sanitize(comment.content),
      })) || [];

      // Build nested structure (parent comments with replies)
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      sanitizedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: build parent-child relationships
      sanitizedComments.forEach(comment => {
        const commentObj = commentMap.get(comment.id)!;
        
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentObj);
          }
        } else {
          rootComments.push(commentObj);
        }
      });

      return rootComments;
    },
    enabled: !!postId,
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateComment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      if (!user) throw new Error('Authentication required');

      // Sanitize content
      const sanitizedContent = DOMPurify.sanitize(data.content);

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          post_id: data.post_id,
          user_id: user.id,
          content: sanitizedContent,
          parent_comment_id: data.parent_comment_id || null,
        })
        .select(`
          *,
          profiles!comments_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .single();

      if (error) throw error;
      return comment;
    },
    onSuccess: (newComment, variables) => {
      // Invalidate comments query to refetch with new comment
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, variables.post_id] });
      
      // Update post comment count in posts cache
      queryClient.setQueryData(['posts', 20, 0, user?.id], (oldData: any[] | undefined) => {
        return oldData?.map(post => 
          post.id === variables.post_id 
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        ) || [];
      });

      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateComment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content, postId }: { commentId: string, content: string, postId: string }) => {
      if (!user) throw new Error('Authentication required');

      // Sanitize content
      const sanitizedContent = DOMPurify.sanitize(content);

      const { data: comment, error } = await supabase
        .from('comments')
        .update({ 
          content: sanitizedContent,
          is_edited: true,
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only edit their own comments
        .select(`
          *,
          profiles!comments_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .single();

      if (error) throw error;
      return { comment, postId };
    },
    onSuccess: ({ postId }) => {
      // Refetch comments to show updated content
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });

      toast({
        title: "Comment updated!",
        description: "Your comment has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update comment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteComment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string, postId: string }) => {
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      // Refetch comments to remove deleted comment
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });
      
      // Update post comment count in posts cache
      queryClient.setQueryData(['posts', 20, 0, user?.id], (oldData: any[] | undefined) => {
        return oldData?.map(post => 
          post.id === postId 
            ? { ...post, comment_count: Math.max(0, (post.comment_count || 0) - 1) }
            : post
        ) || [];
      });

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};