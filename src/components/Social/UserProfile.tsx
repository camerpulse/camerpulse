import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from './FollowButton';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  Heart,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  is_diaspora: boolean;
  verified: boolean;
  created_at: string;
}

interface FollowStats {
  followers_count: number;
  following_count: number;
}

interface PulsePost {
  id: string;
  content: string;
  sentiment_label?: string;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers_count: 0, following_count: 0 });
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
      fetchFollowStats();
      fetchUserPosts();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil utilisateur",
        variant: "destructive"
      });
    }
  };

  const fetchFollowStats = async () => {
    try {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId)
      ]);

      setFollowStats({
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_posts')
        .select('id, content, sentiment_label, hashtags, likes_count, comments_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
          >
            ✕
          </Button>
          
          {profile && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{profile.display_name || profile.username}</h2>
                      {profile.verified && (
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          Vérifié
                        </Badge>
                      )}
                      {profile.is_diaspora && (
                        <Badge variant="outline" className="border-primary text-primary">
                          <Globe className="w-3 h-3 mr-1" />
                          Diaspora
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Rejoint {formatDistanceToNow(new Date(profile.created_at), { locale: fr })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{followStats.followers_count}</span>
                      <span className="text-muted-foreground">abonnés</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{followStats.following_count}</span>
                      <span className="text-muted-foreground">abonnements</span>
                    </div>
                  </div>
                </div>
                
                <FollowButton 
                  targetUserId={userId} 
                  targetUsername={profile.username}
                  variant="default"
                />
              </div>
              
              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-96">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Publications</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="space-y-4 mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune publication</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-foreground mb-2">{post.content}</p>
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {post.sentiment_label && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSentimentColor(post.sentiment_label)}`}
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {post.sentiment_label}
                            </Badge>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(post.created_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Activité récente à venir</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};