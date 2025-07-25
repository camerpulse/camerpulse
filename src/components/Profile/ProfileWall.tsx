import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  MapPin,
  Globe,
  Lock,
  Users,
  Send,
  Smile,
  Bookmark,
  Flag,
  Eye,
  ThumbsUp,
  Repeat2,
  Grid3X3
} from 'lucide-react';

interface ProfileWallProps {
  profile: any;
  isOwnProfile: boolean;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  privacy_level?: string;
  created_at: string;
  user_id: string;
  profiles?: any;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  location?: string;
  hashtags?: string[];
  mentions?: string[];
}

export const ProfileWall: React.FC<ProfileWallProps> = ({
  profile,
  isOwnProfile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [profile.user_id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts on this user's wall
      const { data: postsData, error } = await supabase
        .from('pulse_posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .or(`user_id.eq.${profile.user_id},wall_user_id.eq.${profile.user_id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isPosting) return;

    try {
      setIsPosting(true);
      
      const { data, error } = await supabase
        .from('pulse_posts')
        .insert({
          user_id: user?.id,
          wall_user_id: isOwnProfile ? user?.id : profile.user_id,
          content: newPostContent,
          privacy_level: 'public'
        })
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            verified
          )
        `)
        .single();

      if (error) throw error;

      // Add new post to the beginning of the list
      setPosts(prev => [data, ...prev]);
      setNewPostContent('');
      
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    // TODO: Implement like functionality when database table is available
    console.log('Like functionality will be implemented when pulse_post_likes table exists');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post (for logged in users on any profile) */}
      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {getInitials(user.user_metadata?.display_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={isOwnProfile ? "What's on your mind?" : `Write something on ${profile.display_name || profile.username}'s wall...`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] border-none resize-none focus:ring-0 p-0"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4 mr-2" />
                      Feeling
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || isPosting}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(post.profiles?.display_name || post.profiles?.username || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {post.profiles?.display_name || post.profiles?.username}
                        </span>
                        {post.profiles?.verified && (
                          <Badge variant="secondary" className="h-4 px-1">✓</Badge>
                        )}
                        {post.user_id !== profile.user_id && (
                          <span className="text-muted-foreground text-sm">
                            → {profile.display_name || profile.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTimeAgo(post.created_at)}</span>
                        {post.privacy_level === 'public' && <Globe className="h-3 w-3" />}
                        {post.privacy_level === 'friends' && <Users className="h-3 w-3" />}
                        {post.privacy_level === 'private' && <Lock className="h-3 w-3" />}
                        {post.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.map((tag, index) => (
                        <span key={index} className="text-primary text-sm hover:underline cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Media */}
                {post.image_url && (
                  <div className="mb-3">
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                  </div>
                )}

                {post.video_url && (
                  <div className="mb-3">
                    <video 
                      src={post.video_url} 
                      controls 
                      className="w-full rounded-lg max-h-96"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.is_liked || false)}
                      className={post.is_liked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
                      {post.likes_count}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {post.comments_count}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Repeat2 className="h-4 w-4 mr-2" />
                      {post.shares_count}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p>
                {isOwnProfile 
                  ? "Share your first post to get started!" 
                  : `${profile.display_name || profile.username} hasn't posted anything yet.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};