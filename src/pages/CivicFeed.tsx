import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Search,
  Plus,
  TrendingUp,
  Vote,
  Users,
  Clock,
  MapPin,
  Star,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    type: 'user' | 'politician' | 'organization';
  };
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  location?: string;
  tags: string[];
}

interface Poll {
  id: string;
  question: string;
  options: Array<{ text: string; votes: number; percentage: number }>;
  totalVotes: number;
  endsAt: Date;
}

interface Suggestion {
  id: string;
  name: string;
  type: 'politician' | 'organization' | 'activist';
  followers: number;
  avatar: string;
  verified: boolean;
}

const CivicFeed = () => {
  const { toast } = useToast();
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [posts] = useState<Post[]>([
    {
      id: '1',
      content: 'Major infrastructure development announced for the Northwest region. This will create thousands of jobs and improve connectivity. What are your thoughts on this initiative? #Infrastructure #Development #NorthwestRegion',
      author: {
        name: 'Minister Paul Atanga Nji',
        username: 'paulatanganji',
        avatar: '/api/placeholder/40/40',
        verified: true,
        type: 'politician'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 234,
      comments: 45,
      shares: 28,
      liked: false,
      location: 'Bamenda, Northwest',
      tags: ['Infrastructure', 'Development', 'NorthwestRegion']
    },
    {
      id: '2',
      content: 'Citizens of Douala are reporting water shortages in several neighborhoods. We need immediate action from CAMWATER. This affects thousands of families. #WaterCrisis #Douala #PublicServices',
      author: {
        name: 'Marie Tchoungui',
        username: 'marietchoungui',
        avatar: '/api/placeholder/40/40',
        verified: false,
        type: 'user'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 156,
      comments: 67,
      shares: 89,
      liked: true,
      location: 'Douala, Littoral',
      tags: ['WaterCrisis', 'Douala', 'PublicServices']
    },
    {
      id: '3',
      content: 'Education budget allocation for 2024 shows 18% increase. This is a positive step towards improving our schools nationwide. We need to ensure proper implementation and monitoring. #Education #Budget2024',
      author: {
        name: 'Cameroon Education Watch',
        username: 'cameducationwatch',
        avatar: '/api/placeholder/40/40',
        verified: true,
        type: 'organization'
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 89,
      comments: 23,
      shares: 34,
      liked: false,
      tags: ['Education', 'Budget2024']
    }
  ]);

  const [currentPoll] = useState<Poll>({
    id: 'poll1',
    question: 'What should be the government\'s top priority for 2024?',
    options: [
      { text: 'Infrastructure Development', votes: 342, percentage: 45 },
      { text: 'Healthcare Improvement', votes: 234, percentage: 31 },
      { text: 'Education Reform', votes: 123, percentage: 16 },
      { text: 'Economic Growth', votes: 61, percentage: 8 }
    ],
    totalVotes: 760,
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      name: 'Paul Biya',
      type: 'politician',
      followers: 1200000,
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    {
      id: '2',
      name: 'Transparency International',
      type: 'organization',
      followers: 45000,
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    {
      id: '3',
      name: 'Joshua Osih',
      type: 'politician',
      followers: 89000,
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  ]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    toast({
      title: "Post shared!",
      description: "Your civic voice has been heard by the community.",
    });
    setNewPost('');
  };

  const handleLike = (postId: string) => {
    toast({
      title: "Post liked!",
      description: "You've engaged with this civic discussion.",
    });
  };

  const handlePollVote = (optionIndex: number) => {
    toast({
      title: "Vote recorded!",
      description: "Thank you for participating in this civic poll.",
    });
  };

  const handleFollow = (suggestionId: string) => {
    toast({
      title: "Following!",
      description: "You're now following this account.",
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">Civic Feed</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-foreground">Trending Topics</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Infrastructure', 'Education', 'Healthcare', 'Economy'].map((topic, i) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{topic}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 1000) + 100}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback>YU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="Share your civic thoughts..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Vote className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          onClick={handlePost}
                          disabled={!newPost.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Poll */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Vote className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Civic Poll</h3>
                    <Badge variant="outline" className="text-xs">
                      {currentPoll.totalVotes} votes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground font-medium">{currentPoll.question}</p>
                  <div className="space-y-3">
                    {currentPoll.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handlePollVote(index)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-foreground">{option.text}</span>
                          <span className="text-xs text-muted-foreground">{option.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>{currentPoll.totalVotes} total votes</span>
                    <span>Ends {formatDistanceToNow(currentPoll.endsAt, { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">{post.author.name}</span>
                            {post.author.verified && (
                              <Star className="w-4 h-4 text-primary fill-current" />
                            )}
                            <span className="text-sm text-muted-foreground">@{post.author.username}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          
                          {post.location && (
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{post.location}</span>
                            </div>
                          )}
                          
                          <p className="text-foreground mb-3 leading-relaxed">{post.content}</p>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-6">
                              <button
                                onClick={() => handleLike(post.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="text-sm">{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{post.comments}</span>
                              </button>
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">{post.shares}</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Who to Follow */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Who to Follow</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={suggestion.avatar} />
                          <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                            {suggestion.verified && (
                              <Star className="w-3 h-3 text-primary fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.followers.toLocaleString()} followers
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleFollow(suggestion.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>• 12 new civic discussions</p>
                    <p>• 5 new polls available</p>
                    <p>• 8 trending topics</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CivicFeed;