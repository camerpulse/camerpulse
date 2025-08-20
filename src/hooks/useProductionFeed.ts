import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'dompurify';

const PAGE_SIZE = 10;

export interface ProductionFeedItem {
  id: string;
  type: 'pulse_post' | 'event' | 'policy' | 'alert' | 'discussion';
  title?: string;
  content: string;
  author: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    verified?: boolean;
  };
  created_at: string;
  updated_at: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    user_has_liked: boolean;
    user_has_shared: boolean;
    user_has_bookmarked?: boolean;
    user_has_pulsed?: boolean;
  };
  metadata?: {
    location?: string;
    hashtags?: string[];
    media_urls?: string[];
    event_date?: string;
    venue_name?: string;
    venue_address?: string;
    policy_status?: string;
    severity?: string;
    regions?: string[];
    alert_type?: string;
    category?: string;
  };
  original_id: string; // The actual ID from the source table
}

export const useProductionFeed = () => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['production-feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;
      const feedItems: ProductionFeedItem[] = [];

      try {
        // Fetch pulse posts with proper error handling
        const { data: posts, error: postsError } = await supabase
          .from('pulse_posts')
          .select(`
            *,
            profiles!pulse_posts_user_id_fkey (
              id, username, display_name, avatar_url, verified
            )
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + Math.floor(PAGE_SIZE * 0.6) - 1);

        if (postsError) {
          console.error('Error fetching posts:', postsError);
        }

        // Fetch events with proper error handling
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            profiles!events_organizer_id_fkey (
              id, username, display_name, avatar_url, verified
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(0, Math.floor(PAGE_SIZE * 0.3) - 1);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        }

        // Fetch policy updates with proper error handling
        const { data: policies, error: policiesError } = await supabase
          .from('policy_tracker')
          .select('*')
          .order('updated_at', { ascending: false })
          .range(0, Math.floor(PAGE_SIZE * 0.1) - 1);

        if (policiesError) {
          console.error('Error fetching policies:', policiesError);
        }

        // Get interaction data for posts if we have any
        let interactionData: any = { 
          likes: [], 
          userLikes: [], 
          userBookmarks: [], 
          userReposts: [],
          comments: []
        };
        
        if (posts && posts.length > 0) {
          const postIds = posts.map(p => p.id);
          
          const [likes, userLikes, userBookmarks, userReposts, comments] = await Promise.all([
            // All likes
            supabase
              .from('pulse_post_likes')
              .select('post_id')
              .in('post_id', postIds),
            // User's likes
            user ? supabase
              .from('pulse_post_likes')
              .select('post_id')
              .in('post_id', postIds)
              .eq('user_id', user.id) : Promise.resolve({ data: [] }),
            // User's bookmarks
            user ? supabase
              .from('pulse_post_bookmarks')
              .select('post_id')
              .in('post_id', postIds)
              .eq('user_id', user.id) : Promise.resolve({ data: [] }),
            // User's reposts
            user ? supabase
              .from('pulse_post_reposts')
              .select('original_post_id')
              .in('original_post_id', postIds)
              .eq('user_id', user.id) : Promise.resolve({ data: [] }),
            // Comments count (if table exists)
            supabase
              .from('pulse_post_comments')
              .select('post_id')
              .in('post_id', postIds)
              .then(result => result)
              .catch(() => ({ data: [] })) // Fallback if table doesn't exist
          ]);
          
          interactionData = { 
            likes: likes.data || [], 
            userLikes: userLikes.data || [],
            userBookmarks: userBookmarks.data || [],
            userReposts: userReposts.data || [],
            comments: comments.data || []
          };
        }

        // Process interaction counts
        const likeCounts: Record<string, number> = {};
        const commentCounts: Record<string, number> = {};
        
        interactionData.likes.forEach((like: any) => {
          likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1;
        });
        
        interactionData.comments.forEach((comment: any) => {
          commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
        });

        const userLikes = new Set(interactionData.userLikes.map((like: any) => like.post_id));
        const userBookmarks = new Set(interactionData.userBookmarks.map((bookmark: any) => bookmark.post_id));
        const userReposts = new Set(interactionData.userReposts.map((repost: any) => repost.original_post_id));

        // Process posts
        if (posts) {
          posts.forEach(post => {
            feedItems.push({
              id: `pulse_post-${post.id}`,
              original_id: post.id,
              type: 'pulse_post',
              content: DOMPurify.sanitize(post.content || ''),
              author: {
                id: post.user_id,
                username: post.profiles?.username,
                display_name: post.profiles?.display_name,
                avatar_url: post.profiles?.avatar_url,
                verified: post.profiles?.verified || false,
              },
              created_at: post.created_at,
              updated_at: post.updated_at,
              engagement: {
                likes: likeCounts[post.id] || 0,
                comments: commentCounts[post.id] || 0,
                shares: 0,
                user_has_liked: userLikes.has(post.id),
                user_has_shared: false,
                user_has_bookmarked: userBookmarks.has(post.id),
                user_has_pulsed: userReposts.has(post.id),
              },
              metadata: {
                hashtags: post.hashtags || [],
                location: post.location,
              },
            });
          });
        }

        // Process events
        if (events) {
          events.forEach(event => {
            feedItems.push({
              id: `event-${event.id}`,
              original_id: event.id,
              type: 'event',
              title: event.title,
              content: DOMPurify.sanitize(event.description || ''),
              author: {
                id: event.organizer_id,
                username: event.profiles?.username,
                display_name: event.profiles?.display_name || 'Event Organizer',
                avatar_url: event.profiles?.avatar_url,
                verified: event.profiles?.verified || false,
              },
              created_at: event.created_at,
              updated_at: event.updated_at,
              engagement: {
                likes: 0,
                comments: 0,
                shares: 0,
                user_has_liked: false,
                user_has_shared: false,
              },
              metadata: {
                event_date: event.event_date,
                venue_name: event.venue_name,
                venue_address: event.venue_address,
                category: event.category,
              },
            });
          });
        }

        // Process policies
        if (policies) {
          policies.forEach(policy => {
            feedItems.push({
              id: `policy-${policy.id}`,
              original_id: policy.id,
              type: 'policy',
              title: policy.policy_title,
              content: DOMPurify.sanitize(policy.policy_summary || ''),
              author: {
                id: 'system',
                display_name: policy.initiator_name || 'Government',
                verified: true,
              },
              created_at: policy.created_at,
              updated_at: policy.updated_at,
              engagement: {
                likes: 0,
                comments: 0,
                shares: 0,
                user_has_liked: false,
                user_has_shared: false,
              },
              metadata: {
                policy_status: policy.status,
                regions: policy.affected_regions || [],
              },
            });
          });
        }

        // Sort all items by creation date
        feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          items: feedItems.slice(0, PAGE_SIZE),
          hasMore: feedItems.length === PAGE_SIZE,
          nextPage: feedItems.length === PAGE_SIZE ? pageParam + 1 : undefined
        };

      } catch (error) {
        console.error('Feed fetch error:', error);
        return {
          items: [],
          hasMore: false,
          nextPage: undefined
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};