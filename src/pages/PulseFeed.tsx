import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Layout/Header';
import { UserProfile } from '@/components/Social/UserProfile';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  TrendingUp,
  Globe,
  MapPin,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PulsePost {
  id: string;
  content: string;
  image_url?: string;
  sentiment_score?: number;
  sentiment_label?: 'positive' | 'negative' | 'neutral';
  hashtags?: string[];
  mentions?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user_id: string;
  user_profile?: {
    user_id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    is_diaspora: boolean;
    verified: boolean;
  };
  user_has_liked?: boolean;
}

const PulseFeed = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // First get the posts
      const { data: postsData, error: postsError } = await supabase
        .from('pulse_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get user profiles for the posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_diaspora, verified')
        .in('user_id', userIds);

      // Get likes for current user if authenticated
      const postIds = postsData.map(p => p.id);
      const { data: likesData } = user ? await supabase
        .from('pulse_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds) : { data: [] };

      const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);

      // Combine the data
      const postsWithProfiles: PulsePost[] = postsData.map((post: any) => {
        const userProfile = profilesData?.find(profile => profile.user_id === post.user_id);
        return {
          ...post,
          sentiment_label: post.sentiment_label as 'positive' | 'negative' | 'neutral' | undefined,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          user_profile: userProfile,
          user_has_liked: likedPostIds.has(post.id)
        };
      });

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    setPosting(true);
    try {
      // Simple sentiment analysis based on keywords
      const positiveWords = ['bien', 'bon', 'excellent', 'merci', 'bravo', 'félicitations', 'super', 'génial'];
      const negativeWords = ['mal', 'mauvais', 'terrible', 'nul', 'déçu', 'problème', 'erreur', 'échec'];
      
      const words = newPost.toLowerCase().split(' ');
      const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
      const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
      
      let sentiment_label: 'positive' | 'negative' | 'neutral' = 'neutral';
      let sentiment_score = 0;
      
      if (positiveCount > negativeCount) {
        sentiment_label = 'positive';
        sentiment_score = Math.min(0.8, 0.3 + (positiveCount * 0.1));
      } else if (negativeCount > positiveCount) {
        sentiment_label = 'negative';
        sentiment_score = Math.max(-0.8, -0.3 - (negativeCount * 0.1));
      }

      // Extract hashtags and mentions
      const hashtags = newPost.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [];
      const mentions = newPost.match(/@[a-zA-Z0-9_]+/g)?.map(mention => mention.slice(1)) || [];

      const { error } = await supabase
        .from('pulse_posts')
        .insert({
          user_id: user.id,
          content: newPost,
          sentiment_score,
          sentiment_label,
          hashtags,
          mentions
        });

      if (error) throw error;

      setNewPost('');
      fetchPosts();
      toast({
        title: "Pulse publié!",
        description: "Votre message a été partagé avec la communauté"
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier votre pulse",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (currentlyLiked) {
        await supabase
          .from('pulse_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('pulse_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...post,
              likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1,
              user_has_liked: !currentlyLiked
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <Badge variant="outline" className="border-green-500 text-green-600">Positif</Badge>;
      case 'negative': return <Badge variant="outline" className="border-red-500 text-red-600">Négatif</Badge>;
      default: return <Badge variant="outline" className="border-gray-400 text-gray-600">Neutre</Badge>;
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-cameroon flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Connexion requise</h2>
              <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder au Pulse Feed</p>
              <Button onClick={() => window.location.href = '/auth'}>Se connecter</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cameroon-primary mb-2">Pulse Feed</h1>
            <p className="text-gray-600">Partagez vos pensées avec la communauté camerounaise</p>
          </div>

          {/* Create Post */}
          <Card className="mb-8 border-cameroon-yellow/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary">
                    {profile?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.display_name}</p>
                  <p className="text-sm text-gray-500">@{profile?.username}</p>
                </div>
                {profile?.is_diaspora && (
                  <Badge variant="outline" className="border-cameroon-yellow text-cameroon-yellow">
                    🌍 Diaspora
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Que se passe-t-il au Cameroun? Partagez vos pensées... #CamerPulse"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="mb-4 min-h-[120px] border-cameroon-primary/20 focus:border-cameroon-primary"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{newPost.length}/500</span>
                <Button 
                  onClick={createPost}
                  disabled={!newPost.trim() || posting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {posting ? 'Publication...' : 'Publier'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun pulse pour le moment</h3>
                <p className="text-gray-600">Soyez le premier à partager vos pensées!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="border-cameroon-yellow/20 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="cursor-pointer" onClick={() => setSelectedUserId(post.user_id)}>
                        <AvatarImage src={post.user_profile?.avatar_url} />
                        <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary">
                          {post.user_profile?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => setSelectedUserId(post.user_id)}
                          >
                            {post.user_profile?.display_name || post.user_profile?.username || 'Utilisateur'}
                          </span>
                          <span className="text-gray-500">@{post.user_profile?.username || 'anonymous'}</span>
                          {post.user_profile?.verified && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">Vérifié</Badge>
                          )}
                          {post.user_profile?.is_diaspora && (
                            <Badge variant="outline" className="border-cameroon-yellow text-cameroon-yellow">
                              🌍
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(post.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                          {getSentimentBadge(post.sentiment_label)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-cameroon-primary/10 text-cameroon-primary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id, post.user_has_liked || false)}
                        className={`flex items-center gap-2 hover:bg-accent hover:text-accent-foreground ${
                          post.user_has_liked ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </Button>

                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count}
                      </Button>

                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        <Share2 className="w-4 h-4" />
                        {post.shares_count}
                      </Button>

                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${getSentimentColor(post.sentiment_label)}`} />
                        <span className={`text-sm ${getSentimentColor(post.sentiment_label)}`}>
                          {post.sentiment_score?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
};

export default PulseFeed;
