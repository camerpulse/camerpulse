import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'dompurify';

const PAGE_SIZE = 10;

export interface FeedItem {
  id: string;
  type: 'post' | 'event' | 'policy' | 'discussion' | 'alert';
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
  };
  metadata?: {
    location?: string;
    hashtags?: string[];
    media_urls?: string[];
    event_date?: string;
    policy_status?: string;
    severity?: string;
    regions?: string[];
  };
}

export const useComprehensiveFeed = () => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['comprehensive-feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;
      
      // Fetch posts
      const { data: posts } = await supabase
        .from('pulse_posts')
        .select(`
          *,
          profiles!pulse_posts_user_id_fkey (
            id, username, display_name, avatar_url, verified
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + Math.floor(PAGE_SIZE * 0.4) - 1);

      // Fetch events
      const { data: events } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            id, username, display_name, avatar_url, verified
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(0, Math.floor(PAGE_SIZE * 0.2) - 1);

      // Fetch policy updates
      const { data: policies } = await supabase
        .from('policy_tracker')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(0, Math.floor(PAGE_SIZE * 0.2) - 1);

      // Fetch alerts
      const { data: alerts } = await supabase
        .from('civic_fusion_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .range(0, Math.floor(PAGE_SIZE * 0.2) - 1);

      // Get all post IDs for interaction data
      const postIds = posts?.map(p => p.id) || [];
      
      // Get interaction data if we have posts
      let interactionData: any = { likes: [], userLikes: [] };
      if (postIds.length > 0) {
        const [likes, userLikes] = await Promise.all([
          supabase
            .from('pulse_post_likes')
            .select('post_id')
            .in('post_id', postIds),
          user ? supabase
            .from('pulse_post_likes')
            .select('post_id')
            .in('post_id', postIds)
            .eq('user_id', user.id) : Promise.resolve({ data: [] })
        ]);
        
        interactionData = { likes: likes.data || [], userLikes: userLikes.data || [] };
      }

      // Process like counts
      const likeCounts: Record<string, number> = {};
      interactionData.likes.forEach((like: any) => {
        likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1;
      });

      const userLikes = new Set(interactionData.userLikes.map((like: any) => like.post_id));

      // Convert all items to common FeedItem format
      const feedItems: FeedItem[] = [];

      // Add posts
      posts?.forEach(post => {
        feedItems.push({
          id: `post-${post.id}`,
          type: 'post',
          content: DOMPurify.sanitize(post.content),
          author: {
            id: post.user_id,
            username: post.profiles?.username,
            display_name: post.profiles?.display_name,
            avatar_url: post.profiles?.avatar_url,
            verified: post.profiles?.verified,
          },
          created_at: post.created_at,
          updated_at: post.updated_at,
          engagement: {
            likes: likeCounts[post.id] || 0,
            comments: post.comments_count || 0,
            shares: 0,
            user_has_liked: userLikes.has(post.id),
            user_has_shared: false,
          },
          metadata: {
            hashtags: post.hashtags,
            media_urls: post.media_urls,
            location: post.location,
          },
        });
      });

      // Add events
      events?.forEach(event => {
        feedItems.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          content: DOMPurify.sanitize(event.description || ''),
          author: {
            id: event.organizer_id,
            username: event.profiles?.username,
            display_name: event.profiles?.display_name || 'Event Organizer',
            avatar_url: event.profiles?.avatar_url,
            verified: event.profiles?.verified,
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
            location: event.venue_address,
          },
        });
      });

      // Add policy updates
      policies?.forEach(policy => {
        feedItems.push({
          id: `policy-${policy.id}`,
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
            regions: policy.affected_regions,
          },
        });
      });

      // Add alerts
      alerts?.forEach(alert => {
        feedItems.push({
          id: `alert-${alert.id}`,
          type: 'alert',
          title: alert.alert_title,
          content: DOMPurify.sanitize(alert.alert_message),
          author: {
            id: 'system',
            display_name: 'CamerPulse Alert System',
            verified: true,
          },
          created_at: alert.created_at,
          updated_at: alert.created_at,
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0,
            user_has_liked: false,
            user_has_shared: false,
          },
          metadata: {
            severity: alert.alert_severity,
            regions: alert.affected_regions,
          },
        });
      });

      // Sort all items by creation date
      feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        items: feedItems,
        hasMore: feedItems.length === PAGE_SIZE,
        nextPage: feedItems.length === PAGE_SIZE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};