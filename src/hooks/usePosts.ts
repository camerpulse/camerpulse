import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: 'pulse' | 'poll' | 'announcement' | 'civic_update';
  media_urls?: string[];
  hashtags?: string[];
  location?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  is_pinned: boolean;
  is_trending: boolean;
  engagement_score: number;
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
  
  // Interaction counts
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  user_has_liked?: boolean;
  user_has_shared?: boolean;
  user_has_bookmarked?: boolean;
}

export interface CreatePostData {
  content: string;
  type?: 'pulse' | 'poll' | 'announcement' | 'civic_update';
  media_urls?: string[];
  location?: string;
}

const POSTS_QUERY_KEY = 'posts';

export const usePosts = (limit = 20, offset = 0) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [POSTS_QUERY_KEY, limit, offset, user?.id],
    queryFn: async () => {
      const query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: posts, error } = await query;

      if (error) throw error;

      // Get interaction counts and user interactions in parallel
      const postIds = posts?.map(p => p.id) || [];
      
      const [interactionsResult, userInteractionsResult] = await Promise.all([
        // Get interaction counts
        supabase
          .from('post_interactions')
          .select('post_id, interaction_type')
          .in('post_id', postIds),
        
        // Get current user's interactions
        user ? supabase
          .from('post_interactions')
          .select('post_id, interaction_type')
          .in('post_id', postIds)
          .eq('user_id', user.id) : Promise.resolve({ data: [], error: null })
      ]);

      if (interactionsResult.error) throw interactionsResult.error;
      if (userInteractionsResult.error) throw userInteractionsResult.error;

      // Process interaction counts
      const interactionCounts: Record<string, Record<string, number>> = {};
      interactionsResult.data?.forEach(interaction => {
        if (!interactionCounts[interaction.post_id]) {
          interactionCounts[interaction.post_id] = {};
        }
        interactionCounts[interaction.post_id][interaction.interaction_type] = 
          (interactionCounts[interaction.post_id][interaction.interaction_type] || 0) + 1;
      });

      // Process user interactions
      const userInteractions: Record<string, Set<string>> = {};
      userInteractionsResult.data?.forEach(interaction => {
        if (!userInteractions[interaction.post_id]) {
          userInteractions[interaction.post_id] = new Set();
        }
        userInteractions[interaction.post_id].add(interaction.interaction_type);
      });

      // Get comment counts
      const { data: commentCounts, error: commentError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentError) throw commentError;

      const commentCountMap: Record<string, number> = {};
      commentCounts?.forEach(comment => {
        commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
      });

      // Combine all data
      return posts?.map(post => ({
        ...post,
        content: DOMPurify.sanitize(post.content), // Sanitize content
        like_count: interactionCounts[post.id]?.like || 0,
        comment_count: commentCountMap[post.id] || 0,
        share_count: interactionCounts[post.id]?.share || 0,
        user_has_liked: userInteractions[post.id]?.has('like') || false,
        user_has_shared: userInteractions[post.id]?.has('share') || false,
        user_has_bookmarked: userInteractions[post.id]?.has('bookmark') || false,
      })) as Post[];
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useCreatePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      if (!user) throw new Error('Authentication required');

      // Sanitize content
      const sanitizedContent = DOMPurify.sanitize(data.content);
      
      // Extract hashtags
      const hashtags = sanitizedContent.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [];

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          type: data.type || 'pulse',
          media_urls: data.media_urls || [],
          hashtags,
          location: data.location,
          sentiment: 'neutral',
        })
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: (newPost) => {
      // Optimistically add to cache
      queryClient.setQueryData([POSTS_QUERY_KEY, 20, 0, user?.id], (oldData: Post[] | undefined) => {
        return oldData ? [{ ...newPost, like_count: 0, comment_count: 0, share_count: 0 }, ...oldData] : [newPost];
      });

      toast({
        title: "Post created!",
        description: "Your civic voice has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure user can only delete their own posts

      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.setQueryData([POSTS_QUERY_KEY, 20, 0, user?.id], (oldData: Post[] | undefined) => {
        return oldData?.filter(post => post.id !== postId) || [];
      });

      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete post",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};