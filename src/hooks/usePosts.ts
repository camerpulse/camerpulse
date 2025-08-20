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
        .from('pulse_posts')
        .select(`
          *,
          profiles!pulse_posts_user_id_fkey (
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
      
      const [likesResult, userLikesResult] = await Promise.all([
        // Get like counts
        supabase
          .from('pulse_post_likes')
          .select('post_id')
          .in('post_id', postIds),
        
        // Get current user's likes
        user ? supabase
          .from('pulse_post_likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id) : Promise.resolve({ data: [], error: null })
      ]);

      if (likesResult.error) throw likesResult.error;
      if (userLikesResult.error) throw userLikesResult.error;

      // Process like counts
      const likeCounts: Record<string, number> = {};
      likesResult.data?.forEach(like => {
        likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1;
      });

      // Process user likes
      const userLikes = new Set(userLikesResult.data?.map(like => like.post_id) || []);

      // For now, use the existing comment counts from the pulse_posts table
      // In future, we can add a separate comments table

      // Combine all data
      return posts?.map(post => ({
        ...post,
        content: DOMPurify.sanitize(post.content), // Sanitize content
        like_count: likeCounts[post.id] || 0,
        comment_count: post.comments_count || 0,
        share_count: 0, // Not implemented yet
        user_has_liked: userLikes.has(post.id),
        user_has_shared: false,
        user_has_bookmarked: false,
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
        .from('pulse_posts')
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          hashtags,
          location: data.location,
        })
        .select(`
          *,
          profiles!pulse_posts_user_id_fkey (
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
        .from('pulse_posts')
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