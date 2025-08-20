import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'dompurify';
import type { Post } from './usePosts';

const PAGE_SIZE = 10;

export const useInfinitePosts = () => {
  console.log('[useInfinitePosts] Hook called');
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('[useInfinitePosts] Fetching page:', pageParam);
      const offset = pageParam * PAGE_SIZE;
      
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
        .range(offset, offset + PAGE_SIZE - 1);

      const { data: posts, error } = await query;
      if (error) {
        console.error('[useInfinitePosts] Query error:', error);
        throw error;
      }

      console.log('[useInfinitePosts] Fetched posts:', posts?.length || 0);
      if (!posts?.length) return { posts: [], hasMore: false };

      // Get interaction counts and user interactions in parallel
      const postIds = posts.map(p => p.id);
      
      const [interactionsResult, userInteractionsResult, commentCounts] = await Promise.all([
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
          .eq('user_id', user.id) : Promise.resolve({ data: [], error: null }),
          
        // Get comment counts
        supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds)
      ]);

      if (interactionsResult.error) throw interactionsResult.error;
      if (userInteractionsResult.error) throw userInteractionsResult.error;
      if (commentCounts.error) throw commentCounts.error;

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

      // Process comment counts
      const commentCountMap: Record<string, number> = {};
      commentCounts.data?.forEach(comment => {
        commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
      });

      // Combine all data
      const enrichedPosts = posts.map(post => ({
        ...post,
        content: DOMPurify.sanitize(post.content),
        like_count: interactionCounts[post.id]?.like || 0,
        comment_count: commentCountMap[post.id] || 0,
        share_count: interactionCounts[post.id]?.share || 0,
        user_has_liked: userInteractions[post.id]?.has('like') || false,
        user_has_shared: userInteractions[post.id]?.has('share') || false,
        user_has_bookmarked: userInteractions[post.id]?.has('bookmark') || false,
      })) as Post[];

      return {
        posts: enrichedPosts,
        hasMore: posts.length === PAGE_SIZE,
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};