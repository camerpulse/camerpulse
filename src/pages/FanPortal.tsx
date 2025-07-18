import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Music, 
  Star, 
  Users, 
  PlayCircle,
  Plus
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FanProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  favorite_genres: string[];
  is_verified: boolean;
}

interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration: string;
  price: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  isPublic: boolean;
  coverImage: string;
}

interface Interaction {
  id: string;
  type: string;
  artistName: string;
  timestamp: string;
}

const FanPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fanProfile, setFanProfile] = useState<FanProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
  const [latestTracks, setLatestTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFanData();
    }
  }, [user]);

  const loadFanData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock fan profile - in a real app this would come from database
      setFanProfile({
        id: '1',
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Music Fan',
        avatar_url: '/placeholder.svg',
        bio: 'Music lover and supporter of Cameroonian artists',
        favorite_genres: ['Afrobeats', 'Bikutsi', 'Makossa'],
        is_verified: false
      });

      // Mock wallet balance
      setWalletBalance(5000);

      // Load artists from existing artist_memberships table
      const { data: artistsData } = await supabase
        .from('artist_memberships')
        .select('id, stage_name')
        .eq('membership_active', true)
        .limit(8);

      if (artistsData) {
        setTrendingArtists(artistsData.map(artist => ({
          id: artist.id,
          name: artist.stage_name,
          image: '/placeholder.svg',
          followers: Math.floor(Math.random() * 10000) + 1000
        })));
      }

      // Mock latest tracks
      setLatestTracks([
        {
          id: '1',
          title: 'Cameroon Pride',
          artist: 'Various Artists',
          image: '/placeholder.svg',
          duration: '3:45',
          price: 1000
        },
        {
          id: '2',
          title: 'Afrobeat Vibes',
          artist: 'Local Heroes',
          image: '/placeholder.svg',
          duration: '4:20',
          price: 800
        }
      ]);

      // Mock playlists
      setPlaylists([
        {
          id: '1',
          name: 'My Favorites',
          description: 'Best Cameroonian tracks',
          trackCount: 25,
          isPublic: false,
          coverImage: '/placeholder.svg'
        },
        {
          id: '2',
          name: 'Workout Mix',
          description: 'High energy music',
          trackCount: 15,
          isPublic: true,
          coverImage: '/placeholder.svg'
        }
      ]);

      // Mock interactions
      setInteractions([
        {
          id: '1',
          type: 'like',
          artistName: 'Popular Artist',
          timestamp: new Date().toLocaleDateString()
        },
        {
          id: '2',
          type: 'follow',
          artistName: 'Rising Star',
          timestamp: new Date().toLocaleDateString()
        }
      ]);

    } catch (error) {
      console.error('Error loading fan data:', error);
      toast({
        title: 'Error',
        description: 'Could not load fan portal data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Fan Portal</h1>
        <p className="text-muted-foreground mb-6">Please log in to access your fan dashboard</p>
        <Button onClick={() => navigate('/auth')}>Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading Fan Portal...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Fan Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Your gateway to supporting Cameroonian artists
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate('/camerplay')}>
            <Music className="h-4 w-4 mr-2" />
            Explore Music
          </Button>
          <Button variant="outline" onClick={() => navigate('/camerplay/awards')}>
            <Star className="h-4 w-4 mr-2" />
            Vote Awards
          </Button>
        </div>
      </div>

      {/* Fan Profile Card */}
      {fanProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <img 
                src={fanProfile.avatar_url} 
                alt="Profile" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle className="flex items-center gap-2">
                  {fanProfile.display_name}
                  {fanProfile.is_verified && <Star className="h-4 w-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription>{fanProfile.bio}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(walletBalance)}</p>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{playlists.length}</p>
                <p className="text-sm text-muted-foreground">Playlists</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{trendingArtists.length}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Favorite Genres:</p>
              <div className="flex flex-wrap gap-2">
                {fanProfile.favorite_genres.map(genre => (
                  <Badge key={genre} variant="outline">{genre}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Latest Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Latest Tracks
              </CardTitle>
              <CardDescription>
                Discover new music from Cameroonian artists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestTracks.map(track => (
                  <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img 
                      src={track.image} 
                      alt={track.title}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                      <p className="text-sm text-muted-foreground">{track.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(track.price)}</p>
                      <Button size="sm" variant="outline">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* User Playlists */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    My Playlists
                  </CardTitle>
                  <CardDescription>
                    Your curated music collections
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <Card key={playlist.id}>
                    <CardContent className="p-4">
                      <img 
                        src={playlist.coverImage} 
                        alt={playlist.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h3 className="font-semibold">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant={playlist.isPublic ? 'default' : 'outline'}>
                          {playlist.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {playlist.trackCount} tracks
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists" className="space-y-6">
          {/* Following Artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Trending Artists
              </CardTitle>
              <CardDescription>
                Discover and follow your favorite artists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingArtists.map(artist => (
                  <Card key={artist.id}>
                    <CardContent className="p-4 text-center">
                      <img 
                        src={artist.image} 
                        alt={artist.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3"
                      />
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {artist.followers.toLocaleString()} followers
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest interactions with artists and music
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions.map(interaction => (
                  <div key={interaction.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {interaction.type === 'like' ? (
                        <Heart className="h-4 w-4 text-red-500" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {interaction.type === 'like' ? 'Liked' : 'Followed'} {interaction.artistName}
                      </p>
                      <p className="text-sm text-muted-foreground">{interaction.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FanPortal;